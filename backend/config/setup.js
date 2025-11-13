import { enrollAdmin } from './enrollAdmin.js';

const setup = async () => {
  try {
    console.log('🚀 Setting up Fabric connection...');
    await enrollAdmin();
    console.log('✅ Setup completed successfully!');
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
};

setup();