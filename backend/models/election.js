import mongoose from "mongoose";

const electionSchema = new mongoose.Schema({
  electionID: { type: String, required: true, unique: true },
  status: { type: String, enum: ["open", "closed"], default: "open" },
  startDate: { type: Date, required: true, default: Date.now },
  endDate: { type: Date },
  totalVotes: { type: Number, default: 0 },
  winnerID: { type: String, default: null }
}, { timestamps: true });

const Election = mongoose.model("Election", electionSchema);
export default Election;
