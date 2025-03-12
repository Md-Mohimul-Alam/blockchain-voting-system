import axios from "axios";

/**
 * 🔹 Issue a Verifiable Credential using Aries
 */
export const issueVoterCredential = async (did, role) => {
  try {
    const response = await axios.post("http://localhost:8031/issue-credential", {
      did,
      role
    });

    console.log(`✅ Credential Issued: ${response.data}`);
  } catch (error) {
    console.error("❌ Error Issuing Credential:", error);
  }
};

/**
 * 🔹 Verify a Verifiable Credential using Aries
 */
export const verifyCredential = async (did) => {
  try {
    const response = await axios.get(`http://localhost:8031/verify-credential/${did}`);

    return response.data.verified;
  } catch (error) {
    console.error("❌ Error Verifying Credential:", error);
    return false;
  }
};
