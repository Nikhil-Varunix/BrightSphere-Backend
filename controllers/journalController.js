// controllers/journalController.js
const Journal = require("../models/journalModel");
const Article = require("../models/articleModel");
const Volume = require("../models/volumeModel");
const Issue = require("../models/issueModel");
const { errorResponse } = require("../utils/errorResponseHandler");
const { logUserAction } = require("../utils/userActionLogger");

const createJournal = async (req, res) => {
  try {
    const { title, content, subTitle, editors } = req.body;
    const coverImage = `uploads/images/${req.file.filename}`;

    if (!title) return errorResponse(res, "Journal title is required", 400);

    // Check for duplicate title
    const existing = await Journal.findOne({ title: { $regex: `^${title}$`, $options: "i" } });
    if (existing) return errorResponse(res, "A journal with this title already exists", 400);

    // Parse editors if sent as JSON string
    let editorsArray = [];
    if (editors) {
      try {
        editorsArray = JSON.parse(editors);
      } catch (err) {
        return errorResponse(res, "Invalid editors format", 400);
      }
    }

    const journal = await Journal.create({
      title,
      subTitle,
      content,
      coverImage,
      editors: editorsArray, // ✅ save editors
      createdBy: req.user?._id,
    });

    await logUserAction({
      userId: req.user?._id,
      action: "Create Journal",
      model: "Journal",
      details: { journalId: journal._id },
      req,
    });

    res.status(201).json({ success: true, data: journal });
  } catch (err) {
    errorResponse(res, "Failed to create journal", 500, err);
  }
};


// ------------------ Get All Journals (with pagination & search) ------------------
const getJournals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;

    const query = { isDeleted: false };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Journal.countDocuments(query);

    const journals = await Journal.find(query)
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: journals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    errorResponse(res, "Failed to fetch journals", 500, err);
  }
};

// ------------------ Get All Journals (no pagination, no search) ------------------
const getAllJournals = async (req, res) => {
  try {
    const journals = await Journal.find({ isDeleted: false })
      .populate("createdBy", "firstName lastName email")
      .populate("editors", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: journals,
    });
  } catch (err) {
    errorResponse(res, "Failed to fetch all journals", 500, err);
  }
};

const getAllDeletedJournals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;

    const query = { isDeleted: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Journal.countDocuments(query);

    const journals = await Journal.find(query)
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: journals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    errorResponse(res, "Failed to fetch journals", 500, err);
  }
};


// ------------------ Get Journal by ID ------------------
const getJournalById = async (req, res) => {
  try {
    // Fetch journal and populate editors and volumes
    const journal = await Journal.findById(req.params.id)
      .populate("createdBy", "firstName lastName email")
      .populate("editors", "firstName lastName email university department address")
      .populate("volumes");

    if (!journal) return errorResponse(res, "Journal not found", 404);

    // Fetch articles belonging to this journal
    const articles = await Article.find({ journal: journal._id })
      .select("title summary authorName pdfUrl views downloads image createdAt content")
      .sort({ createdAt: -1 }); // latest first

    // Attach articles to the response
    const journalWithArticles = { ...journal.toObject(), articles };

    res.json({ success: true, data: journalWithArticles });
  } catch (err) {
    console.error(err);
    errorResponse(res, "Failed to fetch journal", 500, err);
  }
};

const getJournalFullDetails = async (req, res) => {
  try {
    const journalId = req.params.id;

    // 1️⃣ Find journal
    const journal = await Journal.findById(journalId).populate("editors").lean();
    if (!journal) return errorResponse(res, "Journal not found", 404);

    // 2️⃣ Get all volumes of this journal
    const volumes = await Volume.find({ journal: journal._id, isDeleted: false }).lean();

    // 3️⃣ Get all issues of this journal
    const allIssues = await Issue.find({ journal: journal._id, isDeleted: false })
      .select("_id issueName createdAt status volume")
      .lean();

    // 4️⃣ Attach issues to respective volumes
    const volumesWithIssues = volumes.map((vol) => ({
      ...vol,
      issues: allIssues.filter(
        (issue) => issue.volume.toString() === vol._id.toString()
      ),
    }));

    // 5️⃣ Get all articles of this journal
    const articles = await Article.find({ journal: journal._id, isDeleted: false })
      .select("title  pdfUrl views downloads coverImage author  createdAt content volume issue journal")
      .sort({ createdAt: -1 })
      .lean();

    // 6️⃣ Final structured response
    const journalData = {
      ...journal,
      volumes: volumesWithIssues,
      issues: allIssues, // All issues at top level
      articles,
    };

    return res.json({ success: true, data: journalData });
  } catch (err) {
    console.error("❌ getJournalFullDetails error:", err);
    return errorResponse(res, "Failed to fetch journal details", 500, err);
  }
};





// ------------------ Update Journal ------------------
const updateJournal = async (req, res) => {
  console.log("Update Journal req.body:", req);
  try {
    const { title, subTitle, content, editorials } = req.body;

    const journal = await Journal.findById(req.params.id);
    if (!journal) return errorResponse(res, "Journal not found", 404);

    // Update basic fields

    journal.title = title ?? journal.title;
    journal.subTitle = subTitle ?? journal.subTitle;
    journal.content = content ?? journal.content;

    if (Array.isArray(editorials)) {
      journal.editors = editorials; // array of editor IDs
    }

    await journal.save();

    await logUserAction({
      userId: req.user?._id,
      action: "Update Journal",
      model: "Journal",
      details: { journalId: journal._id },
      req,
    });

    res.json({ success: true, data: journal });
  } catch (err) {
    console.error(err);
    errorResponse(res, "Failed to update journal", 500, err);
  }
};

// ------------------ Update Journal Image ------------------
const updateJournalImage = async (req, res) => {
  try {
    const journalId = req.params.id;

    if (!req.file) {
      return errorResponse(res, "No image file uploaded", 400);
    }

    const journal = await Journal.findById(journalId);
    if (!journal) {
      return errorResponse(res, "Journal not found", 404);
    }

    // Save new cover image path

    journal.coverImage = `uploads/images/${req.file.filename}`;
    await journal.save();

    await logUserAction({
      userId: req.user?._id,
      action: "Update Journal Cover Image",
      model: "Journal",
      details: { journalId },
      req,
    });

    res.json({
      success: true,
      message: "Journal cover image updated successfully",
      data: { coverImage: journal.coverImage },
    });
  } catch (err) {
    console.error("Error updating journal image:", err);
    errorResponse(res, "Failed to update journal image", 500, err);
  }
};

// ------------------ Soft Delete Journal ------------------
const deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) return errorResponse(res, "Journal not found", 404);

    // Soft delete the journal
    journal.isDeleted = true;
    await journal.save();

    // Cascade soft delete to related volumes, issues, and articles
    await Volume.updateMany({ journalId: journal._id }, { isDeleted: true });
    await Issue.updateMany({ journalId: journal._id }, { isDeleted: true });
    await Article.updateMany({ journalId: journal._id }, { isDeleted: true });

    // Log user action
    await logUserAction({
      userId: req.user?._id,
      action: "Soft Delete Journal",
      model: "Journal",
      details: { journalId: journal._id },
      req,
    });

    res.json({
      success: true,
      message: "Journal and related volumes, issues, and articles soft deleted successfully",
    });
  } catch (err) {
    errorResponse(res, "Failed to delete journal", 500, err);
  }
};

// ------------------ Restore (Reactivate) Journal ------------------
const restoreJournal = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) return errorResponse(res, "Journal not found", 404);

    // If journal is already active
    if (!journal.isDeleted) {
      return res.json({ success: true, message: "Journal is already active" });
    }

    // Reactivate the journal
    journal.isDeleted = false;
    await journal.save();

    // Cascade reactivation to related volumes, issues, and articles
    await Volume.updateMany({ journalId: journal._id }, { isDeleted: false });
    await Issue.updateMany({ journalId: journal._id }, { isDeleted: false });
    await Article.updateMany({ journalId: journal._id }, { isDeleted: false });

    // Log user action
    await logUserAction({
      userId: req.user?._id,
      action: "Restore Journal",
      model: "Journal",
      details: { journalId: journal._id },
      req,
    });

    res.json({
      success: true,
      message: "Journal and related volumes, issues, and articles restored successfully",
    });
  } catch (err) {
    errorResponse(res, "Failed to restore journal", 500, err);
  }
};


module.exports = {
  createJournal,
  getJournals,
  getAllJournals,
  getAllDeletedJournals,
  getJournalById,
  updateJournal,
  updateJournalImage,
  deleteJournal,
  getJournalFullDetails,
  restoreJournal,
};
