const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const Sport = require("../models/Sport");
const Venue = require("../models/Venue");
const Tournament = require("../models/Tournament");
const Team = require("../models/Team");
const Sponsor = require("../models/Sponsor");
const Registration = require("../models/Registration");
const Transaction = require("../models/Transaction");
const Notification = require("../models/notification");
const Match = require("../models/Match");

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/ArenaSync";
    console.log("Connecting to MongoDB:", mongoUri);
    await mongoose.connect(mongoUri);

    const freshEmails = [
      "fresh_org@example.com",
      "fresh_coach@example.com",
      "fresh_player@example.com",
      "fresh_sponsor@example.com"
    ];

    console.log("Cleaning up previous fresh test data...");

    // Find users to get their IDs for cascading cleanup
    const usersToDelete = await User.find({ email: { $in: freshEmails } });
    const userIds = usersToDelete.map(u => u._id);

    // Clean up teams owned by fresh coach or containing fresh players
    await Team.deleteMany({
      $or: [
        { captainId: { $in: userIds } },
        { "players.userId": { $in: userIds } }
      ]
    });

    // Clean up registrations by fresh coach
    await Registration.deleteMany({ userId: { $in: userIds } });

    // Clean up sponsors by fresh sponsor
    await Sponsor.deleteMany({ sponsorId: { $in: userIds } });

    // Clean up transactions by fresh users
    await Transaction.deleteMany({ userId: { $in: userIds } });

    // Clean up notifications for fresh users
    await Notification.deleteMany({ userId: { $in: userIds } });

    // Delete fresh users themselves
    await User.deleteMany({ email: { $in: freshEmails } });

    // Clean up tournaments created by fresh organizer
    const tournamentsToDelete = await Tournament.find({ organizerId: { $in: userIds } });
    const tournamentIds = tournamentsToDelete.map(t => t._id);

    await Match.deleteMany({ tournamentId: { $in: tournamentIds } });
    await Tournament.deleteMany({ organizerId: { $in: userIds } });

    console.log("Cleaned up old fresh test data successfully.");

    // Hash Password
    const hashedPassword = await bcrypt.hash("Password123!", 10);

    // Create fresh users
    const organizer = await User.create({
      name: "Fresh Organizer",
      email: "fresh_org@example.com",
      password: hashedPassword,
      role: "organizer",
      phoneNumber: "+919000000001",
      isPhoneVerified: true,
      emailVerified: true,
      status: "active"
    });

    const coach = await User.create({
      name: "Fresh Coach",
      email: "fresh_coach@example.com",
      password: hashedPassword,
      role: "coach",
      phoneNumber: "+919000000002",
      isPhoneVerified: true,
      emailVerified: true,
      status: "active"
    });

    const player = await User.create({
      name: "Fresh Player",
      email: "fresh_player@example.com",
      password: hashedPassword,
      role: "player",
      phoneNumber: "+919000000003",
      isPhoneVerified: true,
      emailVerified: true,
      status: "active"
    });

    const sponsor = await User.create({
      name: "Fresh Sponsor",
      email: "fresh_sponsor@example.com",
      password: hashedPassword,
      role: "sponsor",
      phoneNumber: "+919000000004",
      isPhoneVerified: true,
      emailVerified: true,
      status: "active" // Make active directly so we don't have to verify/approve sponsor login
    });

    console.log("Fresh users created successfully.");

    // Ensure Sport exists
    let sport = await Sport.findOne({ name: "Cricket" });
    if (!sport) {
      sport = await Sport.create({
        name: "Cricket",
        type: "Outdoor",
        playersPerTeam: 11
      });
      console.log("Sport 'Cricket' created.");
    } else {
      console.log("Sport 'Cricket' already exists.");
    }

    // Ensure Venue exists
    let venue = await Venue.findOne({ name: "National Sports Center" });
    if (!venue) {
      venue = await Venue.create({
        name: "National Sports Center",
        address: "123 Stadium Road",
        capacity: 50000,
        type: "Outdoor"
      });
      console.log("Venue 'National Sports Center' created.");
    } else {
      console.log("Venue 'National Sports Center' already exists.");
    }

    console.log("Seeding fresh E2E test data completed successfully.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding fresh data:", error);
    process.exit(1);
  }
}

run();
