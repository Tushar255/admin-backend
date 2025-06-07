import Admin from "../models/Admin.js";
import User from "../models/User.js"
import { checkActiveStatus } from "../utils/checkActiveStatus.js";

export const getAllUsers = async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const page = parseInt(req.query.page, 10) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        const adminId = req.admin?._id || req.user?.adminId;

        if (isNaN(index) || index < 0) {
            return res.status(400).json({ msg: "Invalid index provided" });
        }

        if (!adminId) {
            return res.status(400).json({ msg: "adminId is required" });
        }

        // Get total user count for this admin
        const totalUsers = await User.countDocuments({ adminId });

        const users = await User.aggregate([
            { $match: { adminId } },
            {
                $addFields: {
                    markAtIndex: { $arrayElemAt: ["$marks", index] }
                }
            },
            { $sort: { markAtIndex: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    __v: 0,
                    markAtIndex: 0,
                    _id: 0
                }
            }
        ]);

        const totalPages = Math.ceil(totalUsers / limit);

        return res.status(200).json({
            page,
            totalPages,
            limit,
            totalUsers,
            users
        });
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        return res.status(500).json({ msg: "Something went wrong" });
    }
};

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

export const login = async (req, res) => {
    const { phone, adminId } = req.body;

    try {
        if (!phone || !adminId) {
            return res.status(400).json({ msg: "Phone no. & AdminId is required" });
        }

        let user = await User.findOne({ phone, adminId }).select("-__v -createdAt -updatedAt");

        if (!user) {
            user = await User.create({ phone, adminId });
            return res.status(200).json({ profileCompleted: false, msg: "New-User created" })
        }

        if (!user.firstName || !user.lastName || !user.city || !user.adminId) {
            return res.status(200).json({ profileCompleted: false, msg: "Please fill your remaining details" })
        }

        const accessToken = user.generateAccessToken();

        return res.status(200).json({ user, accessToken, profileCompleted: true });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error });
    }
};

export const signup = async (req, res) => {
    const { firstName, lastName, phone, city, adminId } = req.body;

    try {
        if (!firstName || !lastName || !city || !phone || !adminId) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        const admin = await Admin.findById(adminId);

        if (!admin || !admin?.isActive) {
            return res.status(403).json({ isActive: false, msg: "Institution is invalid" });
        }

        let user = await User.findOne({ phone, adminId }).select("-__v -createdAt -updatedAt");

        if (!user) {
            return res.status(404).json({ msg: "User doesn't exist" })
        }       

        user.firstName = firstName;
        user.lastName = lastName;
        user.city = city;
        user.adminId = adminId;
        await user.save();

        const accessToken = user.generateAccessToken();

        const { __v, createdAt, updatedAt, ...cleanUser } = user.toObject();

        return res.status(200).json({ user: cleanUser, accessToken, msg: "Successfully Signed In" });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ error: error.message  });
    }
};