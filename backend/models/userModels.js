import pool from '../config/db.js';

export const getAllUsersService = async () => {
}

export const getUserByIdService = async (id) => {
}

export const createUserService = async (user) => {
}

export const updateUserByIdService = async (id, name, email) => {
}

export const deleteUserByIdService = async (id) => {
}

export const getUserByEmailService = async (email) => {
    try{
        const query = `SELECT * FROM users WHERE email = $1`;
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }catch(error){
        console.error("Error getting user by email:", error);
        throw error;
    }
}
