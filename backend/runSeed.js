const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { seedUsers } = require("./utils/seedData");

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/ArenaSync";

console.log("Connecting to database:", mongoUri);
mongoose.connect(mongoUri)
  .then(async () => {
    console.log("✅ Connected to MongoDB.");
    await seedUsers();
    console.log("🔌 Disconnecting from database...");
    await mongoose.disconnect();
    console.log("🏁 Done!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  });
