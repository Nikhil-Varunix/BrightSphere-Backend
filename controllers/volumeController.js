const Volume = require("../models/volumeModel");
const Journal = require("../models/journalModel");
const { errorResponse } = require("../utils/errorResponseHandler");
const { logUserAction } = require("../utils/userActionLogger");

// ------------------ Create a New Volume ------------------
const createVolume = async (req, res) => {
  try {
    const { volumeName, journal } = req.body;

    // Validate input
    if (!volumeName || !journal) {
      return errorResponse(res, "Volume name and journal are required", 400);
    }

    // Check if journal exists
    const journalExists = await Journal.findById(journal);
    if (!journalExists) {
      return errorResponse(res, "Journal not found", 404);
    }

    const trimmedName = volumeName.trim();
    const lowerKey = trimmedName.toLowerCase();

    // ✅ Check manually before create to give cleaner error messages
    const existingVolume = await Volume.findOne({
      journal,
      volumeKey: lowerKey,
    });

    if (existingVolume) {
      return errorResponse(
        res,
        "A volume with this name already exists for this journal",
        400
      );
    }

    // Create new volume
    const volume = await Volume.create({
      volumeName: trimmedName,
      journal,
      createdBy: req.user?._id,
    });

    // Append volume to journal
    await Journal.findByIdAndUpdate(journal, {
      $push: { volumes: volume._id },
    });

    // Log user action
    await logUserAction({
      userId: req.user?._id,
      action: "Create Volume",
      model: "Volume",
      details: { volumeId: volume._id, journalId: journal },
      req,
    });

    return res.status(201).json({
      success: true,
      message: "Volume created successfully and added to journal",
      data: volume,
    });
  } catch (err) {
    console.error("Error creating volume:", err);

    // ✅ Handle duplicate key error (from MongoDB unique index)
    if (err.code === 11000) {
      return errorResponse(
        res,
        "A volume with this name already exists for this journal",
        400
      );
    }

    return errorResponse(res, "Failed to create volume", 500, err);
  }
};





// ------------------ Get All Volumes (with pagination + search) ------------------
const getVolumes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    const query = { isDeleted: false };

    if (search) {
      query.$or = [
        { volumeName: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Volume.countDocuments(query);

    const volumes = await Volume.find(query)
      .populate("journal", "title")
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: volumes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    errorResponse(res, "Failed to fetch volumes", 500, err);
  }
};




// ------------------ Get Volumes by Journal ------------------
const getVolumesByJournal = async (req, res) => {
  try {
    const { id } = req.params; // journal ID

    const volumes = await Volume.find({
      journal: id,
      isDeleted: false,
    })
      .populate("journal", "journalName")
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: volumes,
    });
  } catch (err) {
    errorResponse(res, "Failed to fetch volumes", 500, err);
  }
};


// ------------------ Get a Single Volume by ID ------------------
const getVolumeById = async (req, res) => {
  try {
    const volume = await Volume.findById(req.params.id)
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email");

    if (!volume || volume.isDeleted) return errorResponse(res, "Volume not found", 404);

    res.json({ success: true, data: volume });
  } catch (err) {
    errorResponse(res, "Failed to fetch volume", 500, err);
  }
};

// ------------------ Update a Volume ------------------
const updateVolume = async (req, res) => {
  try {
    const volume = await Volume.findById(req.params.id);
    if (!volume || volume.isDeleted) return errorResponse(res, "Volume not found", 404);

    const updates = { ...req.body, updatedBy: req.user?._id };
    Object.assign(volume, updates);
    await volume.save();

    await logUserAction({
      userId: req.user?._id,
      action: "Update Volume",
      model: "Volume",
      details: { volumeId: volume._id },
      req,
    });

    res.json({ success: true, data: volume });
  } catch (err) {
    errorResponse(res, "Failed to update volume", 500, err);
  }
};

// ------------------ Delete a Volume (Soft Delete) ------------------
const deleteVolume = async (req, res) => {
  try {
    const volume = await Volume.findById(req.params.id);
    if (!volume || volume.isDeleted) return errorResponse(res, "Volume not found", 404);

    volume.isDeleted = true;
    await volume.save();

    await logUserAction({
      userId: req.user?._id,
      action: "Delete Volume",
      model: "Volume",
      details: { volumeId: volume._id },
      req,
    });

    res.json({ success: true, message: "Volume deleted successfully" });
  } catch (err) {
    errorResponse(res, "Failed to delete volume", 500, err);
  }
};

module.exports = {
  createVolume,
  getVolumes,
  getVolumeById,
  updateVolume,
  getVolumesByJournal,
  deleteVolume,
};



