import User from "../models/user.model.js";
import bcrypt  from "bcryptjs";
import jwt from "jsonwebtoken";

import OTP from "../models/otp.model.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendEmail } from "../config/mail.js";

// GET /api/auth/
export const home = (req, res) => {
    res.status(200).json({message: "Backend Server is Running"});
};

//register

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log("Received registration data:", { username, email });
        // 1. Check if already registered
        const isAlreadyRegistered = await User.findOne({ $or: [{ email }, { username }] });
        if (isAlreadyRegistered) {
            return res.status(409).json({ message: "User already registered" });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create user
        const user = await User.create({ username, email, password: hashedPassword });

        // 4. Generate access token
        const accessToken = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: "15m" }
        );

        res.status(201).json({ 
            message: "User registered successfully", 
            user: { username: user.username, email: user.email },
            accessToken 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//login
export const login = async (req, res) => {
  try {

    // get data from body
    const { email, password } = req.body;
    
    // check user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // compare password
    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {

    console.log("Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//logout
export const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};



export const sendOtp = async (req, res) => {
  try { 
    const { email } = req.body;
  

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate OTP
    const otp = generateOtp();

    // Hash OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Delete old OTP
    await OTP.deleteMany({ email });

    // Save new OTP
    await OTP.create({
      email,
      otp: hashedOtp,
    });

    // Send Email
    await sendEmail(
      email,
      "Your OTP Code",
      `
        <h2>Your OTP is: ${otp}</h2>
        <p>Valid for 30 seconds</p>
      `
    );

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    const isOtpCorrect = await bcrypt.compare(
      otp,
      otpRecord.otp
    );

    if (!isOtpCorrect) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Delete OTP after success
    await OTP.deleteMany({ email });

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "OTP expired or invalid" });
    }

    const isOtpCorrect = await bcrypt.compare(otp, otpRecord.otp);

    if (!isOtpCorrect) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    // Delete OTP
    await OTP.deleteMany({ email });

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Password reset failed" });
  }
};