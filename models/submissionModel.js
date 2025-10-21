const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true }, // store Cloud/Local path
  fileType: { type: String, required: true },
  fileSize: { type: Number }, // bytes
});

const submissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
    },
    articleTitle: {
      type: String,
      required: [true, "Article title is required"],
      trim: true,
    },
    articleType: {
      type: String,
      enum: [
        "Research",
        "Reviewer",
        "Case Report",
        "Short Communication",
        "Opinion Article",
      ],
      required: [true, "Article type is required"],
    },
    journal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
      required: [true, "Journal is required"],
    },
    abstract: {
      type: String,
      required: [true, "Abstract is required"],
    },
    files: [fileSchema], // array of file objects
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Approved", "Rejected"],
      default: "Pending",
    },
    isDeleted: { type: Boolean, default: false },
  },

  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

module.exports = mongoose.model("Submission", submissionSchema);
