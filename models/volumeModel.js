const mongoose = require("mongoose");

const volumeSchema = new mongoose.Schema(
  {
    volumeName: {
      type: String,
      required: true,
      trim: true,
    },
    volumeKey: {
      // lowercase version for uniqueness enforcement
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    journal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
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

// ✅ Compound unique index to ensure volume names are unique per journal
volumeSchema.index({ journal: 1, volumeKey: 1 }, { unique: true });

// ✅ Pre-validate hook to normalize volume name
volumeSchema.pre("validate", function (next) {
  if (this.volumeName) {
    this.volumeKey = this.volumeName.trim().toLowerCase();
  }
  next();
});

const Volume = mongoose.model("Volume", volumeSchema);
module.exports = Volume;
