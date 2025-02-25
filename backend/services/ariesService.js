// ariesService.js - Handles Aries Agent Operations
import setupAriesAgent from "../ariesAgent.js";

// Create a new Voter DID
export const createVoterDID = async () => {
    try {
        const agent = await setupAriesAgent();
        const { did, verkey } = await agent.wallet.createDid();
        console.log(`✅ New Voter DID Created: ${did}`);
        return { did, verkey };
    } catch (error) {
        console.error("❌ Error creating voter DID:", error);
        throw error;
    }
};

// Issue a Voter Credential
export const issueVoterCredential = async (voterDID) => {
    try {
        const agent = await setupAriesAgent();
        
        const credential = {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "type": ["VerifiableCredential", "VoterCredential"],
            "credentialSubject": { id: voterDID, voterEligibility: "true" },
        };

        console.log(`✅ Issuing credential for voter ${voterDID}`);
        await agent.credentials.issueCredential({
            credential,
            comment: "Voter Credential Issuance",
            connectionId: "connection-id", // Replace with actual connectionId
        });

        return credential;
    } catch (error) {
        console.error("❌ Error issuing credential:", error);
        throw error;
    }
};

// List all DIDs
export const listDIDs = async () => {
    try {
        const agent = await setupAriesAgent();
        const dids = await agent.wallet.listDids();
        console.log(`✅ DIDs Retrieved: ${dids.length}`);
        return dids;
    } catch (error) {
        console.error("❌ Error retrieving DIDs:", error);
        throw error;
    }
};
