const axios = require("axios");
const Otp = require("../models/otpModel");

// Generate & Send OTP
const generateAndSendOtp = async (phone) => {
  const otp = Math.floor(100000 + Math.random() * 900000);

  await Otp.create({
    phone,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  try {
    const url = "https://www.fast2sms.com/dev/bulkV2";
    const response = await axios.post(
      url,
      {
        variables_values: otp.toString(),
        route: "otp",
        numbers: phone.toString(),
      },
      {
        headers: { authorization: process.env.FAST2SMS_API_KEY },
      }
    );

    return response.data.return === true;
  } catch (err) {
    console.error("Fast2SMS Error:", err.response?.data || err.message);
    return false;
  }
};

// Verify OTP (delete after success or expiry)
const verifyOtp = async (phone, otp) => {
  const record = await Otp.findOne({ phone }).sort({ createdAt: -1 });
  if (!record) return false;

  if (new Date() > record.expiresAt) {
    await Otp.deleteOne({ _id: record._id }); // expired
    return false;
  }

  if (record.otp === otp.toString()) {
    await Otp.deleteOne({ _id: record._id }); // delete after success
    return true;
  }

  return false;
};

module.exports = { generateAndSendOtp, verifyOtp };
