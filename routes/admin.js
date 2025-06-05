import express from "express";
import { adminLogin, createNewRecord, editRecord, deleteRecord, getAllRecords, addAdmin } from "../controllers/admin.js";
import adminProtect from "../middleware/admin-auth.js";

const router = express.Router();

router.route("/signin").post(adminLogin);
router.route("/create").post(adminProtect, createNewRecord);
router.route("/edit/:id").put(adminProtect, editRecord);
router.route("/delete/:id").delete(adminProtect, deleteRecord);
router.route("/getall").get(adminProtect, getAllRecords);
router.route("/add-admin").post(addAdmin);

export default router;
