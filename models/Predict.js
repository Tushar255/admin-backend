import mongoose from "mongoose";

const PredictSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  Marks: [Number],
  General: [String],
  EWS: [String],
  OBC: [String],
  SC: [String],
  ST: [String],
  Pwd: [String],
  Rank: [Number]
}, { timestamps: true });


const Predict = mongoose.model("Predict", PredictSchema);

export default Predict;