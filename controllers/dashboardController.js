const Article = require("../models/articleModel");
const Submission = require("../models/submissionModel");
const Journal = require("../models/journalModel");
const Volume = require("../models/volumeModel");
const Issue = require("../models/issueModel");
const Editor = require("../models/editorModel");
const { errorResponse } = require("../utils/errorResponseHandler");

const getDashboardStats = async (req, res) => {
  try {
    // Parallel execution for performance
    const [
      totalSubmissions,
      totalArticles,
      totalJournals,
      totalVolumes,
      totalIssues,
      totalEditors,
      totalDownloads,
      totalViews
    ] = await Promise.all([
      Submission.countDocuments({ isDeleted: false }),
      Article.countDocuments({ isDeleted: false }),
      Journal.countDocuments({ isDeleted: false }),
      Volume.countDocuments({ isDeleted: false }),
      Issue.countDocuments({ isDeleted: false }),
      Editor.countDocuments({ isDeleted: false }),
      Article.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: null, totalDownloads: { $sum: "$downloads" } } }
      ]),
      Article.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSubmissions,
        totalArticles,
        totalJournals,
        totalVolumes,
        totalIssues,
        totalEditors,
        totalDownloads: totalDownloads[0]?.totalDownloads || 0,
        totalViews: totalViews[0]?.totalViews || 0,
      },
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    errorResponse(res, "Failed to fetch dashboard statistics", 500, err);
  }
};

module.exports = {
  getDashboardStats,
};
