import { getContract } from "../config/fabricConfig.js";
import Election from "../models/electionModel.js";

// Create Election
export const createElection = async (req, res) => {
  const { electionID, status, startDate } = req.body;
  try {
    const contract = await getContract();
    
    // Create election in Hyperledger Fabric
    await contract.submitTransaction("createElection", electionID, status, startDate);

    // Store election data in MongoDB
    await Election.create({ electionID, status, startDate });

    res.status(201).json({ message: "Election created successfully" });
  } catch (error) {
    console.error("Error creating election:", error);
    res.status(500).json({ error: "Error creating election" });
  }
};

// Declare Winner
export const declareWinner = async (req, res) => {
  const { electionID } = req.params;
  try {
    const contract = await getContract();
    
    // Declare winner in Hyperledger Fabric
    const result = await contract.submitTransaction("declareWinner", electionID);

    // Update winner in MongoDB
    const election = await Election.findOneAndUpdate(
      { electionID },
      { winner: result.toString() },
      { new: true }
    );

    res.status(200).json({ message: `Winner declared: ${result.toString()}` });
  } catch (error) {
    console.error("Error declaring winner:", error);
    res.status(500).json({ error: "Error declaring winner" });
  }
};

// Close Election
export const closeElection = async (req, res) => {
  const { electionID } = req.params;
  try {
    const contract = await getContract();

    // Check if election exists in MongoDB
    const electionExists = await Election.findOne({ electionID });
    if (!electionExists) {
      return res.status(404).json({ error: `Election with ID ${electionID} does not exist` });
    }

    // Close election in Hyperledger Fabric
    await contract.submitTransaction("closeElection", electionID);

    // Update election status in MongoDB
    const updatedElection = await Election.findOneAndUpdate(
      { electionID },
      { status: "closed" },
      { new: true }
    );

    res.status(200).json({ message: `Election ${electionID} has been closed successfully.`, election: updatedElection });
  } catch (error) {
    console.error("Error closing election:", error);
    res.status(500).json({ error: "Error closing election" });
  }
};

// Reset Election
export const resetElection = async (req, res) => {
  const { electionID } = req.params;
  try {
    const contract = await getContract();

    // Check if election exists in MongoDB
    const electionExists = await Election.findOne({ electionID });
    if (!electionExists) {
      return res.status(404).json({ error: `Election with ID ${electionID} does not exist` });
    }

    // Prevent resetting if a winner is already declared
    if (electionExists.winner) {
      return res.status(400).json({ error: "Election cannot be reset after a winner is declared." });
    }

    // Reset election in Hyperledger Fabric
    await contract.submitTransaction("resetElection", electionID);

    // Update election status in MongoDB
    const updatedElection = await Election.findOneAndUpdate(
      { electionID },
      { status: "open" },
      { new: true }
    );

    res.status(200).json({ message: `Election ${electionID} has been reset successfully.`, election: updatedElection });
  } catch (error) {
    console.error("Error resetting election:", error);
    res.status(500).json({ error: "Error resetting election" });
  }
};
