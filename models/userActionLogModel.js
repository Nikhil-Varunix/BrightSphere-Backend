// models/admin/userActionLogModel.js
const mongoose = require("mongoose");

const userActionLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: false }, // optional org tracking
    action: { type: String, required: true }, // e.g., CREATE, UPDATE, LOGIN
    model: { type: String }, // e.g., SubCategory, Designation
    details: { type: Object }, // any extra info about the action
    ipAddress: { type: String }, // optional: store user's IP
    userAgent: { type: String }, // optional: browser/device info
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserActionLog", userActionLogSchema);
