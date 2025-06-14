import express from "express";
import { adminLogin, createNewRecord, editRecord, deleteRecord, status, getAllRecords } from "../controllers/admin.js";
import adminProtect from "../middleware/admin-auth.js";
import { getAllUsers, searchUsers } from "../controllers/user.js";

const router = express.Router();

router.route("/status").post(status);
router.route("/signin").post(adminLogin);
router.route("/create").post(adminProtect, createNewRecord);
router.route("/edit/:id").put(adminProtect, editRecord);
router.route("/delete/:id").delete(adminProtect, deleteRecord);
router.route("/qwerty/getAllUsers/:index").get(adminProtect, getAllUsers);
router.route("/searchUser").get(adminProtect, searchUsers);
router.route("/getall").get(adminProtect, getAllRecords);
// router.route("/add-admin").post(addAdmin);

export default router;
