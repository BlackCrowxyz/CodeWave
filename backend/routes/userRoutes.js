import express from 'express';
const router = express.Router();
import {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../controllers/userController.js';
import authJwt from '../config/authJwt.js';

// Public routes
router.post('/users', createUser);

// Protected routes (require authentication)
router.get('/users/:id', authJwt.verifyToken, getUserById);
router.put('/users/:id', authJwt.verifyToken, updateUser);
router.delete('/users/:id', authJwt.verifyToken, authJwt.verifyRole(['admin']), deleteUser);

export default router;