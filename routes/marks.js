import express from 'express';
import { addMarks } from '../controllers/marks.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.route('/add-marks').post(protect, addMarks);

export default router;