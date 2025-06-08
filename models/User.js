import mongoose from "mongoose";
import jwt from "jsonwebtoken"

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    registration: String,
    phone: {
        type: Number,
        required: true
    },
    city: String,
    marks: [Number],
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    }
}, { timestamps: true });

UserSchema.index({ phone: 1, adminId: 1 }, { unique: true });

UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            name: this.firstName + " " + this.lastName,
            phone: this.phone,
            city: this.city,
            adminId: this.adminId,
        },
        process.env.ACESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACESS_TOKEN_EXPIRY
        }
    )
}

const User = mongoose.model("User", UserSchema);

export default User;