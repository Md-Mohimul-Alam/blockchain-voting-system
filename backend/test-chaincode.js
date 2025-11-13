// test-chaincode.js
import { getContract } from './config/fabricConfig.js';

async function testChaincode() {
    try {
        console.log('🧪 Testing chaincode connection...');
        
        const contract = await getContract();
        console.log('✅ Contract obtained successfully');
        
        // Test a simple query first
        console.log('🔍 Testing getAllElections query...');
        try {
            const result = await contract.evaluateTransaction('getAllElections');
            console.log('✅ Query successful:', result.toString());
        } catch (queryError) {
            console.log('❌ Query failed:', queryError.message);
        }
        
        // Try initLedger
        console.log('⚡ Testing initLedger...');
        try {
            const result = await contract.submitTransaction('initLedger');
            console.log('✅ initLedger successful:', result.toString());
        } catch (initError) {
            console.log('❌ initLedger failed:', initError.message);
        }
        
        // Test registerUser
        console.log('👤 Testing registerUser...');
        try {
            const result = await contract.submitTransaction(
                'registerUser', 
                'voter', 
                'test123', 
                'Test User', 
                '2000-01-01', 
                'Test City', 
                'testuser', 
                'password123', 
                ''
            );
            console.log('✅ registerUser successful:', result.toString());
        } catch (registerError) {
            console.log('❌ registerUser failed:', registerError.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testChaincode();