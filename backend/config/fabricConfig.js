'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Import CA Utility functions
const { buildCAClient, enrollAdmin, registerAndEnrollUser } = require('../../blockchain/fabric-samples/test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../blockchain/fabric-samples/test-application/javascript/AppUtil.js');

// Load Fabric network connection profile
const ccpPath = path.resolve(__dirname, '../../blockchain/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

// Load network variables
const channelName = process.env.FABRIC_CHANNEL || 'mychannel';
const chaincodeName = process.env.FABRIC_CHAINCODE_NAME || 'voting-contract';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, '../wallet');
const org1UserId = 'javascriptAppUser';

async function getContract() {
    try {
        // Ensure CA exists
        if (!ccp.certificateAuthorities || !ccp.certificateAuthorities['ca.org1.example.com']) {
            throw new Error("❌ Certificate Authority (CA) information is missing from connection profile.");
        }

        // Get CA client
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Build Wallet
        const wallet = await buildWallet(Wallets, walletPath);

        // Enroll Admin and Register User
        await enrollAdmin(ca, wallet, mspOrg1);
        await registerAndEnrollUser(ca, wallet, mspOrg1, org1UserId, 'org1.department1');

        // Connect to Gateway
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: org1UserId,
            discovery: { enabled: true, asLocalhost: true }
        });

        // Get Network and Contract
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);

        return contract;
    } catch (error) {
        console.error('❌ Failed to connect to Fabric network:', error);
        throw error;
    }
}

module.exports = { getContract };
