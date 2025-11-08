// models/InpressArticleModel.js
const mongoose = require("mongoose");

const inpressArticleSchema = new mongoose.Schema(
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

    document: {
      type: String, // PDF or DOC URL
      trim: true,
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

const InpressArticle = mongoose.model("InpressArticle", inpressArticleSchema);
module.exports = InpressArticle;
