import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  did: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  district: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "voter"], required: true },
  hasVoted: { type: Boolean, default: false },
});

// ✅ Check if model already exists before defining it
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
