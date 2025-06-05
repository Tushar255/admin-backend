import jwt from "jsonwebtoken"
import Admin from "../models/Admin.js"

const adminProtect = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer", "").trim()

        if (!token) {
            return res.status(401).json({ msg: "Unauthorized request" })
        }

        const decodedToken = jwt.verify(token, process.env.ACESS_TOKEN_SECRET)

        const admin = await Admin.findById(decodedToken?._id).select("-__v -createdAt -updatedAt");

        if (!admin || !admin.isActive) {
            return res.status(403).json({ msg: "Unauthorized or Inactive Admin" });
        }

        req.admin = admin
        next()
    } catch (error) {
        return res.status(401).json({ error: error.msg })
    }
}

export default adminProtect;