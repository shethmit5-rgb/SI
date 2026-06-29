const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Tournament = require("./models/Tournament");
const Transaction = require("./models/Transaction");

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ArenaSync");
    
    const org = await User.findOne({ email: "fresh_org@example.com" });
    console.log("Organizer User ID:", org ? org._id : "Not Found");

    const tournament = await Tournament.findOne({ eventName: "Fresh E2E Tournament 2026" }).populate("organizerId", "email");
    if (tournament) {
      console.log("Tournament Found:");
      console.log(`- ID: ${tournament._id}`);
      console.log(`- Name: ${tournament.eventName}`);
      console.log(`- CreatedBy: ${tournament.organizerId?.email}`);
      console.log(`- Status: ${tournament.status}`);
      console.log(`- TeamRegistrationFee: ₹${tournament.teamRegistrationFee}`);
      console.log(`- PaymentStatus: ${tournament.paymentStatus}`);
      console.log(`- AmountPaid: ₹${tournament.amountPaid}`);
    } else {
      console.log("Tournament NOT found!");
    }

    const txs = await Transaction.find({ userId: org ? org._id : null }).populate("tournamentId", "eventName");
    console.log(`\nTransactions for fresh organizer: ${txs.length}`);
    txs.forEach(t => {
      console.log(`- ID: ${t._id}, Type: ${t.paymentType}, Amount: ₹${t.amount}, Status: ${t.status}, Tournament: ${t.tournamentId?.eventName}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error("Check failed:", err);
  }
}

check();
