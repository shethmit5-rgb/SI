const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSmsOTP = async (phoneNumber, otp) => {
  try {
    await client.messages.create({
      body: `Your ArenaSync password reset code is: ${otp}. Valid for 1 hour.`,
      from: process.env.TWILIO_PHONE,
      to: phoneNumber,
    });
    return true;
  } catch (error) {
    console.error("SMS error:", error);
    return false;
  }
};

module.exports = { sendSmsOTP };