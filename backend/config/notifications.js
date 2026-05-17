const nodemailer = require("nodemailer");
const twilio = require("twilio");

// ================= EMAIL CONFIGURATION =================
let emailTransporter = null;

// Initialize email transporter if credentials exist
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  try {
    emailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    // Verify connection
    emailTransporter.verify((error, success) => {
      if (error) {
        console.log("⚠️ Email verification failed:", error.message);
        emailTransporter = null;
      } else {
        console.log("✅ Email transporter initialized");
      }
    });
  } catch (error) {
    console.log("⚠️ Failed to create email transporter:", error.message);
    emailTransporter = null;
  }
} else {
  console.log("⚠️ Email credentials not found. Email sending disabled.");
}

// ================= SMS CONFIGURATION =================
let twilioClient = null;

// Initialize Twilio client if credentials exist
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log("✅ Twilio SMS client initialized");
  } catch (error) {
    console.log("⚠️ Failed to initialize Twilio client:", error.message);
    twilioClient = null;
  }
} else {
  console.log("⚠️ Twilio credentials not found. SMS sending disabled.");
}

// ================= SEND RESET CODE VIA EMAIL =================
const sendResetEmail = async (email, resetCode, name) => {
  if (!emailTransporter) {
    console.log("⚠️ Email not sent - no transporter configured");
    return false;
  }

  const mailOptions = {
    from: `"ArenaSync Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔐 Password Reset Request - ArenaSync",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
          .container { max-width: 550px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 35px; }
          .code-box { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
          .code { font-size: 36px; letter-spacing: 8px; font-weight: bold; color: #4f46e5; font-family: monospace; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
          .warning { color: #ef4444; font-size: 12px; margin-top: 15px; }
          .button { background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏆 ArenaSync</h1>
          </div>
          <div class="content">
            <h2>Hello ${name || "User"}! 👋</h2>
            <p>We received a request to reset your password for your ArenaSync account.</p>
            
            <div class="code-box">
              <div style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">Your OTP Code</div>
              <div class="code">${resetCode}</div>
            </div>
            
            <p>This code will expire in <strong>1 hour</strong>.</p>
            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
            
            <div class="warning">
              ⚠️ Never share this OTP with anyone. ArenaSync will never ask for this code.
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ArenaSync. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await emailTransporter.sendMail(mailOptions);
    console.log(`✅ Reset email sent to ${email} - Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    return false;
  }
};

// ================= SEND RESET CODE VIA SMS =================
const sendResetSMS = async (phoneNumber, resetCode) => {
  if (!twilioClient) {
    console.log("⚠️ SMS not sent - no Twilio client configured");
    return false;
  }

  // Format phone number (ensure it has country code)
  let formattedNumber = phoneNumber;
  if (!phoneNumber.startsWith("+")) {
    formattedNumber = `+91${phoneNumber}`; // Default to India country code
  }

  try {
    const message = await twilioClient.messages.create({
      body: `🔐 ArenaSync Password Reset\n\nYour OTP code is: ${resetCode}\nValid for 1 hour.\nNever share this code with anyone.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber,
    });
    console.log(`✅ Reset SMS sent to ${formattedNumber} - SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error("❌ SMS send error:", error.message);
    return false;
  }
};

// ================= SEND BOTH EMAIL + SMS =================
const sendResetCode = async (user, resetCode) => {
  const results = {
    email: false,
    sms: false,
    testMode: false,
  };

  // Send email if user has email and transporter exists
  if (user.email && emailTransporter) {
    results.email = await sendResetEmail(user.email, resetCode, user.name);
  } else if (user.email && !emailTransporter) {
    console.log(`📧 Would send email to ${user.email} but no transporter configured`);
  }

  // Send SMS if user has phone number and Twilio client exists
  if (user.phoneNumber && twilioClient) {
    results.sms = await sendResetSMS(user.phoneNumber, resetCode);
  } else if (user.phoneNumber && !twilioClient) {
    console.log(`📱 Would send SMS to ${user.phoneNumber} but no Twilio client configured`);
  }

  // If no email or SMS sent, log the code for testing (DEVELOPMENT MODE)
  if (!results.email && !results.sms) {
    results.testMode = true;
    console.log("\n" + "=".repeat(50));
    console.log(`🔐 PASSWORD RESET CODE (TEST MODE)`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Code: ${resetCode}`);
    console.log(`⏰ Expires: 1 hour`);
    console.log("=".repeat(50) + "\n");
  }

  return results;
};

// ================= TEST EMAIL CONFIGURATION =================
const testEmailConfig = async () => {
  if (!emailTransporter) {
    console.log("⚠️ Email not configured. Set EMAIL_USER and EMAIL_PASS in .env");
    return false;
  }

  try {
    await emailTransporter.verify();
    console.log("✅ Email configuration is valid");
    return true;
  } catch (error) {
    console.log("❌ Email configuration invalid:", error.message);
    return false;
  }
};

// ================= TEST SMS CONFIGURATION =================
const testSmsConfig = () => {
  if (!twilioClient) {
    console.log("⚠️ SMS not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env");
    return false;
  }
  console.log("✅ SMS configuration is valid");
  return true;
};

module.exports = { 
  sendResetEmail, 
  sendResetSMS, 
  sendResetCode,
  testEmailConfig,
  testSmsConfig
};