const mongoose = require("mongoose");

const RegistrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournament",
  },

  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },

  registrationDate: {
    type: Date,
    default: Date.now,
  },

  paymentStatus: {
    type: String,
    enum: ["paid", "unpaid"],
    default: "unpaid",
  },

  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
});

module.exports = mongoose.model("Registration", RegistrationSchema);
