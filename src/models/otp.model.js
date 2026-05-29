import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },

    otp: {
      type: String,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      expires: 30, // 30 seconds
    },
  },
  {
    timestamps: true,
  }
);

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;