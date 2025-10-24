// controllers/articleController.js
const fs = require("fs");
const path = require("path");
const Article = require("../models/articleModel");
const { errorResponse } = require("../utils/errorResponseHandler");
const { logUserAction } = require("../utils/userActionLogger");

// Create a new article
const createArticle = async (req, res) => {
  try {
    const {
      title,
      author,
      content,
      journal,
      volume,
      issue,
      articleType,
      externalLink,
      status,
    } = req.body;

    // Optional: check required fields
    if (!title || !author || !content || !journal) {
      return errorResponse(res, "Title, author, content, and journal are required", 400);
    }

    const coverImage = `uploads/images/${req.file.filename}`;

    const article = await Article.create({
      title,
      author,
      content,
      journal,
      volume,
      issue,
      articleType,
      externalLink,
      status,
      coverImage,
      createdBy: req.user?._id,
    });

    await logUserAction({
      userId: req.user?._id,
      action: "Create Article",
      model: "Article",
      details: { articleId: article._id },
      req,
    });

    res.status(201).json({ success: true, data: article });
  } catch (err) {
    console.error(err);
    errorResponse(res, "Failed to create article", 500, err);
  }
};

// Get all articles with pagination & search
const getArticles = async (req, res) => {
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
        { articleType: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Article.countDocuments(query);

    const articles = await Article.find(query)
      .populate("journal", "title")
      .populate("volume", "volumeName")
      .populate("issue", "issueName")
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
    errorResponse(res, "Failed to fetch articles", 500, err);
  }
};

// Get single article by ID
const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate("journal", "title")
      .populate("volume", "volumeName")
      .populate("issue", "issueName")
      .populate("createdBy", "firstName lastName email");

    if (!article) return errorResponse(res, "Article not found", 404);

    res.json({ success: true, data: article });
  } catch (err) {
    console.error(err);
    errorResponse(res, "Failed to fetch article", 500, err);
  }
};


const updateArticle = async (req, res) => {
  try {
    const articleId = req.params.id;
    const article = await Article.findById(articleId);
    if (!article) return errorResponse(res, "Article not found", 404);

    // ---- Update fields from body ----
    const { title, author, content, journal, volume, issue, articleType, externalLink, status } = req.body;

    if (title) article.title = title;
    if (author) article.author = author;
    if (content) article.content = content;
    if (journal) article.journal = journal;
    if (volume) article.volume = volume;
    if (issue) article.issue = issue;
    if (articleType) article.articleType = articleType;
    if (externalLink) article.externalLink = externalLink;
    if (status) article.status = status;

    // ---- Handle cover image ----
    if (req.file) {
      // Remove old image if exists
      if (article.coverImage) {
        const oldImagePath = path.join(process.cwd(), article.coverImage);
        try {
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log("✅ Old cover image deleted:", oldImagePath);
          }
        } catch (unlinkErr) {
          console.error("⚠️ Failed to delete old image:", unlinkErr);
        }
      }
      // Save new image
      article.coverImage = `uploads/images/${req.file.filename}`;
    }

    await article.save();

    // ---- Log user action ----
    await logUserAction({
      userId: req.user?._id || null,
      action: req.file ? "Update Article + Cover Image" : "Update Article",
      model: "Article",
      details: { articleId: article._id },
      req,
    });

    res.json({
      success: true,
      message: req.file
        ? "Article and cover image updated successfully"
        : "Article updated successfully",
      data: article,
    });

  } catch (err) {
    console.error("Error updating article:", err);
    errorResponse(res, "Failed to update article", 500, err);
  }
};



// Soft delete an article
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return errorResponse(res, "Article not found", 404);

    article.isDeleted = true;
    await article.save();

    await logUserAction({
      userId: req.user?._id || null,
      action: "Soft Delete Article",
      model: "Article",
      details: { articleId: article._id },
      req,
    });

    res.json({ success: true, message: "Article soft deleted successfully" });
  } catch (err) {
    console.error(err);
    errorResponse(res, "Failed to delete article", 500, err);
  }
};

// Increase download count by 1
const incrementDownload = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return errorResponse(res, "Article not found", 404);

    article.downloads += 1; // increment
    await article.save();

    res.json({
      success: true,
      message: "Download count incremented",
      data: { downloads: article.downloads },
    });
  } catch (err) {
    console.error(err);
    errorResponse(res, "Failed to increment download count", 500, err);
  }
};

// Increment view count
const incrementViewCount = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: "Article not found" });

    article.views = (article.views || 0) + 1;
    await article.save();

    res.json({ success: true, views: article.views });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to increment view count" });
  }
};


module.exports = {
  createArticle,
  incrementViewCount,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  updateArticle,
  incrementDownload, 
};
