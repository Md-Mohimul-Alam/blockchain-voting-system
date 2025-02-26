import { createVoterDID, issueVoterCredential, listDIDs } from "../services/ariesService.js";

export const createVoterDIDController = async (req, res) => {
  try {
    const didData = await createVoterDID();
    res.json(didData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const issueVoterCredentialController = async (req, res) => {
  try {
    const { voterDID } = req.body;
    const credentialData = await issueVoterCredential(voterDID);
    res.json(credentialData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listDIDsController = async (req, res) => {
  try {
    const dids = await listDIDs();
    res.json({ dids });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
