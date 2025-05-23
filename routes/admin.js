import express from "express";
import { adminLogin, createNewRecord, editRecord, deleteRecord, getAllRecords } from "../controllers/admin.js";
import adminProtect from "../middleware/admin-auth.js";

const router = express.Router();

router.route("/signin").post(adminLogin);
router.route("/create").post(adminProtect, createNewRecord);
router.route("/edit/:id").put(adminProtect, editRecord);
router.route("/delete/:id").delete(adminProtect, deleteRecord);
router.route("/getall").get(adminProtect, getAllRecords);

export default router;
