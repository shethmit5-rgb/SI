const express = require("express");
const Notification = require("../models/notification");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// GET notifications
router.get("/", auth, async (req, res) => {
  const notifications = await Notification.find({
    userId: req.user.userId,
  }).sort({ createdAt: -1 });

  res.json(notifications);
});

// MARK AS READ
router.put("/:id", auth, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, {
    isRead: true,
  });

  res.json({ message: "Marked as read" });
});

module.exports = router;