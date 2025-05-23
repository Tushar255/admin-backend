import Admin from "../models/Admin.js";
import Predict from "../models/Predict.js"

export const getAllRecords = async (req, res) => {
    try {
        const allEntries = await Predict.find();
        res.status(200).json(allEntries);
    } catch (error) {
        res.status(400).json({ error: err.message });
    }
}

export const createNewRecord = async (req, res) => {
    try {
        const newEntry = new Predict(req.body);
        const saved = await newEntry.save();
        res.status(200).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

export const editRecord = async (req, res) => {
    try {
        const updated = await Predict.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

export const deleteRecord = async (req, res) => {
    try {
        const deletedEntry = await Predict.findByIdAndDelete(req.params.id);

        if (!deletedEntry) {
            return res.status(404).json({ msg: "No entry found with this ID" });
        }
        
        res.status(200).json({ msg: "Entry deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const adminLogin = async (req, res) => {
    const { phone } = req.body;

    const potentialAdmin = await Admin.findOne({ phone: phone });

    const isAdmin = potentialAdmin.isAdmin;

    if (!isAdmin) {
        return res.status(404).json({ msg: "Login with a valid Admin Phone number" });
    }

    const accessToken = potentialAdmin.generateAccessToken();

    return res.status(200).json({ phone, accessToken, msg: "Sign In successful!" });
}