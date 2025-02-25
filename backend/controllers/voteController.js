import { getContract } from "../config/fabricConfig.js";
import Voter from "../models/voterModel.js";

/**
 * Register a new candidate
 */
export const registerCandidate = async (req, res) => {
    const { candidateID, name } = req.body;
    try {
        const contract = await getContract();
        await contract.submitTransaction("registerCandidate", candidateID, name);
        res.json({ message: `✅ Candidate ${name} registered successfully.` });
    } catch (error) {
        console.error("❌ Error registering candidate:", error.message);
        res.status(400).json({ error: error.message });
    }
};

/**
 * Cast a vote
 */
export const vote = async (req, res) => {
    const { voterDID, candidateID } = req.body;
    try {
        const voter = await Voter.findOne({ did: voterDID });
        if (!voter) {
            return res.status(404).json({ error: "❌ Voter not found." });
        }

        if (voter.hasVoted) {
            return res.status(400).json({ error: "❌ Voter has already voted." });
        }

        const contract = await getContract();
        await contract.submitTransaction("vote", voterDID, candidateID);

        await Voter.updateOne({ did: voterDID }, { hasVoted: true }, { upsert: true });
        res.json({ message: "✅ Vote cast successfully!" });
    } catch (error) {
        console.error("❌ Error casting vote:", error.message);
        res.status(400).json({ error: error.message });
    }
};

/**
 * Delete a candidate
 */
export const deleteCandidate = async (req, res) => {
    const { candidateID } = req.body;
    try {
        const contract = await getContract();
        await contract.submitTransaction("deleteCandidate", candidateID);
        res.json({ message: `✅ Candidate ${candidateID} deleted successfully.` });
    } catch (error) {
        console.error("❌ Error deleting candidate:", error.message);
        res.status(400).json({ error: error.message });
    }
};

/**
 * Update candidate name
 */
export const updateCandidate = async (req, res) => {
    const { candidateID, newName } = req.body;
    try {
        const contract = await getContract();
        await contract.submitTransaction("updateCandidate", candidateID, newName);
        res.json({ message: `✅ Candidate ${candidateID} updated to ${newName}.` });
    } catch (error) {
        console.error("❌ Error updating candidate:", error.message);
        res.status(400).json({ error: error.message });
    }
};

/**
 * Close the voting process & return results
 */
export const closeVoting = async (req, res) => {
    try {
        const contract = await getContract();
        const results = await contract.submitTransaction("closeVoting");
        res.json(JSON.parse(results.toString()));
    } catch (error) {
        console.error("❌ Error closing voting:", error.message);
        res.status(400).json({ error: error.message });
    }
};

/**
 * Retrieve final election results
 */
export const getResults = async (req, res) => {
    try {
        const contract = await getContract();
        const results = await contract.evaluateTransaction("getResults");
        res.json(JSON.parse(results.toString()));
    } catch (error) {
        console.error("❌ Error fetching results:", error.message);
        res.status(400).json({ error: error.message });
    }
};

/**
 * Retrieve all candidates and their vote counts
 */
export const getCandidates = async (req, res) => {
    try {
        const contract = await getContract();
        const result = await contract.evaluateTransaction("getAllCandidates");
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        console.error("❌ Error getting candidates:", error.message);
        res.status(500).json({ error: "Failed to fetch candidates" });
    }
};

/**
 * Get voter vote record
 */
export const getVoterVote = async (req, res) => {
    const { voterDID } = req.params;
    try {
        const contract = await getContract();
        const result = await contract.evaluateTransaction("getVoterVote", voterDID);
        res.json({ message: result.toString() });
    } catch (error) {
        console.error("❌ Error fetching voter vote:", error.message);
        res.status(400).json({ error: error.message });
    }
};

/**
 * Reset election (Delete all candidates and votes)
 */
export const resetElection = async (req, res) => {
    try {
        const contract = await getContract();
        await contract.submitTransaction("resetElection");
        res.json({ message: "✅ Election has been reset successfully." });
    } catch (error) {
        console.error("❌ Error resetting election:", error.message);
        res.status(400).json({ error: error.message });
    }
};
