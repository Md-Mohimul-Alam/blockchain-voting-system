import mongoose from "mongoose";

const voterSchema = new mongoose.Schema({
    did: { type: String, required: true, unique: true },
    hasVoted: { type: Boolean, default: false }
});

const Voter = mongoose.model("Voter", voterSchema);

export default Voter; // ✅ Use `export default` for ES Modules
