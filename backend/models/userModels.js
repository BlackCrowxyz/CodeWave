import pool from '../config/db.js';

export const getAllUsersService = async () => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at, updated_at FROM gtfs.users ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error in getAllUsersService:', error);
    throw error;
  }
};

export const getUserByIdService = async (id) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at, updated_at FROM gtfs.users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error in getUserByIdService:', error);
    throw error;
  }
};

export const createUserService = async (user) => {
  try {
    const { name, email, password, role } = user;
    const result = await pool.query(
      'INSERT INTO gtfs.users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name, email, password, role]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error in createUserService:', error);
    throw error;
  }
};

export const updateUserByIdService = async (id, name, email) => {
  try {
    const result = await pool.query(
      'UPDATE gtfs.users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, name, email, role, created_at, updated_at',
      [name, email, id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error in updateUserByIdService:', error);
    throw error;
  }
};

export const deleteUserByIdService = async (id) => {
  try {
    const result = await pool.query(
      'DELETE FROM gtfs.users WHERE id = $1 RETURNING id, name, email',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error in deleteUserByIdService:', error);
    throw error;
  }
};

export const getUserByEmailService = async (email) => {
    try{
        const query = `SELECT * FROM gtfs.users WHERE email = $1`;
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }catch(error){
        console.error("Error getting user by email:", error);
        throw error;
    }
}
