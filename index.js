import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from "./routes/user.js"
import adminRoutes from "./routes/admin.js"
import marksRoutes from "./routes/marks.js"
import mongoose from 'mongoose';
mongoose.set('strictQuery', true);

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/marks", marksRoutes);

const mongoUri = process.env.MONGO_URI;
const PORT = process.env.PORT;

const connect = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Server started on Port: ${PORT}`));
    } catch (err) {
        console.error('Error connecting to MongoDB', err);
        process.exit(1);
    }
};

connect();