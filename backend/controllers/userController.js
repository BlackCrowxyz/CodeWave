import { createUserService, deleteUserByIdService, getAllUsersService, getUserByIdService, updateUserByIdService, getUserByEmailService } from "../models/userModels.js";



const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({
    status: status,
    message: message,
    data: data
  });
}

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return handleResponse(res, 400, "Name, email, and password are required");
    }

    // Check if user already exists
    const existingUser = await getUserByEmailService(email);
    if (existingUser) {
      return handleResponse(res, 409, "User with this email already exists");
    }

    // Hash password
    const bcrypt = await import('bcrypt');
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    // Create user
    const userData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role
    };

    const newUser = await createUserService(userData);
    return handleResponse(res, 201, "User created successfully", newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await getAllUsersService();
    return handleResponse(res, 200, "Users retrieved successfully", users);
  } catch (error) {
    console.error("Error getting all users:", error);
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return handleResponse(res, 400, "User ID is required");
    }

    const user = await getUserByIdService(id);
    if (!user) {
      return handleResponse(res, 404, "User not found");
    }

    return handleResponse(res, 200, "User retrieved successfully", user);
  } catch (error) {
    console.error("Error getting user by ID:", error);
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!id) {
      return handleResponse(res, 400, "User ID is required");
    }

    if (!name && !email) {
      return handleResponse(res, 400, "At least one field (name or email) is required for update");
    }

    // Check if user exists
    const existingUser = await getUserByIdService(id);
    if (!existingUser) {
      return handleResponse(res, 404, "User not found");
    }

    // Check if email is being updated and if it already exists
    if (email && email !== existingUser.email) {
      const emailExists = await getUserByEmailService(email);
      if (emailExists) {
        return handleResponse(res, 409, "Email already exists");
      }
    }

    const updatedUser = await updateUserByIdService(
      id, 
      name || existingUser.name, 
      email || existingUser.email
    );

    return handleResponse(res, 200, "User updated successfully", updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return handleResponse(res, 400, "User ID is required");
    }

    // Check if user exists
    const existingUser = await getUserByIdService(id);
    if (!existingUser) {
      return handleResponse(res, 404, "User not found");
    }

    const deletedUser = await deleteUserByIdService(id);
    return handleResponse(res, 200, "User deleted successfully", deletedUser);
  } catch (error) {
    console.error("Error deleting user:", error);
    next(error);
  }
};