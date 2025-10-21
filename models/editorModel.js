// models/editor/Model.js
const mongoose = require("mongoose");

const editorSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    coverImage: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },
    university: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    isActive: {
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

// Virtual for full name
editorSchema.virtual("fullname").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const Editor = mongoose.model("Editor", editorSchema);

module.exports = Editor;
