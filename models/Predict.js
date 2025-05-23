import mongoose from "mongoose";

const PredictSchema = new mongoose.Schema({
    Marks: {
        type: [Number]
    },
    General: {
        type: [String]
    },
    EWS: {
        type: [String]
    },
    OBC: {
        type: [String]
    },
    SC: {
        type: [String]
    },
    ST: {
        type: [String]
    },
    Pwd: {
        type: [String]
    },
    Rank: {
        type: [Number]
    }
}, { timestamps: true }
);

const Predict = mongoose.model("Predict", PredictSchema);

export default Predict;