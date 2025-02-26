import setupAriesAgent from "../ariesAgent.js";

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

export const issueVoterCredential = async (voterDID) => {
  try {
    const agent = await setupAriesAgent();
    const credential = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential", "VoterCredential"],
      credentialSubject: { id: voterDID, voterEligibility: "true" },
    };
    console.log(`✅ Issuing credential for voter ${voterDID}`);
    await agent.credentials.issueCredential({
      credential,
      comment: "Voter Credential Issuance",
      connectionId: "your-connection-id", // Replace with a valid connection ID
    });
    return credential;
  } catch (error) {
    console.error("❌ Error issuing credential:", error);
    throw error;
  }
};

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
