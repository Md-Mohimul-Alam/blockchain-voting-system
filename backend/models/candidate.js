import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  candidateID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  logo: { type: String }, // File path
  votes: { type: Number, default: 0 },
});

const Candidate = mongoose.model("Candidate", candidateSchema);
export default Candidate;
