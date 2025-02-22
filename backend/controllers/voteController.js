const { getContract } = require('../config/fabricConfig');
const Voter = require('../models/voterModel');

/**
 * Register a new candidate
 */
const registerCandidate = async (req, res) => {
    const { candidateID, name } = req.body;
    try {
        const contract = await getContract();
        await contract.submitTransaction('registerCandidate', candidateID, name);
        res.json({ message: `✅ Candidate ${name} registered successfully.` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Cast a vote
 */
const vote = async (req, res) => {
    const { voterDID, candidateID } = req.body;
    try {
        const voter = await Voter.findOne({ did: voterDID });
        if (voter && voter.hasVoted) {
            return res.status(400).json({ error: "❌ Voter has already voted" });
        }

        const contract = await getContract();
        await contract.submitTransaction('vote', voterDID, candidateID);

        await Voter.updateOne({ did: voterDID }, { hasVoted: true }, { upsert: true });
        res.json({ message: "✅ Vote cast successfully!" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Delete a candidate
 */
const deleteCandidate = async (req, res) => {
    const { candidateID } = req.body;
    try {
        const contract = await getContract();
        await contract.submitTransaction('deleteCandidate', candidateID);
        res.json({ message: `✅ Candidate ${candidateID} deleted successfully.` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Update candidate name
 */
const updateCandidate = async (req, res) => {
    const { candidateID, newName } = req.body;
    try {
        const contract = await getContract();
        await contract.submitTransaction('updateCandidate', candidateID, newName);
        res.json({ message: `✅ Candidate ${candidateID} updated to ${newName}.` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Close the voting process & return results
 */
const closeVoting = async (req, res) => {
    try {
        const contract = await getContract();
        const results = await contract.submitTransaction('closeVoting');
        res.json(JSON.parse(results.toString()));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Retrieve final election results
 */
const getResults = async (req, res) => {
    try {
        const contract = await getContract();
        const results = await contract.evaluateTransaction('getResults');
        res.json(JSON.parse(results.toString()));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Retrieve all candidates and their vote counts
 */
const getCandidates = async (req, res) => {
    try {
        const contract = await getContract();
        const result = await contract.evaluateTransaction("getAllCandidates");
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        console.error("❌ Error getting candidates:", error);
        res.status(500).json({ error: "Failed to fetch candidates" });
    }
};

/**
 * Get voter vote record
 */
const getVoterVote = async (req, res) => {
    const { voterDID } = req.params;
    try {
        const contract = await getContract();
        const result = await contract.evaluateTransaction('getVoterVote', voterDID);
        res.json({ message: result.toString() });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Reset election (Delete all candidates and votes)
 */
const resetElection = async (req, res) => {
    try {
        const contract = await getContract();
        await contract.submitTransaction('resetElection');
        res.json({ message: "✅ Election has been reset successfully." });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// ✅ Fix: Export all functions
module.exports = {
    registerCandidate,
    deleteCandidate,
    updateCandidate,
    vote,
    closeVoting,
    getResults,
    getCandidates,
    getVoterVote,
    resetElection
};
