const express = require("express");
const { body, validationResult, param } = require("express-validator");

const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const router = express.Router();

/* ================= GET ALL USERS (ADMIN ONLY) ================= */
router.get("/", auth, role("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public endpoint - No authentication required
router.get("/public", async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= CREATE USER (ADMIN ONLY) ================= */
router.post(
  "/",
  auth,
  role("admin"),
  [
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters"),

    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = new User(req.body);
      await user.save();

      res.json({ message: "User created", user });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/* ================= UPDATE USER (ADMIN ONLY) ================= */
router.put(
  "/:id",
  auth,
  role("admin"),
  [
    param("id").isMongoId().withMessage("Invalid user ID"),

    body("email")
      .optional()
      .isEmail()
      .withMessage("Invalid email format"),

    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User updated", user });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/* ================= DELETE USER (ADMIN ONLY) ================= */
router.delete(
  "/:id",
  auth,
  role("admin"),
  [param("id").isMongoId().withMessage("Invalid user ID")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "User deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;