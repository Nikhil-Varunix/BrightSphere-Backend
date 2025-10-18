// models/articleModel.js
const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    author: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
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
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },

    coverImage: {
      type: String, 
      trim: true,
    },

    articleType: {
      type: String,
      enum: [
        "Research Paper",
        "Review Article",
        "Case Study",
        "Short Communication",
        "Editorial",
        "Other",
      ],
      default: "Research Paper",
    },

    publishedAt: {
      type: Date,
      default: Date.now,
    },

    views: {
      type: Number,
      default: 0,
    },

    downloads: {
      type: Number,
      default: 0,
    },

    externalLink: {
      type: String, // optional link (PDF, DOI, etc.)
      trim: true,
    },

    status: {
      type: String,
      enum: ["draft", "review", "published", "archived"],
      default: "draft",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

articleSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const Article = mongoose.model("Article", articleSchema);
module.exports = Article;
