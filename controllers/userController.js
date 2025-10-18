const User = require("../models/userModel");
const { errorResponse } = require("../utils/errorResponseHandler");
const { logUserAction } = require("../utils/userActionLogger");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const Otp = require("../models/otpModel");

// ------------------ REGISTER ------------------

const registerUser = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    otp,
  } = req.body;

  console.log("📩 Incoming registration request:", req.body);

  if (!email || !password || !phone) {
    console.warn("⚠️ Missing required fields");
    return res
      .status(400)
      .json({ success: false, message: "Email, password, and phone are required" });
  }

  try {

    // Step 1: Send OTP (when no OTP provided yet)
    if (!otp) {

      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      // Check if user already exists by phone
      const existingUserByPhone = await User.findOne({ phone });
      if (existingUserByPhone) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this phone",
        });
      }

      // Generate OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log("🔑 Generated OTP:", generatedOtp);

      // Save OTP with expiry (5 mins)
      const expiry = Date.now() + 5 * 60 * 1000;
      await Otp.findOneAndUpdate(
        { phone },
        { otp: generatedOtp, expiresAt: expiry },
        { upsert: true, new: true }
      );
      console.log("💾 OTP saved in DB for phone:", phone);

      // Send OTP via SMS API
      const apiKey = process.env.SMS_API_KEY;
      const senderId = process.env.SMS_SENDER_ID || "DRAFT4";
      const templateId = process.env.SMS_TEMPLATE_ID;
      ;
      const message = `Hello Upayog User, Your mobile verification code is ${generatedOtp}. Use it on Upayog. Please don't share this code to anyone. Thank you.`;
      const url = `https://text.draft4sms.com/vb/apikey.php?apikey=${apiKey}&senderid=${senderId}&number=${phone}&message=${encodeURIComponent(
        message
      )}&templateid=${templateId}`;

      console.log("🌐 Sending SMS request to Draft4SMS:", url);

      const response = await axios.get(url).catch((err) => {
        console.error("❌ SMS API request failed:", err);
        throw new Error("SMS API request failed");
      });

      console.log("📨 SMS API Response:", response.data);

      if (!response.data || response.data.status !== "Success") {
        console.error("❌ OTP send failed, response:", response.data);
        return res
          .status(500)
          .json({ success: false, message: "Failed to send OTP. Try again later." });
      }

      console.log("✅ OTP sent successfully to:", phone);
      return res
        .status(200)
        .json({ success: true, message: "OTP sent successfully" });
    }

    // Step 2: Verify OTP
    console.log("🔍 Verifying OTP:", otp, "for phone:", phone);
    const otpRecord = await Otp.findOne({ phone });
    console.log("📂 OTP record from DB:", otpRecord);

    if (!otpRecord || otpRecord.otp !== otp || otpRecord.expiresAt < Date.now()) {
      console.warn("⚠️ Invalid or expired OTP");
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    console.log("✅ OTP verified for phone:", phone);

    // Remove OTP after verification
    await Otp.deleteOne({ phone });
    console.log("🗑 OTP record deleted for phone:", phone);

    // Step 3: Create new user
    console.log("🔒 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Password hashed");

    const newUser = new User({
      firstName,
      lastName,
      email,
      approved: true,
      password: hashedPassword,
      phone,
      role: "user",
    });

    console.log("💾 Saving new user:", newUser);

    const savedUser = await newUser.save();
    console.log("✅ User saved successfully:", savedUser._id);

    // Step 4: JWT token
    console.log("🔑 Signing JWT token...");
    const token = jwt.sign(
      { userId: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    console.log("✅ JWT generated:", token);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        role: "user",
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
      }
    });

  } catch (err) {
    console.error("❌ Registration Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: err.message,
    });
  }
};


// ------------------ REGISTER ------------------
const AdminCreateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address } = req.body;

    const createdBy = req.user?._id;
    if (!createdBy) {
      return errorResponse(res, "only admin can create user", 403, err);
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return errorResponse(res, "Email already in use", 400);

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      address,
      balance: 10,
      role: "user",
    });

    const savedUser = await newUser.save();

    // Generate token for the new user
    const token = jwt.sign(
      { userId: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    await logUserAction({
      userId: savedUser._id,
      action: "REGISTER",
      model: "User",
      details: { email, firstName, lastName },

      req
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user: savedUser, token }, // include token
    });
  } catch (err) {
    return errorResponse(res, "Failed to register user", 500, err);
  }
};



// ------------------ LOGIN ------------------
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return errorResponse(res, "Email and password are required", 400);

    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, "Invalid email or password", 404);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse(res, "Invalid email or password", 402);

    if (!user.status) return errorResponse(res, "Account Deactivated", 403);
    if (!user.approved) return errorResponse(res, "Account pending for approval.", 403);

    // Update last login
    user.lastLogin = new Date();

    // Device info from headers (mobile)
    user.deviceId = req.headers["x-device-id"] || user.deviceId;
    user.deviceModel = req.headers["x-device-model"] || user.deviceModel || req.headers["user-agent"];
    user.appVersion = req.headers["x-app-version"] || user.appVersion || "Browser";
    user.deviceToken = req.headers["x-device-token"] || user.deviceToken; // only for mobile
    user.playerId = req.headers["x-player-id"] || user.playerId; // only for mobile


    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    user.activeToken = token;
    await user.save();

    await logUserAction({
      userId: user._id,
      action: "LOGIN",
      model: "User",
      details: { email },
      req
    });

    return res.json({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (err) {
    return errorResponse(res, "Failed to login", 500, err);
  }
};


// ------------------ VALIDATE TOKEN ------------------
const validateToken = async (req, res) => {
  try {
    let token = req.headers.authorization;
    if (token && token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }
    if (!token) return errorResponse(res, "No token provided", 401);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return errorResponse(res, "Invalid or expired token", 401);
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return errorResponse(res, "User not found", 404);
    if (user.activeToken !== token) {
      return res.status(401).send("Logged in from another device");
    }

    // Optional: Log token validation
    await logUserAction({
      userId: user._id,
      action: "VALIDATE_TOKEN",
      model: "User",
      details: { tokenValid: true },
      req,
    });

    return res.json({
      success: true,
      message: "Token is valid",
      user
    });
  } catch (err) {
    return errorResponse(res, "Failed to validate token", 500, err);
  }
};

// ------------------ GET ALL USERS ------------------
const getAllUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // 🔍 Build search query
    let query = {};
    if (search && search.trim() !== "") {
      const regex = new RegExp(search, "i"); // case-insensitive
      query = {
        $or: [
          { firstName: regex },
          { lastName: regex },
          { email: regex },
          { phone: regex },
          { address: regex }
        ]
      };
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    // 🔹 Log action
    await logUserAction({
      userId: req.user?._id,
      action: "READ",
      model: "User",
      details: { page, limit, search, count: users.length },
      req,
    });

    return res.json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: users,
    });
  } catch (err) {
    return errorResponse(res, "Failed to fetch users", 500, err);
  }
};


// ------------------ GET USER BY ID ------------------
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, "User not found", 404);

    await logUserAction({
      userId: req.user?._id,
      action: "READ",
      model: "User",
      details: { userId: user._id },
      req
    });

    return res.json(user);
  } catch (err) {
    return errorResponse(res, "Failed to fetch user", 500, err);
  }
};

// ------------------ UPDATE USER ------------------
const updateUser = async (req, res) => {
  try {
    const updates = { ...req.body, updatedBy: req.user?._id || null };
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return errorResponse(res, "User not found", 404);

    await logUserAction({
      userId: req.user?._id,
      action: "UPDATE",
      model: "User",
      details: { userId: user._id, updates },
      req
    });

    return res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (err) {
    return errorResponse(res, "Failed to update user", 500, err);
  }
};

// ------------------ DEACTIVATE USER ------------------
const deactivateUser = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { status: status }, { new: true });
    if (!user) return errorResponse(res, "User not found", 404);

    await logUserAction({
      userId: req.user?._id,
      action: "DEACTIVATE",
      model: "User",
      details: { userId: user._id },
      req
    });

    return res.json({
      success: true,
      message: "User deactivated successfully",
      data: user,
    });
  } catch (err) {
    return errorResponse(res, "Failed to deactivate user", 500, err);
  }
};

// ------------------ LOGOUT FROM DEVICE ------------------
const logoutFromDevice = async (req, res) => {
  try {
    const { userId, deviceId } = req.body;
    if (!userId || !deviceId) return errorResponse(res, "userId and deviceId are required", 400);

    const user = await User.findById(userId);
    if (!user) return errorResponse(res, "User not found", 404);

    if (user.deviceId === deviceId) {
      user.deviceId = null;
      user.deviceToken = null;
      user.playerId = null;
      await user.save();
    }

    await logUserAction({
      userId,
      action: "LOGOUT",
      model: "User",
      details: { deviceId },
      req
    });

    return res.json({
      success: true,
      message: "Logged out from device successfully",
      data: user,
    });
  } catch (err) {
    return errorResponse(res, "Failed to logout from device", 500, err);
  }
};

// ------------------ PROFILE IMAGE UPLOAD ------------------
const profileImageUpload = async (req, res) => {
  try {
    if (!req.file) return errorResponse(res, "No file uploaded", 400);

    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, "User not found", 404);

    user.profileImage = req.file.path;
    await user.save();

    await logUserAction({
      userId: req.user?._id,
      action: "UPLOAD_PROFILE_IMAGE",
      model: "User",
      details: { userId: user._id, filePath: req.file.path },
      req
    });

    return res.json({
      success: true,
      message: "Profile image uploaded successfully",
      data: user,
    });
  } catch (err) {
    return errorResponse(res, "Failed to upload profile image", 500, err);
  }
};

// ------------------ FORGOT PASSWORD ------------------
const forgotPassword = async (req, res) => {
  const { phone, otp, password } = req.body;

  if (!phone) {
    return errorResponse(res, "Phone is required", 400);
  }

  try {
    // Step 1: Send OTP if not provided
    if (!otp) {
      const user = await User.findOne({ phone });
      if (!user) {
        return errorResponse(res, "User not found with this phone", 404);
      }

      // Generate OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = Date.now() + 5 * 60 * 1000; // 5 mins

      await Otp.findOneAndUpdate(
        { phone },
        { otp: generatedOtp, expiresAt: expiry },
        { upsert: true, new: true }
      );

      // Send OTP via SMS API
      const apiKey = process.env.SMS_API_KEY;
      const senderId = process.env.SMS_SENDER_ID || "DRAFT4";
      const templateId = process.env.SMS_TEMPLATE_ID;
      const message = `Hello Upayog User, Your mobile verification code is ${generatedOtp}. Use it on Upayog. Please don't share this code to anyone. Thank you.`;
      const url = `https://text.draft4sms.com/vb/apikey.php?apikey=${apiKey}&senderid=${senderId}&number=${phone}&message=${encodeURIComponent(
        message
      )}&templateid=${templateId}`;

      const response = await axios.get(url);
      if (!response.data || response.data.status !== "Success") {
        return errorResponse(res, "Failed to send OTP", 500);
      }

      return res.status(200).json({ success: true, message: "OTP sent successfully" });
    }

    // Step 2: Verify OTP
    const otpRecord = await Otp.findOne({ phone });
    if (!otpRecord || otpRecord.otp !== otp || otpRecord.expiresAt < Date.now()) {
      return errorResponse(res, "Invalid or expired OTP", 400);
    }

    // Remove OTP after verification
    await Otp.deleteOne({ phone });

    // Step 3: Reset password
    if (!password) {
      return errorResponse(res, "Password is required to reset", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await User.findOneAndUpdate(
      { phone },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return errorResponse(res, "Failed to update user", 500);
    }

    return res.status(200).json({ success: true, message: "Password reset successfully" });

  } catch (err) {
    return errorResponse(res, "Failed to reset password", 500, err);
  }
};


// ------------------ GET NOT APPROVED USERS ------------------
const getNotApprovedUsers = async (req, res) => {
  try {
    const users = await User.find({ approved: false, isDeleted: false });

    return res.json({
      success: true,
      message: "Not approved users fetched successfully",
      data: users,
    });
  } catch (err) {
    return errorResponse(res, "Failed to fetch not approved users", 500, err);
  }
};

// ------------------ APPROVE USER ------------------
const approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );

    if (!user) return errorResponse(res, "User not found", 404);

    await logUserAction({
      userId: req.user?._id,
      action: "APPROVE",
      model: "User",
      details: { userId: user._id },
      req,
    });

    return res.json({
      success: true,
      message: "User approved successfully",
      data: user,
    });
  } catch (err) {
    return errorResponse(res, "Failed to approve user", 500, err);
  }
};

// ------------------ DELETE USER (Soft Delete) ------------------
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!user) return errorResponse(res, "User not found", 404);

    // 🔹 Log user action
    await logUserAction({
      userId: req.user?._id,
      action: "DELETE",
      model: "User",
      details: { userId: user._id },
      req,
    });

    return res.json({
      success: true,
      message: "User deleted successfully",
      data: user,
    });
  } catch (err) {
    return errorResponse(res, "Failed to delete user", 500, err);
  }
};




module.exports = {
  registerUser,
  AdminCreateUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  logoutFromDevice,
  profileImageUpload,
  forgotPassword,
  validateToken,
  getNotApprovedUsers,
  approveUser,
  deleteUser,
};

