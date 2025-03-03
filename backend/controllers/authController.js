import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { createVoterDID, issueVoterCredential } from "../services/ariesService.js";

// Register User with Aries DID
export const registerUser = async (req, res) => {
  try {
    const { nid } = req.body; // The NID provided by the user

    // Generate a DID and use it as the user ID
    const didData = await createVoterDID(nid);
    const voterDID = didData.did;

    // Issue a Verifiable Credential for the user
    await issueVoterCredential(voterDID);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      voterDID
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Login User with DID as NID and Password
export const loginUser = async (req, res) => {
  const { nid, password } = req.body;

  try {
    const user = await User.findOne({ nid });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Since password = NID, we directly check equality
    if (password !== user.password) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      user: { id: user._id, nid: user.nid, role: user.role },
      token
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("❌ Profile Fetch Error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// List All Users and Their DIDs
export const listUsers = async (req, res) => {
  try {
    const users = await User.find({}, "nid role");
    res.json({ success: true, users });
  } catch (error) {
    console.error("❌ Error listing users:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};