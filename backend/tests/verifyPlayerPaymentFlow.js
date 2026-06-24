const mongoose = require("mongoose");
const crypto = require("crypto");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Load models
const Team = require("../models/Team");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Notification = require("../models/notification");

// Setup controllers
const teamController = require("../controllers/teamController");

const uniqueSuffix = Date.now();
const assertions = [];

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  assertions.push(message);
}

// Mock structures
const mockRequest = (user, body, params = {}) => ({
  user: { userId: user._id.toString(), role: user.role },
  body,
  params,
  app: {
    get: (key) => {
      if (key === "io") return null;
      if (key === "users") return {};
      return null;
    }
  }
});

const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.jsonData = data;
    return res;
  };
  return res;
};

async function createMockUser(name, role) {
  const email = `${role}_${uniqueSuffix}_${Math.floor(Math.random() * 1000)}@example.com`;
  return await User.create({
    name,
    email,
    password: "password123",
    role,
    phoneNumber: `+1555${Math.floor(1000000 + Math.random() * 9000000)}`
  });
}

async function createMockTeam(name, captainId, playerJoiningFee) {
  return await Team.create({
    teamName: name,
    tournamentId: new mongoose.Types.ObjectId(),
    sportId: new mongoose.Types.ObjectId(),
    captainId,
    playerJoiningFee,
    players: []
  });
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ArenaSync");

    const coach = await createMockUser("Coach", "coach");
    const player = await createMockUser("Player", "player");
    const hacker = await createMockUser("Hacker", "player");
    const team = await createMockTeam("Test Team", coach._id, 100);

    // 1. Player join request creation
    let req = mockRequest(player, {}, { teamId: team._id.toString() });
    let res = mockResponse();
    await teamController.applyToTeam(req, res);
    
    let freshTeam = await Team.findById(team._id);
    let playerSub = freshTeam.players.find(p => p.userId.toString() === player._id.toString());
    assert(playerSub && playerSub.status === "pending", "1. Player join request creation");

    // 9. Pending player payment blocked
    req = mockRequest(player, { teamId: team._id.toString() });
    res = mockResponse();
    await teamController.initiatePlayerJoinPayment(req, res);
    assert(res.statusCode === 400 && res.jsonData?.message === "Your request is still awaiting coach approval.", "9. Pending player payment blocked");

    // 2. Coach approval & 3. Status becomes approved_pending_payment
    req = mockRequest(coach, { userId: player._id.toString(), action: "approved" }, { teamId: team._id.toString() });
    res = mockResponse();
    await teamController.approvePlayer(req, res);

    freshTeam = await Team.findById(team._id);
    playerSub = freshTeam.players.find(p => p.userId.toString() === player._id.toString());
    assert(playerSub.status === "approved_pending_payment", "2. Coach approval & 3. Status becomes approved_pending_payment");
    assert(playerSub.paymentDeadline !== null, "Payment deadline created");

    // 10. Rejected player payment blocked
    const rejectedPlayer = await createMockUser("Rejected Player", "player");
    req = mockRequest(rejectedPlayer, {}, { teamId: team._id.toString() });
    res = mockResponse();
    await teamController.applyToTeam(req, res);

    req = mockRequest(coach, { userId: rejectedPlayer._id.toString(), action: "rejected" }, { teamId: team._id.toString() });
    res = mockResponse();
    await teamController.approvePlayer(req, res);

    req = mockRequest(rejectedPlayer, { teamId: team._id.toString() });
    res = mockResponse();
    await teamController.initiatePlayerJoinPayment(req, res);
    assert(res.statusCode === 400 && res.jsonData?.message === "Your request has been rejected.", "10. Rejected player payment blocked");

    // 4. Payment initiation
    req = mockRequest(player, { teamId: team._id.toString() });
    res = mockResponse();
    await teamController.initiatePlayerJoinPayment(req, res);
    assert(res.statusCode === 200 && res.jsonData?.requiresPayment === true, "4. Payment initiation");
    
    const orderId = res.jsonData?.order?.id;
    const txId = res.jsonData?.transactionId;

    // 12. Transaction ownership security works
    const bodyHacker = orderId + "|" + "pay_hack123";
    const signatureHacker = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(bodyHacker.toString())
      .digest("hex");

    req = mockRequest(hacker, {
      razorpay_order_id: orderId,
      razorpay_payment_id: "pay_hack123",
      razorpay_signature: signatureHacker,
      transactionId: txId.toString()
    });
    res = mockResponse();
    await teamController.verifyPlayerJoinPayment(req, res);
    assert(res.statusCode === 403, "12. Transaction ownership security works");

    // 5. Razorpay mock verification & 6. Status becomes approved & 7. Player becomes active member
    const bodyPlayer = orderId + "|" + "pay_player123";
    const signaturePlayer = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(bodyPlayer.toString())
      .digest("hex");

    req = mockRequest(player, {
      razorpay_order_id: orderId,
      razorpay_payment_id: "pay_player123",
      razorpay_signature: signaturePlayer,
      transactionId: txId.toString()
    });
    res = mockResponse();
    await teamController.verifyPlayerJoinPayment(req, res);
    assert(res.statusCode === 200, "5. Razorpay mock verification");

    freshTeam = await Team.findById(team._id);
    playerSub = freshTeam.players.find(p => p.userId.toString() === player._id.toString());
    assert(playerSub.status === "approved", "6. Status becomes approved");
    assert(playerSub.paymentStatus === "Paid", "7. Player becomes active member");

    // 8. Duplicate payment blocked
    req = mockRequest(player, { teamId: team._id.toString() });
    res = mockResponse();
    await teamController.initiatePlayerJoinPayment(req, res);
    assert(res.statusCode === 400 && res.jsonData?.message === "Player is already active.", "8. Duplicate payment blocked");

    // 11. Expired approval reset works
    const expiredTeam = await Team.create({
      teamName: "Expired Team",
      tournamentId: new mongoose.Types.ObjectId(),
      sportId: new mongoose.Types.ObjectId(),
      captainId: coach._id,
      playerJoiningFee: 100,
      players: [{
        userId: player._id,
        status: "approved_pending_payment",
        paymentStatus: "unpaid",
        paymentDeadline: new Date(Date.now() - 5000)
      }]
    });

    req = mockRequest(player, {}, { id: expiredTeam._id.toString() });
    res = mockResponse();
    await teamController.getTeamById(req, res);

    const freshExpiredTeam = await Team.findById(expiredTeam._id);
    const expiredPlayerSub = freshExpiredTeam.players.find(p => p.userId.toString() === player._id.toString());
    assert(expiredPlayerSub.status === "pending" && expiredPlayerSub.paymentStatus === "unpaid", "11. Expired approval reset works");

    // Cleanup mock data
    await User.deleteMany({ _id: { $in: [coach._id, player._id, hacker._id, rejectedPlayer._id] } });
    await Team.deleteMany({ _id: { $in: [team._id, expiredTeam._id] } });
    await Transaction.deleteMany({ _id: txId });
    await Notification.deleteMany({ userId: { $in: [coach._id, player._id, hacker._id, rejectedPlayer._id] } });

    console.log("ALL PLAYER PAYMENT FLOW TESTS PASSED");
    process.exit(0);

  } catch (err) {
    console.error("❌ Regression test failed:", err.message);
    process.exit(1);
  }
}

run();
