// config/fabricConfig.js - FIXED ENDORSEMENT ISSUE
import { Gateway, Wallets } from 'fabric-network';
import FabricCAServices from 'fabric-ca-client';
import * as path from 'path';
import { buildCCPOrg1, buildWallet } from '../utils/AppUtil.js';
import { enrollAdmin, registerAndEnrollUser, buildCAClient } from '../utils/CAUtil.js';

const channelName = 'mychannel';
const chaincodeName = 'voting-contract';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(process.cwd(), 'wallet');
const org1UserId = 'javascriptAppUser';

// Enhanced user enrollment
const ensureUserEnrolled = async (caClient, wallet, userId) => {
  try {
    const userIdentity = await wallet.get(userId);
    if (userIdentity) {
      console.log(`✅ User ${userId} already exists in wallet`);
      return true;
    }

    console.log(`👤 Registering user ${userId}...`);
    const adminIdentity = await wallet.get('admin');
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');

    try {
      const secret = await caClient.register({
        affiliation: 'org1.department1',
        enrollmentID: userId,
        role: 'client'
      }, adminUser);
      
      const enrollment = await caClient.enroll({
        enrollmentID: userId,
        enrollmentSecret: secret
      });
      
      const userIdentity = {
        credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes(),
        },
        mspId: mspOrg1,
        type: 'X.509',
      };
      
      await wallet.put(userId, userIdentity);
      console.log(`✅ Successfully registered and enrolled user ${userId}`);
      
    } catch (registerError) {
      if (registerError.errors && registerError.errors[0]?.code === 74) {
        console.log(`🔄 User ${userId} already registered in CA, enrolling directly...`);
        const enrollment = await caClient.enroll({
          enrollmentID: userId,
          enrollmentSecret: 'javascriptAppUserPW'
        });
        
        const userIdentity = {
          credentials: {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes(),
          },
          mspId: mspOrg1,
          type: 'X.509',
        };
        
        await wallet.put(userId, userIdentity);
        console.log(`✅ Successfully enrolled existing user ${userId}`);
      } else {
        throw registerError;
      }
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to enroll user ${userId}:`, error.message);
    throw error;
  }
};

// In config/fabricConfig.js - Enhanced connection
export const getContractSmart = async () => {
  try {
    console.log('🔧 Connecting to Fabric...');
    
    const ccp = buildCCPOrg1();
    const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
    const wallet = await buildWallet(Wallets, walletPath);
    
    // Ensure admin exists
    const identities = await wallet.list();
    if (identities.length === 0 || !identities.includes('admin')) {
      console.log('🔄 Enrolling admin...');
      await enrollAdmin(caClient, wallet, mspOrg1);
    } else {
      console.log('✅ Admin already exists in wallet');
    }

    await ensureUserEnrolled(caClient, wallet, org1UserId);

    const gateway = new Gateway();
    
    // Enhanced connection with better error handling
    await gateway.connect(ccp, {
      wallet,
      identity: org1UserId,
      discovery: { 
        enabled: true, 
        asLocalhost: true 
      },
      eventHandlerOptions: {
        commitTimeout: 10000, // Increased timeout
        endorseTimeout: 30000,
        strategy: null
      },
      queryHandlerOptions: {
        timeout: 30000
      }
    });

    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    console.log('✅ Fabric connection successful');
    
    // Skip initialization for now to avoid issues
    console.log('⏭️  Skipping ledger initialization');
    
    return contract;
    
  } catch (error) {
    console.error('❌ Fabric connection failed:', error);
    throw error;
  }
};
// In fabricConfig.js - Add network health check
export const checkNetworkHealth = async () => {
  try {
    const gateway = new Gateway();
    
    const connectionProfile = await getConnectionProfile();
    const connectionOptions = await getConnectionOptions();
    
    await gateway.connect(connectionProfile, connectionOptions);
    
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('voting-contract');
    
    // Test query to check network health
    await contract.evaluateTransaction('getAllElections');
    
    await gateway.disconnect();
    
    return {
      healthy: true,
      message: 'Network is responsive and chaincode is accessible'
    };
  } catch (error) {
    return {
      healthy: false,
      message: `Network health check failed: ${error.message}`,
      error: error.message
    };
  }
};

export const getContractWithRetry = getContractSmart;