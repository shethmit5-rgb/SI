const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getRazorpayKey,
  createOrder,
  verifyPayment,
  getTransactions,
} = require("../controllers/paymentController");

router.get("/get-key", auth, getRazorpayKey);
router.post("/create-order", auth, createOrder);
router.post("/verify-payment", auth, verifyPayment);
router.get("/transactions", auth, getTransactions);

module.exports = router;