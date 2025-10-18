const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    issueName: {
      type: String,
      required: true,
      trim: true,
    },
    journal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
      required: true,
    },
    volume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Volume",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound unique index: issueName + volume + journal
issueSchema.index({ issueName: 1, volume: 1, journal: 1 }, { unique: true });

const Issue = mongoose.model("Issue", issueSchema);

module.exports = Issue;
