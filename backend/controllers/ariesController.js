import User from "../models/User.js";

export const registerUser = async (req, res) => {
  try {
    const { nid, password } = req.body;

    let user = await User.findOne({ nid });
    if (user) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const newUser = new User({ nid, password });
    await newUser.save();

    res.status(201).json({ success: true, message: "Registration successful" });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
