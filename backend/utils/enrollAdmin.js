'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

// Load the connection profile
const ccpPath = path.resolve(__dirname, '../config/connection.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

async function main() {
    try {
        // Setup CA Client
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Setup Wallet
        const walletPath = path.join(__dirname, '../wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check if admin identity exists
        const adminIdentity = await wallet.get('admin');
        if (adminIdentity) {
            console.log('✅ Admin identity already exists in the wallet');
            return;
        }

        // Enroll Admin
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };

        // Store identity in Wallet
        await wallet.put('admin', identity);
        console.log('✅ Successfully enrolled admin user and stored in the wallet');
    } catch (error) {
        console.error('❌ Failed to enroll admin user:', error);
    }
}

// Run the function
main();
