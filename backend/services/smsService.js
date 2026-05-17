const axios = require('axios');

// Fast2SMS configuration
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const FAST2SMS_API_URL = 'https://www.fast2sms.com/dev/bulkV2';

const sendSMS = async (phoneNumber, message) => {
    try {
        const response = await axios.post(FAST2SMS_API_URL, {
            route: 'v3',
            sender_id: 'TXTIND',
            message: message,
            language: 'english',
            flash: 0,
            numbers: phoneNumber
        }, {
            headers: {
                'authorization': FAST2SMS_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`✅ SMS sent to ${phoneNumber}`);
        return response.data;
    } catch (error) {
        console.error('SMS sending failed:', error.message);
        return null;
    }
};

module.exports = { sendSMS };