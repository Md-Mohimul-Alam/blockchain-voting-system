import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    did: { type: String, required: true, unique: true },
    userName: { type: String, required: true },
    dob: { type: Date, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
