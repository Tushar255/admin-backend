import User from "../models/User.js"

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
                $project: { __v: 0, markAtIndex: 0, _id: 0 }
            }
        ]);

        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ msg: "Something went wrong" });
    }
}

export const login = async (req, res) => {
    const { phone } = req.body;

    try {
        if (!phone) {
            return res.status(400).json({ msg: "Phone no. fields are required" });
        }

        let user = await User.findOne({ phone: phone }).select("-__v -createdAt -updatedAt");

        if (!user) {
            user = await User.create({ phone });
            return res.status(200).json({ profileCompleted: false, msg: "New-User created" })
        }

        if (!user.firstName || !user.lastName || !user.city || !user.institute) {
            return res.status(404).json({ profileCompleted: false, msg: "Please fill your remaining details" })
        }

        const accessToken = user.generateAccessToken();

        return res.status(200).json({ user, accessToken, profileCompleted: true });
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
    const { firstName, lastName, phone, city, institute } = req.body;

    try {
        if (!firstName || !lastName || !city || !phone || !institute) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        let user = await User.findOne({ phone: phone }).select("-__v -createdAt -updatedAt");

        if (!user) {
            return res.status(404).json({ msg: "User doesn't exist" })
        }       

        user.firstName = firstName;
        user.lastName = lastName;
        user.city = city;
        user.institute = institute;
        await user.save();

        const accessToken = user.generateAccessToken();

        const { __v, createdAt, updatedAt, ...cleanUser } = user.toObject();

        return res.status(200).json({ user: cleanUser, accessToken, msg: "Successfully Signed In" });
    } catch (error) {
        return res.status(500).json({ msg: "Something went wrong" });
    }
};