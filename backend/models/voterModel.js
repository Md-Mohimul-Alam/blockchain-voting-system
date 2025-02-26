import mongoose from "mongoose";

const voterSchema = new mongoose.Schema({
  did: { type: String, required: true, unique: true },
  hasVoted: { type: Boolean, default: false }
});

export default mongoose.model("Voter", voterSchema);
