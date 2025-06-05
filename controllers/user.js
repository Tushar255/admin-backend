import Admin from "../models/Admin.js";
import User from "../models/User.js"
import { sendOTP } from "../utils/otpService.js";

export const getAllUsers = async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const adminId = req.admin._id || req.user?.adminId
        
        if (isNaN(index) || index < 0 || index > 2) {
            return res.status(400).json({ msg: "Invalid index provided" });
        }

        if (!adminId) {
            return res.status(400).json({ msg: "adminId is required" });
        }

        const users = await User.aggregate([
            {
                $match: {
                    adminId: adminId
                }
            },
            {
                $addFields: {
                    markAtIndex: { $arrayElemAt: ["$marks", index] }
                }
            },
            {
                $sort: { markAtIndex: -1 }
            },
            {
                $project: { __v: 0, markAtIndex: 0, _id: 0 }
            }
        ]);

        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ msg: "Something went wrong" });
    }
}

export const verifyPhone = async (req, res) => {
    const { phone, adminId } = req.body;

    if (!phone || !adminId) {
        return res.status(400).json({ msg: "Phone number & AdminID are required" });
    }

    try {
        const admin = await Admin.findById(adminId);

        if (!admin || !admin.isActive) {
            return res.status(403).json({ isActive: admin.isActive, msg: "Institution is inactive or invalid" });
        }

        const otpResponse = await sendOTP(phone, adminId);

        if (!otpResponse.success) {
            return res.status(400).json({ isActive: admin.isActive, msg: otpResponse.msg });
        }

        return res.status(200).json({ isActive: admin.isActive, msg: "OTP sent successfully", otp: otpResponse.otp });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const login = async (req, res) => {
    const { phone } = req.body;

    try {
        if (!phone) {
            return res.status(400).json({ msg: "Phone no. is required" });
        }

        let user = await User.findOne({ phone: phone }).select("-__v -createdAt -updatedAt");

        if (!user) {
            user = await User.create({ phone });
            return res.status(200).json({ profileCompleted: false, msg: "New-User created" })
        }

        if (!user.firstName || !user.lastName || !user.city || !user.adminId) {
            return res.status(404).json({ profileCompleted: false, msg: "Please fill your remaining details" })
        }

        const accessToken = user.generateAccessToken();

        return res.status(200).json({ user, accessToken, profileCompleted: true });
    } catch (error) {
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

        if (!admin || !admin.isActive) {
            return res.status(403).json({ isActive: admin.isActive, msg: "Institution is inactive or invalid" });
        }

        let user = await User.findOne({ phone: phone }).select("-__v -createdAt -updatedAt");

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
        return res.status(500).json({ msg: "Something went wrong" });
    }
};