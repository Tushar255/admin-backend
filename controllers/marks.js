import Predict from "../models/Predict.js";

const prediction = async (marks, category) => {
    const values = await Predict.findOne({
        'Marks.0': { $lte: marks },
        'Marks.1': { $gte: marks }
    });

    const colleges = values[category];
    const rankRange = values.Rank;

    return { colleges, rankRange }
}

export const addMarks = async (req, res) => {
    const { marks, category, registration } = req.body;

    try {
        let user = req.user;

        if (!marks || !category || !registration) {
            return res.status(400).json({ msg: "All fields are required" })
        }

        // Check if the user has already entered marks 3 times
        if (user.marks.length >= 3) {
            return res.status(400).json({ msg: 'Marks entry limit reached' });
        }

        const { colleges, rankRange } = await prediction(marks, category);

        // Add the new mark
        user.marks.push(marks);

        // Add registration
        if (user.registration == null || user.registration === "")
            user.registration = registration;

        // Save the updated user document
        await user.save();

        const { __v, createdAt, updatedAt, ...cleanUser } = user.toObject();

        return res.status(200).json({ user: cleanUser, colleges, rankRange, msg: "Marks Updated!" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}