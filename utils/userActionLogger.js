// utils/userActionLogger.js
const UserActionLog = require("../models/userActionLogModel");

const logUserAction = async ({ userId, orgId = null, action, model = null, details = {}, req = null }) => {
  try {
    // Get IP address reliably
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;

    const logData = {
      userId,
      orgId,
      action,
      model,
      details,
      ipAddress,
      userAgent: req?.headers["user-agent"] || null,
    };

    await UserActionLog.create(logData);
  } catch (err) {
    console.error("Failed to log user action:", err);
  }
};

module.exports = { logUserAction };
