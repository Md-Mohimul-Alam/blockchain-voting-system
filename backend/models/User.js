import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  nid: { type: String, required: true, unique: true }, // DID will be stored here
  password: { type: String, required: true }, // Password is the same as DID
  role: { type: String, enum: ["admin", "user"], default: "user" }
});

export default mongoose.model("User", UserSchema);
