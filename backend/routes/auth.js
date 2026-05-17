const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validateEmail, validatePassword, validateName } = require("../utils/validators");
const { sendVerificationEmail, sendResetPasswordEmail, sendWelcomeEmail } = require("../config/email");

// ================= REGISTER WITH EMAIL VERIFICATION =================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validations
    const nameError = validateName(name);
    if (nameError) return res.status(400).json({ message: nameError });
    
    const emailError = validateEmail(email);
    if (emailError) return res.status(400).json({ message: emailError });
    
    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ message: passwordError });

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered. Please use a different email or login." });
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = Date.now() + 3600000; // 1 hour

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "player",
      status: "active",
      emailVerified: false,
      verificationCode,
      verificationCodeExpires
    });

    await user.save();

    // 📧 Show OTP in console for testing
    console.log("\n" + "=".repeat(60));
    console.log(`📧 EMAIL VERIFICATION OTP`);
    console.log("=".repeat(60));
    console.log(`📧 To: ${email}`);
    console.log(`📧 Name: ${name}`);
    console.log(`🔐 Verification Code: ${verificationCode}`);
    console.log(`⏰ Expires in: 1 hour`);
    console.log("=".repeat(60) + "\n");

    // Send verification email (optional - will also show in console if fails)
    const emailSent = await sendVerificationEmail(email, verificationCode, name);
    
    if (!emailSent) {
      console.log(`⚠️ Email sending failed, but OTP is shown above for testing.`);
    } else {
      console.log(`✅ Verification email sent to ${email}`);
    }

    res.json({ 
      success: true,
      message: "Registration successful! We've sent a verification code to your email.",
      requiresVerification: true,
      email: email,
      testCode: process.env.NODE_ENV !== "production" ? verificationCode : undefined // Only for development
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

// ================= CHECK EMAIL AVAILABILITY =================
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    const user = await User.findOne({ email });
    res.json({ available: !user });
  } catch (err) {
    console.error("Email check error:", err);
    res.status(500).json({ message: "Error checking email availability" });
  }
});

// ================= VERIFY EMAIL OTP =================
router.post("/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }
    
    const user = await User.findOne({ 
      email, 
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    user.emailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    console.log(`\n✅ Email verified successfully for ${email}\n`);

    // Send welcome email after successful verification
    await sendWelcomeEmail(email, user.name);

    res.json({ 
      success: true,
      message: "Email verified successfully! You can now login." 
    });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ message: "Verification failed. Please try again." });
  }
});

// ================= RESEND VERIFICATION CODE =================
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 3600000;
    await user.save();

    // 📧 Show OTP in console for testing
    console.log("\n" + "=".repeat(60));
    console.log(`📧 RESEND VERIFICATION OTP`);
    console.log("=".repeat(60));
    console.log(`📧 To: ${email}`);
    console.log(`🔐 New Verification Code: ${verificationCode}`);
    console.log(`⏰ Expires in: 1 hour`);
    console.log("=".repeat(60) + "\n");

    // Send new verification email
    const emailSent = await sendVerificationEmail(email, verificationCode, user.name);
    
    if (!emailSent) {
      console.log(`⚠️ Email sending failed, but OTP is shown above for testing.`);
    }

    res.json({ message: "New verification code sent to your email" });
  } catch (err) {
    console.error("Resend error:", err);
    res.status(500).json({ message: "Failed to resend code" });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({ 
        message: "Please verify your email first. Check your email for OTP.",
        requiresVerification: true,
        email: user.email
      });
    }

    // Check if user is blocked
    if (user.status === "blocked") {
      return res.status(403).json({ message: "Your account has been blocked by admin" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(`\n✅ User logged in: ${email} (${user.role})\n`);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        profileImage: user.profileImage || "",
        phoneNumber: user.phoneNumber || "",
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

// ================= FORGOT PASSWORD =================
// ================= FORGOT PASSWORD =================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = Date.now() + 3600000;

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Show OTP in console
    console.log("\n" + "=".repeat(60));
    console.log(`🔐 PASSWORD RESET OTP`);
    console.log("=".repeat(60));
    console.log(`📧 To: ${email}`);
    console.log(`📧 Name: ${user.name}`);
    console.log(`🔐 Reset Code: ${resetCode}`);
    console.log(`⏰ Expires in: 1 hour`);
    console.log("=".repeat(60) + "\n");

    // ✅ FIXED: Use correct function name
    const emailSent = await sendResetPasswordEmail(email, resetCode, user.name);
    
    if (!emailSent) {
      console.log(`⚠️ Email sending failed, but OTP is shown above for testing.`);
    }

    res.json({ 
      success: true,
      message: "Password reset code sent to your email. Check console for OTP." 
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Failed to process request" });
  }
});

// ================= RESEND PASSWORD RESET OTP =================
router.post("/resend-reset-otp", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = Date.now() + 3600000;

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // 📧 Show reset OTP in console for testing
    console.log("\n" + "=".repeat(60));
    console.log(`🔐 RESEND PASSWORD RESET OTP`);
    console.log("=".repeat(60));
    console.log(`📧 To: ${email}`);
    console.log(`🔐 New Reset Code: ${resetCode}`);
    console.log(`⏰ Expires in: 1 hour`);
    console.log("=".repeat(60) + "\n");

    // Send new reset email
    const emailSent = await sendResetPasswordEmail(email, resetCode, user.name);
    
    if (!emailSent) {
      console.log(`⚠️ Email sending failed, but OTP is shown above for testing.`);
    }

    res.json({ message: "New password reset code sent to your email" });
  } catch (err) {
    console.error("Resend reset OTP error:", err);
    res.status(500).json({ message: "Failed to resend code" });
  }
});

// ================= RESET PASSWORD WITH OTP =================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate password strength
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // Find user with valid reset code
    const user = await User.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log(`\n✅ Password reset successful for ${email}\n`);

    res.json({ 
      success: true,
      message: "Password reset successful! You can now login with your new password." 
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

module.exports = router;