const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const Sport = require("../models/Sport");
const Venue = require("../models/Venue");
const Tournament = require("../models/Tournament");
const Team = require("../models/Team");
const Transaction = require("../models/Transaction");
const Notification = require("../models/notification");

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/ArenaSync";
    console.log("Connecting to", mongoUri);
    await mongoose.connect(mongoUri);

    // Clean up old test data
    await User.deleteMany({
      email: { $in: ["coach_test@example.com", "player_test@example.com", "admin_test@example.com", "organizer_test@example.com"] }
    });
    await Team.deleteMany({ teamName: "Test Team" });
    await Tournament.deleteMany({ eventName: "Summer Cricket Championship" });
    await Venue.deleteMany({ name: "National Sports Center" });
    await Sport.deleteMany({ name: "Cricket" });

    console.log("Cleaned up old test data");

    // Ensure Sport exists
    const cricket = await Sport.create({
      name: "Cricket",
      type: "Outdoor",
      playersPerTeam: 11
    });
    console.log("Created Sport: Cricket");

    // Ensure Venue exists
    const venue = await Venue.create({
      name: "National Sports Center",
      address: "123 Stadium Road",
      capacity: 50000,
      type: "Outdoor"
    });
    console.log("Created Venue: National Sports Center");

    const hashedPassword = await bcrypt.hash("Password123!", 10);

    // Create Coach
    const coach = await User.create({
      name: "Test Coach",
      email: "coach_test@example.com",
      password: hashedPassword,
      role: "coach",
      phoneNumber: "+919999999999",
      isPhoneVerified: true,
      emailVerified: true,
      status: "active"
    });
    console.log("Created Coach:", coach.email);

    // Create Player
    const player = await User.create({
      name: "Test Player",
      email: "player_test@example.com",
      password: hashedPassword,
      role: "player",
      phoneNumber: "+918888888888",
      isPhoneVerified: true,
      emailVerified: true,
      status: "active"
    });
    console.log("Created Player:", player.email);

    // Create Admin
    const admin = await User.create({
      name: "Test Admin",
      email: "admin_test@example.com",
      password: hashedPassword,
      role: "admin",
      phoneNumber: "+917777777777",
      isPhoneVerified: true,
      emailVerified: true,
      status: "active"
    });
    console.log("Created Admin:", admin.email);

    // Create Organizer
    const organizer = await User.create({
      name: "Test Organizer",
      email: "organizer_test@example.com",
      password: hashedPassword,
      role: "organizer",
      phoneNumber: "+916666666666",
      isPhoneVerified: true,
      emailVerified: true,
      status: "active"
    });
    console.log("Created Organizer:", organizer.email);

    // Create Tournament
    const tournament = await Tournament.create({
      eventName: "Summer Cricket Championship",
      sportId: cricket._id,
      venueId: venue._id,
      startDate: new Date(Date.now() + 86400000), // tomorrow
      endDate: new Date(Date.now() + 86400000 * 5),
      status: "upcoming",
      prizePool: 10000,
      createdBy: admin._id,
      organizerId: admin._id,
      teamRegistrationFee: 500,
      paymentStatus: "Paid"
    });
    console.log("Created Tournament: Summer Cricket Championship");

    await mongoose.disconnect();
    console.log("Finished successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
}

run();
