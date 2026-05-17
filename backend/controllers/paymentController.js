const Razorpay = require("razorpay");
const crypto = require("crypto");
const Transaction = require("../models/Transaction");
const Registration = require("../models/Registration");

// Initialize Razorpay with error handling
let razorpay = null;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log("✅ Razorpay initialized successfully");
} catch (error) {
  console.log("⚠️ Razorpay not configured. Payment features disabled.");
}

// Get Razorpay Key for frontend
exports.getRazorpayKey = (req, res) => {
  if (!razorpay) {
    return res.status(503).json({ 
      success: false, 
      message: "Payment service not configured" 
    });
  }
  res.json({ key: process.env.RAZORPAY_KEY_ID });
};

// Create Order
exports.createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ 
        success: false, 
        message: "Payment service not configured" 
      });
    }

    const { amount, registrationId, tournamentId } = req.body;

    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        registrationId: registrationId,
        tournamentId: tournamentId,
        userId: req.user.userId,
      },
    };

    const order = await razorpay.orders.create(options);

    // Save transaction to database
    const transaction = new Transaction({
      userId: req.user.userId,
      tournamentId: tournamentId,
      registrationId: registrationId,
      razorpayOrderId: order.id,
      amount: amount,
      status: "created",
    });

    await transaction.save();

    res.json({
      success: true,
      order,
      transactionId: transaction._id,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ 
        success: false, 
        message: "Payment service not configured" 
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      transactionId,
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update transaction
      await Transaction.findByIdAndUpdate(transactionId, {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
        updatedAt: Date.now(),
      });

      // Update registration payment status
      const transaction = await Transaction.findById(transactionId);
      await Registration.findByIdAndUpdate(transaction.registrationId, {
        paymentStatus: "paid",
      });

      res.json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      await Transaction.findByIdAndUpdate(transactionId, {
        status: "failed",
      });
      res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Transaction History
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId })
      .populate("tournamentId", "eventName")
      .populate("registrationId", "approvalStatus")
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};