import Admin from "../models/Admin.js";
import Predict from "../models/Predict.js"
import { checkActiveStatus } from "../utils/checkActiveStatus.js";


export const getAllRecords = async (req, res) => {
    try {
        const adminId = req?.admin?._id;
        const allEntries = await Predict.find({ adminId }).select("-__v -createdAt -updatedAt");
        res.status(200).json(allEntries);
    } catch (error) {
        res.status(400).json({ error: err.message });
    }
}

export const createNewRecord = async (req, res) => {
    try {
        const adminId = req?.admin?._id;

        if (!adminId) {
            return res.status(401).json({ success: false, msg: "Unauthorized access." });
        }

        const {
            Rank,
            Marks,
            General,
            EWS,
            OBC,
            Pwd,
            SC,
            ST
        } = req.body;

        const requiredFields = { Rank, Marks, General, EWS, OBC, Pwd, SC, ST };
        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return res.status(400).json({
                    success: false,
                    msg: `Field '${key}' is required and must be a non-empty array.`
                });
            }
        }

        const newEntry = new Predict({ ...req.body, adminId });
        const saved = await newEntry.save();

        res.status(201).json({ success: true, data: saved, msg: "Record created successfully." });
    } catch (err) {
        console.error("Create Record Error:", err);
        res.status(500).json({ success: false, msg: "Failed to create record.", error: err.message });
    }
};

export const editRecord = async (req, res) => {
    try {
        const adminId = req?.admin?._id;
        const updateData = req.body;

        if (!adminId) {
            return res.status(401).json({ success: false, msg: "Unauthorized access." });
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, msg: "No data provided to update." });
        }

        const updated = await Predict.findOneAndUpdate(
            { _id: req.params.id, adminId },
            { $set: updateData },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, msg: "Record not found or unauthorized." });
        }

        res.status(200).json({ success: true, data: updated, msg: "Record updated successfully." });
    } catch (err) {
        console.error("Edit Record Error:", err);
        res.status(500).json({ success: false, msg: "Failed to update record.", error: err.message });
    }
};

export const deleteRecord = async (req, res) => {
    try {
        const adminId = req?.admin?._id;

        const deleted = await Predict.findOneAndDelete({
            _id: req.params.id,
            adminId
        });

        if (!deleted) {
            return res.status(404).json({ msg: "Not found or unauthorized" });
        }
        
        res.status(200).json({ msg: "Entry deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const status = async (req, res) => {
    const { adminId } = req.body;

    if (!adminId) {
        return res.status(400).json({ msg: "AdminID is required" });
    }

    try {
        const { statusCode, msg } = await checkActiveStatus(adminId);

        if (statusCode !== 200) {
            return res.status(statusCode).json({ isActive: false, msg: msg });
        }

        return res.status(statusCode).json({ isActive: true, msg: msg });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const adminLogin = async (req, res) => {
    try {
        const { phone, adminId } = req.body;

        if (!phone || !adminId) {
            return res.status(400).json({ success: false, msg: "Phone number & adminId are required." });
        }

        const admin = await Admin.findOne({ phone, _id: adminId });

        if (!admin || !admin?.isActive) {
            return res.status(404).json({ success: false, isActive: false, msg: "You are not an Admin." });
        }

        const accessToken = admin.generateAccessToken();

        return res.status(200).json({
            success: true,
            phone,
            accessToken,
            isActive: admin.isActive,
            msg: "Sign In successful!"
        });

    } catch (error) {
        console.error("Admin login error:", error);
        return res.status(500).json({ success: false, msg: "Internal server error." });
    }
};

// export const addAdmin = async (req, res) => {
//     const { phone, name, isActive } = req.body;

//     if (!phone || !name || !isActive) {
//         return res.status(400).json({ msg: "All fields required" });
//     }

//     const newAdmin = await Admin.create({ phone, name, isActive });

//     res.status(200).json(newAdmin);
// }