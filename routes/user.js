import express from "express";
import { login, signup, status } from "../controllers/user.js";

const router = express.Router();

router.route("/login").post(login);

router.route("/signup").post(signup);

router.route("/status").post(status);

export default router;
