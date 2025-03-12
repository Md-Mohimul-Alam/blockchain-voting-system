import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  voterDID: { type: String, required: true, unique: true },
  candidateID: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Vote = mongoose.model("Vote", voteSchema);
export default Vote;
