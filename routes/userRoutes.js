// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../middlewares/upload");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */

// Register User (Admin)
router.post("/admin/create", authenticate, authorize(["admin", "manager"]), (req, res) => {
  // #swagger.tags = ['Users/Admin']
  // #swagger.summary = 'Admin Creates a new user'
  userController.AdminCreateUser(req, res);
});

// Register User (public)
router.post("/register", (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Register a new user'
  userController.registerUser(req, res);
});



// Login User (public)
router.post("/login", (req, res) => {
  /* 
  #swagger.tags = ['Auth']
  #swagger.summary = 'Login a user'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { email: "dev@servicenxt.in", password: "123456" }
    }
  */
  userController.loginUser(req, res);
});

// GET /auth/validate
router.get("/validate", (req, res) => {
  /* 
  #swagger.tags = ['Auth']
  #swagger.summary = 'Validate user token'
  #swagger.security = [{ "bearerAuth": [] }]
  */
  userController.validateToken(req, res);
});

// Forgot Password (public)
router.post("/forgot-password", (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Request password reset'
  userController.forgotPassword(req, res);
});

// Get All Users (admin/manager only)
router.get("/", authenticate, authorize(["admin"]), (req, res) => {
  // #swagger.tags = ['Users/Admin'] 
  // #swagger.summary = 'Get all users'
  // #swagger.security = [{ "bearerAuth": [] }]

  userController.getAllUsers(req, res);
});

// Get User by ID (self or admin/manager)
router.get("/:id", authenticate, (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get user by ID'
  // #swagger.security = [{ "bearerAuth": [] }]

  userController.getUserById(req, res);
});

// Update User (self or admin)
router.put("/update/:id", authenticate, (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Update user details'
  // #swagger.security = [{ "bearerAuth": [] }]

  userController.updateUser(req, res);
});

// Deactivate User (admin only)
router.put("/deactivate/:id", authenticate, authorize(["admin"]), (req, res) => {
  // #swagger.tags = ['Users/Admin']
  // #swagger.summary = 'Deactivate a user'
  // #swagger.security = [{ "bearerAuth": [] }]

  userController.deactivateUser(req, res);
});

// ------------------ Get Not Approved Users (admin only) ------------------
router.get("/pending/approvals", authenticate, authorize(["admin"]), (req, res) => {
  // #swagger.tags = ['Users/Admin'] 
  // #swagger.summary = 'Get all users who are not yet approved'
  // #swagger.security = [{ "bearerAuth": [] }]

  userController.getNotApprovedUsers(req, res);
});

// ------------------ Approve User (admin only) ------------------
router.put("/approve/:id", authenticate, authorize(["admin"]), (req, res) => {
  // #swagger.tags = ['Users/Admin']
  // #swagger.summary = 'Approve a user by ID'
  // #swagger.security = [{ "bearerAuth": [] }]

  userController.approveUser(req, res);
});

// ------------------ Delete User (admin only, soft delete) ------------------
router.delete("/delete/:id", authenticate, authorize(["admin"]), (req, res) => {
  // #swagger.tags = ['Users/Admin'] 
  // #swagger.summary = 'Soft delete a user by ID'
  // #swagger.security = [{ "bearerAuth": [] }]

  userController.deleteUser(req, res);
});


// Upload Profile Image (self or admin)
router.post("/upload-profile/:id", authenticate, upload.single("profileImage"), (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Upload profile image for user'
  // #swagger.security = [{ "bearerAuth": [] }]

  userController.profileImageUpload(req, res);
});

// Logout from Device (authenticated user only)
router.post("/logout-device", authenticate, (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Logout user from a specific device'
  // #swagger.security = [{ "bearerAuth": [] }]

  userController.logoutFromDevice(req, res);
});

module.exports = router;
