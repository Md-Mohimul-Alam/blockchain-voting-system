import pkg from 'fabric-network';
const { FabricCAServices, Wallets } = pkg;
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const enrollAdmin = async () => {
  try {
    console.log('🔧 Starting admin enrollment...');
    
    // Load connection profile
    const ccpPath = path.join(__dirname, '..', '..', 'blockchain', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    
    console.log('📁 Looking for connection profile at:', ccpPath);
    
    if (!fs.existsSync(ccpPath)) {
      throw new Error(`Connection profile not found at: ${ccpPath}`);
    }
    
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Create CA client
    const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

    // Create wallet
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`✅ Wallet path: ${walletPath}`);

    // Check if admin already exists
    const adminIdentity = await wallet.get('admin');
    if (adminIdentity) {
      console.log('✅ Admin identity already exists in wallet');
    } else {
      // Enroll admin
      console.log('🔄 Enrolling admin user...');
      const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
      const x509Identity = {
        credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes(),
        },
        mspId: 'Org1MSP',
        type: 'X.509',
      };
      await wallet.put('admin', x509Identity);
      console.log('✅ Successfully enrolled admin user and imported it into the wallet');
    }

    // Check if javascriptAppUser already exists
    const userIdentity = await wallet.get('javascriptAppUser');
    if (userIdentity) {
      console.log('✅ javascriptAppUser identity already exists in wallet');
      return;
    }

    console.log('🔄 Registering javascriptAppUser...');
    
    // Register and enroll javascriptAppUser
    const adminUser = await wallet.get('admin');
    if (!adminUser) {
      throw new Error('Admin user not found in wallet');
    }

    const provider = wallet.getProviderRegistry().getProvider(adminUser.type);
    const adminUserContext = await provider.getUserContext(adminUser, 'admin');

    // Register the user
    const secret = await ca.register({
      affiliation: 'org1.department1',
      enrollmentID: 'javascriptAppUser',
      role: 'client'
    }, adminUserContext);

    // Enroll the user
    console.log('🔄 Enrolling javascriptAppUser...');
    const userEnrollment = await ca.enroll({
      enrollmentID: 'javascriptAppUser',
      enrollmentSecret: secret
    });

    const userX509Identity = {
      credentials: {
        certificate: userEnrollment.certificate,
        privateKey: userEnrollment.key.toBytes(),
      },
      mspId: 'Org1MSP',
      type: 'X.509',
    };

    await wallet.put('javascriptAppUser', userX509Identity);
    console.log('✅ Successfully registered and enrolled user javascriptAppUser and imported it into the wallet');

  } catch (error) {
    console.error(`❌ Failed to enroll admin: ${error.message}`);
    throw error;
  }
};

export { enrollAdmin };