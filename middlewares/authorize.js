const { errorResponse } = require("../utils/errorResponseHandler");
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (typeof allowedRoles === "string") {
        allowedRoles = [allowedRoles];
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You do not have permission.",
        });
      }

      next();
    } catch (error) {
      return errorResponse(res, "Access denied.", 5403, err);
    }
  };
};

module.exports = authorize;
