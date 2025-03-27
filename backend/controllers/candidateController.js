import { getContract } from "../config/fabricConfig.js";
import Candidate from "../models/candidateModel.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ Ensure the "uploads/" folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files in `uploads/` folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage });

// ✅ Register Candidate (with Logo Upload)
export const createCandidate = async (req, res) => {
  const { did, name, dob, birthplace } = req.body;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Candidate logo is required" });
    }

    const logoPath = `/uploads/${req.file.filename}`; // Store logo file path

    const contract = await getContract();
    await contract.submitTransaction("createCandidate", did, name, dob, logoPath, birthplace);

    await Candidate.create({ did, name, dob, logo: logoPath, birthplace });

    res.status(201).json({ message: "Candidate registered successfully", logo: logoPath });
  } catch (error) {
    res.status(500).json({ error: "Error registering candidate" });
  }
};

// ✅ Get All Candidates
export const getAllCandidates = async (req, res) => {
  try {
    // Get contract instance
    const contract = await getContract();

    // Call the 'getAllCandidates' function in the smart contract
    const result = await contract.evaluateTransaction("getAllCandidates");

    console.log("Raw result from contract:", result.toString()); // Log the result for debugging

    // Handle empty result case
    if (!result || result.length === 0) {
      return res.status(404).json({ message: "No candidates found." });
    }

    // If the result is a buffer, decode it and parse as JSON
    let candidates;
    if (Buffer.isBuffer(result)) {
      candidates = JSON.parse(result.toString('utf-8'));  // Convert buffer to string and parse JSON
    } else {
      candidates = JSON.parse(result.toString()); // Parse if it's already a valid JSON string
    }

    // Return the candidates as a valid JSON response
    res.status(200).json(candidates);

  } catch (error) {
    // If error occurs during fetching, return error details in response
    console.error("Error fetching candidates:", error);
    res.status(500).json({ error: "Error fetching candidates", details: error.message });
  }
};

// ✅ Delete Candidate
export const deleteCandidate = async (req, res) => {
  const { did } = req.params;
  try {
    const contract = await getContract();

    const candidateExists = await Candidate.findOne({ did });
    if (!candidateExists) {
      return res.status(404).json({ error: `Candidate with DID ${did} does not exist` });
    }

    // ✅ Delete Logo File
    const logoPath = path.join(process.cwd(), candidateExists.logo);
    if (fs.existsSync(logoPath)) {
      fs.unlinkSync(logoPath); // Remove the file
    }

    await contract.submitTransaction("deleteCandidate", did);
    await Candidate.findOneAndDelete({ did });

    res.status(200).json({ message: `Candidate with DID ${did} has been deleted successfully.` });
  } catch (error) {
    res.status(500).json({ error: "Error deleting candidate" });
  }
};

// ✅ Update Candidate (with Optional Logo Update)
export const updateCandidate = async (req, res) => {
  const { did, name, dob, birthplace } = req.body;
  try {
    const contract = await getContract();

    const candidateExists = await Candidate.findOne({ did });
    if (!candidateExists) {
      return res.status(404).json({ error: `Candidate with DID ${did} does not exist` });
    }

    let updatedLogo = candidateExists.logo;

    // ✅ If New Logo is Uploaded, Replace the Old One
    if (req.file) {
      // Remove old logo file
      const oldLogoPath = path.join(process.cwd(), candidateExists.logo);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
      updatedLogo = `/uploads/${req.file.filename}`;
    }

    // ✅ Update in Hyperledger Fabric
    await contract.submitTransaction("updateCandidate", did, name, dob, updatedLogo, birthplace);

    // ✅ Update in MongoDB
    await Candidate.findOneAndUpdate({ did }, { name, dob, logo: updatedLogo, birthplace });

    res.status(200).json({ message: "Candidate details updated successfully", logo: updatedLogo });
  } catch (error) {
    res.status(500).json({ error: "Error updating candidate details" });
  }
};
