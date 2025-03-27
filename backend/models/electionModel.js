import mongoose from "mongoose";

const electionSchema = new mongoose.Schema(
  {
    electionID: { type: String, required: true, unique: true },
    status: { type: String, enum: ["open", "closed"], required: true },
    startDate: { type: Date, required: true },
    winner: { type: String, default: null },
  },
  { timestamps: true }
);

const Election = mongoose.model("Election", electionSchema);
export default Election;
