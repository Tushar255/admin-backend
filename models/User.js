import mongoose from "mongoose";
import jwt from "jsonwebtoken"

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    registration: {
        type: String
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    city: {
        type: String,
    },
    institute: {
        type: String,
    },
    marks: {
        type: [Number]
    }
}, { timestamps: true }
);

UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            name: this.firstName + " " + this.lastName,
            phone: this.phone,
            city: this.city,
            institute: this.institute,
        },
        process.env.ACESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACESS_TOKEN_EXPIRY
        }
    )
}

const User = mongoose.model("User", UserSchema);

export default User;