import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    did: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    logo: { type: String },
    birthplace: { type: String },
  },
  { timestamps: true }
);

const Candidate = mongoose.model("Candidate", candidateSchema);
export default Candidate;
