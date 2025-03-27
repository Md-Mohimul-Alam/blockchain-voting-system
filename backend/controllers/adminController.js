import bcrypt from "bcryptjs";
import { getContract } from "../config/fabricConfig.js";
import User from "../models/userModel.js";

// Register Admin
export const registerAdmin = async (req, res) => {
  const { did, userName, dob, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const contract = await getContract();
    await contract.submitTransaction("registerAdmin", did, userName, dob, hashedPassword);
    
    await User.create({ did, userName, dob, password: hashedPassword, role: "admin" });

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error registering admin" });
  }
};

// Admin Login
export const loginAdmin = async (req, res) => {
  const { did, userName, dob, password } = req.body;
  try {
    const contract = await getContract();
    const result = await contract.evaluateTransaction("loginAdmin", did, userName, dob);
    
    const admin = JSON.parse(result.toString());
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Admin login successful" });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
};
// Update Admin Details
export const updateAdmin = async (req, res) => {
  const { did, userName, dob, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the new password

    const contract = await getContract();
    await contract.submitTransaction("updateAdmin", did, userName, dob, hashedPassword);

    // Update the admin details in MongoDB
    await User.findOneAndUpdate({ did }, { userName, dob, password: hashedPassword });

    res.status(200).json({ message: "Admin details updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating admin details" });
  }
};
