import express from 'express';
import { signin, signout,signup } from '../controllers/authController.js';


const router = express.Router();

router.post('/signin', signin);
router.post('/signout', signout);
router.post('/signup',signup);

export default router;
