require('dotenv').config();
const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

async function handleOverdueCall(phone, message) {
  try {
    const call = await twilio.calls.create({
      url: `https://handler.twilio.com/twiml/your-endpoint`,
      to: phone,
      from: process.env.TWILIO_PHONE
    });
    return call.sid;
  } catch (error) {
    console.error('Call failed:', error);
    throw error;
  }
}

module.exports = { handleOverdueCall };
