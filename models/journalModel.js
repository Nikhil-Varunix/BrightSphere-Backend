// models/Journal.js
const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subTitle: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String, 
      trim: true,
    },
    issn: {
      type: String, 
      trim: true,
    },
    editors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Editor",
      },
    ],
    articles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article",
      },
    ],
    volumes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Volume",
      },
    ],
    issues: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Issue",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

// Optional virtuals for quick access
journalSchema.virtual("editorialCount").get(function () {
  return this.editors?.length || 0;
});

journalSchema.virtual("articleCount").get(function () {
  return this.articles?.length || 0;
});

const Journal = mongoose.model("Journal", journalSchema);
module.exports = Journal;
