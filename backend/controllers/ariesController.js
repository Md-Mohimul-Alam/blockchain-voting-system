// ariesController.js - Handles API Requests for Aries Agent
import { createVoterDID, issueVoterCredential, listDIDs } from "../services/ariesService.js";

// Create a New Voter DID (API Endpoint)
export const createVoterDIDController = async (req, res) => {
    try {
        const didData = await createVoterDID();
        res.json(didData);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Issue a Voter Credential (API Endpoint)
export const issueVoterCredentialController = async (req, res) => {
    try {
        const { voterDID } = req.body;
        const credentialData = await issueVoterCredential(voterDID);
        res.json(credentialData);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// List All DIDs (API Endpoint)
export const listDIDsController = async (req, res) => {
    try {
        const dids = await listDIDs();
        res.json({ dids });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
