import express from "express";
import { adminLogin, createNewRecord, editRecord, deleteRecord, status } from "../controllers/admin.js";
import adminProtect from "../middleware/admin-auth.js";
import { getAllUsers } from "../controllers/user.js";

const router = express.Router();

router.route("/status").post(status);
router.route("/signin").post(adminLogin);
router.route("/create").post(adminProtect, createNewRecord);
router.route("/edit/:id").put(adminProtect, editRecord);
router.route("/delete/:id").delete(adminProtect, deleteRecord);
router.route("/getAllUsers/:index").get(adminProtect, getAllUsers);
// router.route("/add-admin").post(addAdmin);

export default router;
