require("dotenv").config();
const twilio = require("twilio");

/**
 * Sends a WhatsApp confirmation message to the patient.
 * 
 * If TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are present in the environment variables,
 * it attempts to send a real WhatsApp message. Otherwise, it logs the message to the console.
 * 
 * @param {string} patientName - Name of the patient
 * @param {string} mobile - Mobile number (e.g. +919999999999)
 * @param {string} doctorName - Name of the assigned doctor
 * @param {string} date - Appointment date
 * @param {string} time - Appointment time / slot
 * @param {string} patientId - Generated Patient ID
 * @param {string} password - Generated Password
 */
const sendWhatsAppAlert = async (patientName, mobile, doctorName, date, time, patientId, password) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886"; // Twilio sandbox number

  // Standard format for the WhatsApp message
  const messageBody = `Hello ${patientName},

Your appointment has been confirmed.

Doctor: ${doctorName}
Date: ${date}
Time: ${time}

Your Patient Login Credentials:

Patient ID: ${patientId}
Password: ${password}

Login Portal Link: http://localhost:5173/login

Please arrive 10 minutes early.`;

  // Format mobile number to ensure it has country code for WhatsApp (e.g. +91)
  let formattedTo = mobile.trim();
  if (!formattedTo.startsWith("+")) {
    // Default to Indian country code +91 if length is 10 digits
    if (formattedTo.length === 10) {
      formattedTo = `+91${formattedTo}`;
    }
  }
  const toWhatsAppNumber = `whatsapp:${formattedTo}`;

  if (accountSid && authToken) {
    try {
      const client = twilio(accountSid, authToken);
      const message = await client.messages.create({
        body: messageBody,
        from: fromWhatsAppNumber,
        to: toWhatsAppNumber
      });
      console.log(`[WhatsApp Service] Real message sent to ${toWhatsAppNumber}. SID: ${message.sid}`);
      return { success: true, sid: message.sid };
    } catch (error) {
      console.error("[WhatsApp Service] Error sending real WhatsApp message via Twilio:", error.message);
      console.log("[WhatsApp Service] Fallback Mock Alert:\n" + messageBody);
      return { success: false, error: error.message };
    }
  } else {
    console.log(`\n======================================================`);
    console.log(`[MOCK WHATSAPP NOTIFICATION] Sent to: ${toWhatsAppNumber}`);
    console.log(`------------------------------------------------------`);
    console.log(messageBody);
    console.log(`======================================================\n`);
    return { success: true, mock: true };
  }
};

module.exports = { sendWhatsAppAlert };
