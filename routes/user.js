import express from "express";
import { getAllUsers, login, signup, verifyPhone } from "../controllers/user.js";
import adminProtect from "../middleware/admin-auth.js";

const router = express.Router();

router.route("/login").post(login);

router.route("/signup").post(signup);

router.route("/verify").post(verifyPhone);

router.route("/all-users/:index").get(adminProtect, getAllUsers);

export default router;
