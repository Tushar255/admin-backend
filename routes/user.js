import express from "express";
import { login, logout, refreshAccessToken, signup, getAllUsers } from "../controllers/user.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.route("/login").post(login);

router.route("/logout").post(protect, logout);

router.route("/signup").post(signup);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/all-users/:index").get(getAllUsers);

export default router;
