const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ArenaSync");
    console.log("Connected to MongoDB.");

    const freshEmails = ["fresh_coach2@example.com", "fresh_player2@example.com"];
    await User.deleteMany({ email: { $in: freshEmails } });
    console.log("Cleaned up old extra fresh users.");

    const hashedPassword = await bcrypt.hash("Password123!", 10);

    const coach2 = await User.create({
      name: "Fresh Coach 2",
      email: "fresh_coach2@example.com",
      password: hashedPassword,
      role: "coach",
      phoneNumber: "+919000000005",
      isPhoneVerified: true,
      emailVerified: true,
      status: "active"
    });

    const player2 = await User.create({
      name: "Fresh Player 2",
      email: "fresh_player2@example.com",
      password: hashedPassword,
      role: "player",
      phoneNumber: "+919000000006",
      isPhoneVerified: true,
      emailVerified: true,
      status: "active"
    });

    console.log("Extra fresh Coach 2 and Player 2 created successfully.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error creating extra users:", error);
    process.exit(1);
  }
}

run();
