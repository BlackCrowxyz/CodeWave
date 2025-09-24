import express from 'express';
const router = express.Router();
import {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../controllers/userController.js';

router.post('/user', createUser);
router.get('/users', getAllUsers);
router.get('/users/id', getUserById);
router.put('/users/id', updateUser);
router.delete('/users/id', deleteUser);

export default router;