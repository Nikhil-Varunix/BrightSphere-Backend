const fs = require("fs");
const path = require("path");
const InpressArticle = require("../models/InpressArticleModel");
const { errorResponse } = require("../utils/errorResponseHandler");
const { logUserAction } = require("../utils/userActionLogger");

// ✅ Create In-Press Article
const createInpressArticle = async (req, res) => {
  try {
    const { title, author, content, journal } = req.body;

    // Validate required fields
    if (!title || !author || !content || !journal) {
      return errorResponse(res, "Title, author, content, and journal are required", 400);
    }

    const documentFile = req.files?.document
      ? `uploads/docs/${req.files.document[0].filename}`
      : null;

    const article = await InpressArticle.create({
      title,
      author,
      content,
      journal,
      document: documentFile,
      createdBy: req.user?._id,
    });

    await logUserAction({
      userId: req.user?._id,
      action: "Create In-Press Article",
      model: "InpressArticle",
      details: { articleId: article._id },
      req,
    });

    res.status(201).json({ success: true, data: article });
  } catch (err) {
    console.error(err);
    errorResponse(res, "Failed to create in-press article", 500, err);
  }
};

// ✅ Get all In-Press Articles (pagination + search)
const getInpressArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;

    const query = { isDeleted: false };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }

    const total = await InpressArticle.countDocuments(query);

    const articles = await InpressArticle.find(query)
      .populate("journal", "title")
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: articles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    errorResponse(res, "Failed to fetch in-press articles", 500, err);
  }
};

// ✅ Find In-Press Articles by Journal ID
const getInpressArticlesByJournal = async (req, res) => {
  try {
    const { journalId } = req.params;

    if (!journalId) {
      return errorResponse(res, "Journal ID is required", 400);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { journal: journalId, isDeleted: false };

    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { author: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const total = await InpressArticle.countDocuments(query);

    const articles = await InpressArticle.find(query)
      .populate("journal", "title")
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      success: true,
      data: articles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to fetch in-press articles by journal", 500, err);
  }
};

// ✅ Update In-Press Article
const updateInpressArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, content, journal } = req.body;

    const article = await InpressArticle.findById(id);
    if (!article) return errorResponse(res, "Article not found", 404);

    if (req.files?.document) {
      article.document = `uploads/docs/${req.files.document[0].filename}`;
    }

    article.title = title || article.title;
    article.author = author || article.author;
    article.content = content || article.content;
    article.journal = journal || article.journal;

    await article.save();

    res.json({ success: true, data: article });
  } catch (err) {
    console.error(err);
    errorResponse(res, "Failed to update in-press article", 500, err);
  }
};


// ✅ Soft Delete In-Press Article
const deleteInpressArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await InpressArticle.findById(id);
    if (!article) {
      return errorResponse(res, "Article not found", 404);
    }

    article.isDeleted = true;
    await article.save();

    await logUserAction({
      userId: req.user?._id,
      action: "Delete In-Press Article",
      model: "InpressArticle",
      details: { articleId: id },
      req,
    });

    res.json({ success: true, message: "Article deleted" });
  } catch (err) {
    console.error(err);
    errorResponse(res, "Failed to delete in-press article", 500, err);
  }
};

module.exports = {
  createInpressArticle,
  getInpressArticles,
  getInpressArticlesByJournal,
  updateInpressArticle,
  deleteInpressArticle,
};
