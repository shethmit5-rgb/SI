const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Team = require("../models/Team");
const User = require("../models/User");

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/ArenaSync";
    await mongoose.connect(mongoUri);

    const player = await User.findOne({ email: "player_test@example.com" });
    if (!player) {
      console.log("Player not found");
      process.exit(0);
    }
    console.log("Player ID:", player._id.toString());

    const team = await Team.findOne({ teamName: "Test Team" });
    if (!team) {
      console.log("Team 'Test Team' not found");
      process.exit(0);
    }
    console.log("Team ID:", team._id.toString());
    console.log("Team Joining Fee:", team.playerJoiningFee);

    const playerRecord = team.players.find(p => p.userId.toString() === player._id.toString());
    if (!playerRecord) {
      console.log("Player not found in team's players list");
    } else {
      console.log("Player status in team:", playerRecord.status);
      console.log("Player paymentStatus in team:", playerRecord.paymentStatus);
      console.log("Player paymentDeadline:", playerRecord.paymentDeadline);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error checking player status:", error);
    process.exit(1);
  }
}

run();
