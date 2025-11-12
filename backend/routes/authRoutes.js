import express from 'express';
import { signin, signout, signup, checkEmail } from '../controllers/authController.js';


const router = express.Router();

router.post('/signin', signin);
router.post('/signout', signout);
router.post('/signup', signup);
router.post('/check-email', checkEmail);

export default router;
