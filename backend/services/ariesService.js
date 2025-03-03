import setupAriesAgent from "../ariesAgent.js";
import User from "../models/User.js"; // Import User Model

// Create Voter DID (DID will be used as both NID and password)
export const createVoterDID = async (nid) => {
  try {
    const agent = await setupAriesAgent();
    const { did, verkey } = await agent.wallet.createDid();
    console.log(`✅ New Voter DID Created: ${did}`);

    // Ensure user does not already exist
    let user = await User.findOne({ nid });
    if (user) {
      console.error("❌ User with this NID already exists!");
      throw new Error("User already exists");
    }

    // Save user with DID as NID and password
    user = new User({
      nid: did, // DID is the user ID
      password: did, // Password is also the DID
      role: "user",
    });

    await user.save();
    return { did, verkey };
  } catch (error) {
    console.error("❌ Error creating voter DID:", error);
    throw error;
  }
};

// Issue Voter Credential for a given DID
export const issueVoterCredential = async (voterDID) => {
  try {
    const agent = await setupAriesAgent();

    // Ensure user exists before issuing a credential
    const user = await User.findOne({ nid: voterDID });
    if (!user) {
      console.error(`❌ No user found with DID: ${voterDID}`);
      throw new Error("User not registered");
    }

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

// List all DIDs registered with the Aries Agent
export const listDIDs = async () => {
  try {
    const agent = await setupAriesAgent();
    const dids = await agent.wallet.listDids();
    console.log(`✅ DIDs Retrieved: ${dids.length}`);

    // Fetch registered users from the database
    const users = await User.find({}, "nid role");
    return { dids, registeredUsers: users };
  } catch (error) {
    console.error("❌ Error retrieving DIDs:", error);
    throw error;
  }
};