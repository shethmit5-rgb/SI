const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Register all schemas first
const User = require("../models/User");
const Sport = require("../models/Sport");
const Venue = require("../models/Venue");
const Tournament = require("../models/Tournament");
const Team = require("../models/Team");
const Registration = require("../models/Registration");

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/ArenaSync";
    await mongoose.connect(mongoUri);

    const allRegs = await Registration.find().populate("teamId").populate("tournamentId");
    console.log(`Total registrations found: ${allRegs.length}`);

    for (let i = 0; i < allRegs.length; i++) {
      const reg = allRegs[i];
      console.log(`\n--- Registration ${i+1} ---`);
      console.log(`ID: ${reg._id}`);
      console.log(`userId: ${reg.userId}`);
      console.log(`tournamentId: ${reg.tournamentId?._id} (${reg.tournamentId?.eventName})`);
      console.log(`teamId: ${reg.teamId?._id} (${reg.teamId?.teamName})`);
      console.log(`captainId of team: ${reg.teamId?.captainId}`);
      console.log(`approvalStatus: ${reg.approvalStatus}`);
      console.log(`paymentStatus: ${reg.paymentStatus}`);
    }

    // Let's also check who the coach_test user is
    const coach = await User.findOne({ email: "coach_test@example.com" });
    if (coach) {
      console.log(`\nCoach User ID: ${coach._id.toString()}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error querying registrations:", error);
    process.exit(1);
  }
}

run();
