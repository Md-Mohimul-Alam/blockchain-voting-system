// utils/AppUtil.js
import fs from 'fs';
import path from 'path';

export const buildCCPOrg1 = () => {
    // Use absolute path to your connection profile
    const ccpPath = '/Users/mohimthesaesk/Documents/blockchain-voting-system/blockchain/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json';
    
    console.log(`🔍 Loading network configuration from: ${ccpPath}`);
    
    const fileExists = fs.existsSync(ccpPath);
    if (!fileExists) {
        throw new Error(`no such file or directory: ${ccpPath}`);
    }
    const contents = fs.readFileSync(ccpPath, 'utf8');

    // build a JSON object from the file contents
    const ccp = JSON.parse(contents);

    console.log(`✅ Loaded the network configuration located at ${ccpPath}`);
    return ccp;
};

export const buildCCPOrg2 = () => {
    // Use absolute path
    const ccpPath = '/Users/mohimthesaesk/Documents/blockchain-voting-system/blockchain/fabric-samples/test-network/organizations/peerOrganizations/org2.example.com/connection-org2.json';
    
    const fileExists = fs.existsSync(ccpPath);
    if (!fileExists) {
        throw new Error(`no such file or directory: ${ccpPath}`);
    }
    const contents = fs.readFileSync(ccpPath, 'utf8');

    const ccp = JSON.parse(contents);

    console.log(`✅ Loaded the network configuration located at ${ccpPath}`);
    return ccp;
};

export const buildWallet = async (Wallets, walletPath) => {
    // Create a new wallet: Note that wallet is for managing identities.
    let wallet;
    if (walletPath) {
        wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`✅ Built a file system wallet at ${walletPath}`);
    } else {
        wallet = await Wallets.newInMemoryWallet();
        console.log('✅ Built an in memory wallet');
    }

    return wallet;
};

export const prettyJSONString = (inputString) => {
    if (inputString) {
        return JSON.stringify(JSON.parse(inputString), null, 2);
    } else {
        return inputString;
    }
};