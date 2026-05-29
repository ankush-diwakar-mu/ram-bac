import express from "express";

import {home,register,login,logout,sendOtp,verifyOtp,resetPassword} from "../controllers/auth.controller.js";

import { validate } from "../middleware/validate.middleware.js";

import {registerSchema,loginSchema,} from "../validations/auth.validation.js";

const router = express.Router();

router.get("/", home);

router.post("/register",validate(registerSchema),register);

router.post("/login",validate(loginSchema),login);

router.post("/send-otp",sendOtp);

router.post("/verify-otp",verifyOtp);

router.post("/reset-password",resetPassword);

router.post("/logout", logout);

export default router;