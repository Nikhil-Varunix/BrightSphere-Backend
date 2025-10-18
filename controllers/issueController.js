const Issue = require("../models/issueModel");
const Volume = require("../models/volumeModel");
const Journal = require("../models/journalModel");
const { errorResponse } = require("../utils/errorResponseHandler");
const { logUserAction } = require("../utils/userActionLogger");

// ------------------ Create Issue ------------------
const createIssue = async (req, res) => {
  try {
    const { issueName, volume, journal } = req.body;

    if (!issueName || !volume) {
      return errorResponse(res, "Issue name and volume are required", 400);
    }

    const issue = await Issue.create({
      issueName,
      volume,
      journal,
      createdBy: req.user?._id,
    });

    await logUserAction({
      userId: req.user?._id,
      action: "Create Issue",
      model: "Issue",
      details: { issueId: issue._id },
      req,
    });

    res.status(201).json({ success: true, data: issue });
  } catch (err) {
    errorResponse(res, "Failed to create issue", 500, err);
  }
};



// ------------------ Get All Issues ------------------
const getIssues = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, volumeId } = req.query;
    const query = { isDeleted: false };

    // Filter by volume
    if (volumeId) query.volume = volumeId;

    // Search by issueName or description
    if (search) {
      query.$or = [
        { issueName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Issue.countDocuments(query);
    const issues = await Issue.find(query)
      .populate("volume", "volumeName")
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: issues,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    errorResponse(res, "Failed to fetch issues", 500, err);
  }
};


// ------------------ Get Issues by Volume ------------------
const getIssuesByVolume = async (req, res) => {
  try {
    const { id } = req.params;

    const issues = await Issue.find({
      volume: id,
      isDeleted: false,
    })
      .populate("volume", "volumeName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: issues,
    });
  } catch (err) {
    errorResponse(res, "Failed to fetch issues for this volume", 500, err);
  }
};

// ------------------ Get Issue by ID ------------------
const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate("volume", "volumeName");
    if (!issue || issue.isDeleted) return errorResponse(res, "Issue not found", 404);

    res.json({ success: true, data: issue });
  } catch (err) {
    errorResponse(res, "Failed to fetch issue", 500, err);
  }
};

// ------------------ Update Issue ------------------
const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue || issue.isDeleted) return errorResponse(res, "Issue not found", 404);

    const updates = { ...req.body, updatedBy: req.user?._id };
    Object.assign(issue, updates);
    await issue.save();

    await logUserAction({
      userId: req.user?._id,
      action: "Update Issue",
      model: "Issue",
      details: { issueId: issue._id },
      req,
    });

    res.json({ success: true, data: issue });
  } catch (err) {
    errorResponse(res, "Failed to update issue", 500, err);
  }
};

// ------------------ Soft Delete Issue ------------------
const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue || issue.isDeleted) return errorResponse(res, "Issue not found", 404);

    issue.isDeleted = true;
    await issue.save();

    await logUserAction({
      userId: req.user?._id,
      action: "Soft Delete Issue",
      model: "Issue",
      details: { issueId: issue._id },
      req,
    });

    res.json({ success: true, message: "Issue soft deleted successfully" });
  } catch (err) {
    errorResponse(res, "Failed to delete issue", 500, err);
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  getIssuesByVolume,
};
