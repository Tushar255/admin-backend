import User from "../models/User.js"
import jwt from "jsonwebtoken";

export const getAllUsers = async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        
        if (isNaN(index) || index < 0 || index > 2) {
            return res.status(400).json({ msg: "Invalid index provided" });
        }

        const users = await User.aggregate([
            {
                $addFields: {
                    markAtIndex: { $arrayElemAt: ["$marks", index] }
                }
            },
            {
                $sort: { markAtIndex: -1 }
            },
            {
                $project: { refreshToken: 0, __v: 0, markAtIndex: 0, _id: 0 }
            }
        ]);

        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ msg: "Something went wrong" });
    }
}

export const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }

    } catch (error) {
        res.status(500).json({ msg: "Something went wrong while generating access and refresh token" })
    }
}

export const login = async (req, res) => {
    const { phone } = req.body;

    try {
        if (!phone) {
            return res.status(400).json({ msg: "Phone no. fields are required" });
        }

        let user = await User.findOne({ phone: phone })

        if (!user) {
            user = await User.create({ phone });
            return res.status(200).json({ profileCompleted: false, msg: "New-User created" })
        }

        if (!user.firstName || !user.lastName || !user.city || !user.exam) {
            return res.status(404).json({ profileCompleted: false, msg: "Please fill your remaining details" })
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const loggedInUser = await User.findById({ _id: user._id }).select("-refreshToken")

        return res.status(200).json({ user: loggedInUser, accessToken, refreshToken, profileCompleted: true });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export const logout = async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    return res.status(200).json({ msg: "User logged out" })
}

export const signup = async (req, res) => {
    const { firstName, lastName, phone, city, exam } = req.body;

    try {
        if (!firstName || !lastName || !city || !phone || !exam) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        let user = await User.findOne({ phone: phone });

        if (!user) {
            res.status(400).json({ msg: "User doesn't exist" })
        }

        user.firstName = firstName;
        user.lastName = lastName;
        user.city = city;
        user.exam = exam;
        await user.save();

        user = await User.findById(user._id)

        if (user) {
            const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

            return res.status(200).json({ user, accessToken, refreshToken, msg: "Successfully Signed In" });
        } else {
            return res.status(500).json({ msg: "Something went wrong while registering the user" })
        }
    } catch (error) {
        return res.status(500).json({ msg: "Something went wrong" });
    }
};

export const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken = req.body.refreshToken

    if (!incomingRefreshToken) {
        return res.status(401).json({ msg: "unauthorized request" })
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            res.status(401).json({ msg: "Invaid refresh token" })
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            res.status(401).json({ msg: "Refresh token is expired or used" })
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
        user.refreshToken = newRefreshToken;
        await user.save();

        return res.status(200).json({ accessToken, refreshToken: newRefreshToken, msg: "Access token refreshed" })
    } catch (error) {
        return res.status(401).json({ error: error?.message || "Invalid refresh token" })
    }
}
