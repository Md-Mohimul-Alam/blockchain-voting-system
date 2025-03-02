// seedVoters.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Voter from "./models/voterModel.js"; // Adjust the path if needed

dotenv.config();

const seedVoters = async () => {
  try {
    // Connect to MongoDB using the URI from .env
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected for seeding voters.");

    // Define an array with 5 initial voters
    const voters = [
      { did: "voter1", hasVoted: false },
      { did: "voter2", hasVoted: false },
      { did: "voter3", hasVoted: false },
      { did: "voter4", hasVoted: false },
      { did: "voter5", hasVoted: false },
    ];

    // Remove any existing voters (optional, for a clean start)
    await Voter.deleteMany({});
    console.log("✅ Cleared existing voters.");

    // Insert the new voters
    await Voter.insertMany(voters);
    console.log("✅ 5 initial voters have been seeded successfully.");

    // Disconnect and exit
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding voters:", error);
    process.exit(1);
  }
};

seedVoters();
