const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const User = require("./models/User");
const Tournament = require("./models/Tournament");
const Transaction = require("./models/Transaction");
const Registration = require("./models/Registration");
const Team = require("./models/Team");

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ArenaSync");
    console.log("Connected to MongoDB.");

    const tournaments = await Tournament.find({}).populate("organizerId", "name email");
    console.log(`\n=== TOURNAMENTS (${tournaments.length}) ===`);
    tournaments.forEach(t => {
      console.log(`- ID: ${t._id}, Name: "${t.eventName}", Status: "${t.status}", CreatedBy: ${t.organizerId?.email}, RegFee: ₹${t.teamRegistrationFee}`);
    });

    const transactions = await Transaction.find({}).populate("userId", "name email");
    console.log(`\n=== TRANSACTIONS (${transactions.length}) ===`);
    transactions.forEach(tx => {
      console.log(`- ID: ${tx._id}, User: ${tx.userId?.email}, Type: "${tx.paymentType}", Amount: ₹${tx.amount}, Status: "${tx.status}"`);
    });

    const registrations = await Registration.find({});
    console.log(`\n=== REGISTRATIONS (${registrations.length}) ===`);
    registrations.forEach(r => {
      console.log(`- ID: ${r._id}, Tournament: ${r.tournamentId}, Team: ${r.teamId}, Status: "${r.approvalStatus}", Payment: "${r.paymentStatus}"`);
    });

    const teams = await Team.find({});
    console.log(`\n=== TEAMS (${teams.length}) ===`);
    teams.forEach(t => {
      console.log(`- ID: ${t._id}, Name: "${t.teamName}", Tournament: ${t.tournamentId}, Captain: ${t.captainId}, JoiningFee: ₹${t.playerJoiningFee}, Players:`, t.players);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error("Check failed:", err);
  }
}

check();
