const Editor = require("../models/editorModel");
const { errorResponse } = require("../utils/errorResponseHandler");
const { logUserAction } = require("../utils/userActionLogger");

// Create a new editor
const createEditor = async (req, res) => {
  try {
    const { firstName, lastName, email, designation, department, university, address, status } = req.body;

    // Check if editor with same email exists
    const existing = await Editor.findOne({ email });
    if (existing) return errorResponse(res, "Editor with this email already exists", 400);

    // Create editor
    const editor = await Editor.create({
      firstName,
      lastName,
      email,
      designation,
      department,
      university,
      address,
      status: status !== undefined ? status : true,
      createdBy: req.user?._id, // store the creator
    });

    // Log who created the editor
    await logUserAction({
      userId: req.user?._id,
      action: "Create Editor",
      model: "Editor",
      details: { editorId: editor._id },
      req,
    });

    res.status(201).json({ success: true, data: editor });
  } catch (err) {
    errorResponse(res, "Failed to create editor", 500, err);
  }
};

// Get all editors
const getEditors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search } = req.query;
    const query = { isDeleted: false };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { university: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Editor.countDocuments(query);

    const editors = await Editor.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: editors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    errorResponse(res, "Failed to fetch editors", 500, err);
  }
};

// Get a single editor by ID
const getEditorById = async (req, res) => {
  try {
    const editor = await Editor.findById(req.params.id);
    if (!editor) return errorResponse(res, "Editor not found", 404);

    res.json({ success: true, data: editor });
  } catch (err) {
    errorResponse(res, "Failed to fetch editor", 500, err);
  }
};

// Update an editor
const updateEditor = async (req, res) => {
  try {
    const editor = await Editor.findById(req.params.id);
    if (!editor) return errorResponse(res, "Editor not found", 404);

    const updates = { ...req.body };
    Object.assign(editor, updates);
    await editor.save();

    await logUserAction({
      userId: req.user?._id || null,
      action: "Update Editor",
      model: "Editor",
      details: { editorId: editor._id },
      req,
    });

    res.json({ success: true, data: editor });
  } catch (err) {
    errorResponse(res, "Failed to update editor", 500, err);
  }
};

// Soft delete an editor
const deleteEditor = async (req, res) => {
  try {
    const editor = await Editor.findById(req.params.id);
    if (!editor) return errorResponse(res, "Editor not found", 404);

    editor.isDeleted = true;
    await editor.save();

    await logUserAction({
      userId: req.user?._id || null,
      action: "Soft Delete Editor",
      model: "Editor",
      details: { editorId: editor._id },
      req,
    });

    res.json({ success: true, message: "Editor soft deleted successfully" });
  } catch (err) {
    errorResponse(res, "Failed to soft delete editor", 500, err);
  }
};
// Get all editors (no pagination)
const getAllEditors = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { isDeleted: false };

    // Optional search by firstName, lastName, email, designation, department, university, address
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { university: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const editors = await Editor.find(query).sort({ createdAt: -1 });

    res.json({ success: true, data: editors });
  } catch (err) {
    errorResponse(res, "Failed to fetch editors", 500, err);
  }
};

module.exports = { getAllEditors };

module.exports = { createEditor, updateEditor, deleteEditor, getEditors, getEditorById };
