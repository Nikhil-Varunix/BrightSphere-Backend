// controllers/submissionController.js
const Submission = require("../models/submissionModel");
const { errorResponse } = require("../utils/errorResponseHandler");
const { logUserAction } = require("../utils/userActionLogger");
const path = require("path");

// @desc    Create a new submission
// @route   POST /submissions/create
// @access  Public (no token required)

const createSubmission = async (req, res) => {
    try {
        const {
            name,
            email,
            country,
            articleTitle,
            articleType,
            journal,
            abstract,
        } = req.body;

        // ✅ Validate required fields
        if (!name || !email || !country || !articleTitle || !articleType || !journal || !abstract) {
            return errorResponse(res, "All required fields must be provided", 400);
        }

        // ✅ Validate and process uploaded files
        if (!req.files || req.files.length === 0) {
            return errorResponse(res, "At least one file must be uploaded", 400);
        }

        // ✅ Convert absolute file paths to relative (for portability)
        const files = req.files.map((file) => {
            // Example: D:\Projects\bright sphere backend\uploads\docs\abc.pdf
            // Convert to: uploads/docs/abc.pdf
            const relativePath = path.relative(process.cwd(), file.path).replace(/\\/g, "/");
            return {
                fileName: file.originalname,
                fileUrl: relativePath, // stored relative path
                fileType: file.mimetype,
                fileSize: file.size,
            };
        });

        // ✅ Create submission document
        const submission = await Submission.create({
            name,
            email,
            country,
            articleTitle,
            articleType,
            journal,
            abstract,
            files,
        });

        // ✅ Optional: Log user action (if req.user exists)
        if (req.user?._id) {
            await logUserAction({
                userId: req.user._id,
                action: "Create Submission",
                model: "Submission",
                details: { submissionId: submission._id },
                req,
            });
        }

        return res.status(201).json({
            success: true,
            message: "Submission created successfully",
            data: submission,
        });
    } catch (err) {
        console.error(err);
        return errorResponse(res, "Failed to create submission", 500, err);
    }
};


// @desc    Get all submissions (for admin/dashboard)
// @route   GET /submissions/all
// @access  Admin
const getAllSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // Build search query
    const searchQuery = {
      isDeleted: false,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { articleTitle: { $regex: search, $options: "i" } },
      ],
    };

    // Total count for pagination
    const total = await Submission.countDocuments(searchQuery);

    // Fetch paginated submissions
    const submissions = await Submission.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const totalPages = Math.ceil(total / pageSize);

    res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages,
      },
    });
  } catch (err) {
    console.error(err);
    errorResponse(res, "Failed to fetch submissions", 500, err);
  }
};


// @desc    Get a single submission by ID
// @route   GET /submissions/:id
// @access  Admin or user (optional)
const getSubmissionById = async (req, res) => {
    try {
        const { id } = req.params;
        const submission = await Submission.findById(id).populate("journal", "title");

        if (!submission) {
            return errorResponse(res, "Submission not found", 404);
        }

        res.status(200).json({ success: true, data: submission });
    } catch (err) {
        console.error(err);
        errorResponse(res, "Failed to fetch submission", 500, err);
    }
};

// @desc    Update submission status (admin)
// @route   PATCH /submissions/:id/status
// @access  Admin
const updateSubmissionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return errorResponse(res, "Status is required", 400);
        }

        const submission = await Submission.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!submission) {
            return errorResponse(res, "Submission not found", 404);
        }

        await logUserAction({
            userId: req.user?._id,
            action: "Update Submission Status",
            model: "Submission",
            details: { submissionId: submission._id, newStatus: status },
            req,
        });

        res.status(200).json({
            success: true,
            message: "Status updated successfully",
            data: submission,
        });
    } catch (err) {
        console.error(err);
        errorResponse(res, "Failed to update submission status", 500, err);
    }
};


// Soft Delete Submission
const deleteSubmission = async (req, res) => {
    try {
        const { id } = req.params;

        const submission = await Submission.findById(id);
        if (!submission || submission.isDeleted) {
            return errorResponse(res, "Submission not found", 404);
        }

        submission.isDeleted = true;
        await submission.save();

        if (req.user?._id) {
            await logUserAction({
                userId: req.user._id,
                action: "Soft Delete Submission",
                model: "Submission",
                details: { submissionId: id },
                req,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Submission deleted successfully (soft delete)",
        });
    } catch (err) {
        console.error(err);
        return errorResponse(res, "Failed to delete submission", 500, err);
    }
};


module.exports = {
    createSubmission,
    getAllSubmissions,
    getSubmissionById,
    updateSubmissionStatus,
    deleteSubmission
};

