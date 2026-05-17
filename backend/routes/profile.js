const express = require("express");
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const path = require("path");

const router = express.Router();

/* ================= GET CURRENT USER PROFILE ================= */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    console.log("REQ USER:", req.user);

    const user = await User.findById(req.user.userId).select("-password");

    console.log("FOUND USER:", user);

    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("PROFILE ME ERROR:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

/* ================= UPDATE OWN PROFILE ================= */
router.put(
  "/update",
  authMiddleware,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      console.log("File received:", req.file);
      console.log("Body received:", req.body);
    
      const user = await User.findById(req.user.userId);

      if (!user || user.isDeleted) {
        return res.status(404).json({ message: "User not found" });
      }

      const allowedFields = [
        "name",
        "phoneNumber",
        "gender",
        "location",
        "description",
      ];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          user[field] = req.body[field];
        }
      });

      if (req.file) {
        try {
          const localPath = path.resolve(req.file.path);

          const result = await cloudinary.uploader.upload(localPath, {
            folder: "profile_images",
            resource_type: "image",
            timeout: 60000, // increase timeout (60 sec)
            transformation: [
              { width: 500, height: 500, crop: "limit" },
              { quality: "auto" },
            ],
          });

          user.profileImage = result.secure_url;

          fs.unlinkSync(localPath); // safer delete
        } catch (uploadError) {
          console.error("IMAGE UPLOAD ERROR:", uploadError);
          return res.status(500).json({
            message: "Image upload failed",
            error: uploadError.message,
          });
        }
      }

      await user.save();

      res.json({
        message: "Profile updated successfully",
        user,
      });
    } catch (error) {
      console.error("PROFILE UPDATE ERROR:", error);
      res.status(500).json({ message: "Profile update failed" });
    }
  }
);

// Change password
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ message: "Failed to change password" });
  }
});

/* ================= SOFT DELETE ACCOUNT ================= */
router.delete("/delete", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isDeleted = true;
    await user.save();

    res.json({ message: "Account deactivated successfully" });
  } catch {
    res.status(500).json({ message: "Failed to deactivate account" });
  }
});



module.exports = router;