const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Tournament = require("./models/Tournament");
const Team = require("./models/Team");
const Registration = require("./models/Registration");
const Transaction = require("./models/Transaction");

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ArenaSync");
    console.log("Connected to MongoDB.");

    const tournament = await Tournament.findOne({ eventName: "Fresh E2E Tournament 2026" });
    if (!tournament) {
      console.error("Tournament not found!");
      process.exit(1);
    }

    const coach2 = await User.findOne({ email: "fresh_coach2@example.com" });
    const player2 = await User.findOne({ email: "fresh_player2@example.com" });

    if (!coach2 || !player2) {
      console.error("Coach 2 or Player 2 not found!");
      process.exit(1);
    }

    // Clean up any old team/registrations for Coach 2
    await Team.deleteMany({ captainId: coach2._id });
    await Registration.deleteMany({ userId: coach2._id });
    await Transaction.deleteMany({ userId: { $in: [coach2._id, player2._id] } });

    // Create Team 2
    const team = await Team.create({
      teamName: "Fresh Coach 2's Team",
      tournamentId: tournament._id,
      sportId: tournament.sportId,
      captainId: coach2._id,
      playerJoiningFee: 100,
      players: [
        {
          userId: player2._id,
          status: "approved",
          paymentStatus: "Paid",
          paymentDeadline: null
        }
      ]
    });
    console.log("Team 2 created.");

    // Create Registration for Team 2
    const reg = await Registration.create({
      userId: coach2._id,
      tournamentId: tournament._id,
      teamId: team._id,
      approvalStatus: "approved",
      paymentStatus: "Paid",
      amount: 1000,
      paidAt: new Date(),
      razorpayOrderId: "ord_mock_coach2",
      razorpayPaymentId: "pay_mock_coach2",
      razorpaySignature: "sig_mock_coach2"
    });
    console.log("Team 2 registration created.");

    // Add Team 2 to Tournament teams list
    await Tournament.findByIdAndUpdate(tournament._id, {
      $addToSet: { teams: team._id }
    });
    console.log("Added Team 2 to Tournament.");

    // Create Coach 2 Registration Transaction
    await Transaction.create({
      userId: coach2._id,
      tournamentId: tournament._id,
      teamId: team._id,
      registrationId: reg._id,
      paymentType: "team_registration",
      amount: 1000,
      status: "paid",
      razorpayOrderId: "ord_mock_coach2",
      razorpayPaymentId: "pay_mock_coach2",
      razorpaySignature: "sig_mock_coach2"
    });

    // Create Player 2 Joining Transaction
    await Transaction.create({
      userId: player2._id,
      teamId: team._id,
      paymentType: "player_joining",
      amount: 100,
      status: "paid",
      razorpayOrderId: "ord_mock_player2",
      razorpayPaymentId: "pay_mock_player2",
      razorpaySignature: "sig_mock_player2"
    });
    console.log("Transactions for Coach 2 and Player 2 created.");

    console.log("Programmatic seeding of Team 2 completed successfully.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding Team 2 failed:", err);
    process.exit(1);
  }
}

run();
