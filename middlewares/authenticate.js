const dotenv = require('dotenv');
dotenv.config();

const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');

const secretKey = process.env.JWT_SECRET;

const authenticate = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token && token.startsWith("Bearer ")) {
      token = token.split(" ")[1]; 
    }


    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    

    if (!secretKey) {
      return res.status(500).json({
        success: false,
        message: 'Server error: JWT secret not configured.',
      });
    }

    const decoded = jwt.verify(token, secretKey);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.',
      });
    }
    if (user.activeToken !== token) {
      return res.status(401).send("Logged in from another device");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {


      return res.status(401).json({
        success: false,
        message: 'Token has expired.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
      errorDetails: error.message,
    });
  }
};

module.exports = authenticate;