import jwt from "jsonwebtoken"
import User from "../models/User.js"
import Admin from "../models/Admin.js"

const protect = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer", "").trim()

        if (!token) {
            return res.status(401).json({ msg: "Unauthorized request" })
        }

        const decodedToken = jwt.verify(token, process.env.ACESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-__v -createdAt -updatedAt");

        if (!user) {
            return res.status(401).json({ msg: "Invalid access Token" })
        }

        const admin = await Admin.findById(user.adminId);
        if (!admin || !admin?.isActive) {
            return res.status(403).json({ msg: "Institution is inactive or invalid" });
        }

        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({ error: error.msg })
    }
}

export default protect;