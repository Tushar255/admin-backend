import Admin from "../models/Admin.js";
import Predict from "../models/Predict.js"

export const getAllRecords = async (req, res) => {
    try {
        const adminId = req.admin._id;
        const allEntries = await Predict.find({ adminId }).select("-__v -createdAt -updatedAt");
        res.status(200).json(allEntries);
    } catch (error) {
        res.status(400).json({ error: err.message });
    }
}

export const createNewRecord = async (req, res) => {
    try {
        const adminId = req.admin._id;
        const newEntry = new Predict({ ...req.body, adminId });
        const saved = await newEntry.save();
        res.status(200).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

export const editRecord = async (req, res) => {
    try {
        const adminId = req.admin._id;

        const updated = await Predict.findOneAndUpdate(
            { _id: req.params.id, adminId },
            { $set: req.body },
            { new: true }
        );

        if (!updated) return res.status(404).json({ msg: "Record not found or unauthorized" });

        res.status(200).json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

export const deleteRecord = async (req, res) => {
    try {
        const adminId = req.admin._id;

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

export const adminLogin = async (req, res) => {
    const { phone } = req.body;

    const admin = await Admin.findOne({ phone: phone });

    if (!admin || !admin.isActive) {
        return res.status(404).json({ isActive: false, msg: "You are not an Admin" });
    }

    const accessToken = admin.generateAccessToken();

    return res.status(200).json({ phone, accessToken, isActive: admin.isActive, msg: "Sign In successful!" });
}

export const addAdmin = async (req, res) => {
    const { phone, name, isActive } = req.body;

    if (!phone || !name || !isActive) {
        return res.status(400).json({ msg: "All fields required" });
    }

    const newAdmin = await Admin.create({ phone, name, isActive });

    res.status(200).json(newAdmin);
}