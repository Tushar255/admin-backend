import mongoose from "mongoose";
import jwt from "jsonwebtoken"

const AdminSchema = new mongoose.Schema({
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
})


AdminSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            phone: this.phone,
            name: this.name,
            isActive: this.isActive
        },
        process.env.ACESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACESS_TOKEN_EXPIRY
        }
    )
}

const Admin = mongoose.model("Admin", AdminSchema);

export default Admin;