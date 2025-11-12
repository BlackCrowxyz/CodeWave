import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { getUserByEmailService, createUserService } from "../models/userModels.js";

dotenv.config()

const AUTH_KEY = process.env.APP_SECRET;


const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({
    status: status,
    message: message,
    data: data,
  });
};


export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return handleResponse(res, 400, "Email and password are required");
    }
    const user = await getUserByEmailService(email);
    if (!user || !user.password) {
      return handleResponse(res, 401, "Invalid email or password");
    }
    const passwordIsValid = bcrypt.compareSync(
      password,
      user.password
    );
    if (!passwordIsValid) {
      return handleResponse(res, 401, "Invalid email or password");
    }
    const token = jwt.sign({
      id: String(user.id),
      name: user.name,
      role: user.role
    }, AUTH_KEY, {
      expiresIn: 2 * 24 * 3600
    });
    let data = {
      userId: `${user.id}`,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      accessToken: token,
    };
    return handleResponse(res, 200, "Logged in successfully", data);
  } catch (error) {
    console.error("Error user signin:", error);
    next(error);
  }
};



export const signout = async (req, res, next) => {
  try {
    // Simple signout without token blacklisting
    // In a production environment, you might want to implement token blacklisting
    // using a database or other storage mechanism
    
    return handleResponse(res, 200, "Logged out successfully");
  } catch (error) {
    console.error("Error signing out", error);
    next(error);
  }
};

export const checkEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return handleResponse(res, 400, "Email is required");
    }

    const existingUser = await getUserByEmailService(email.trim().toLowerCase());
    
    return handleResponse(res, 200, "Email check completed", {
      exists: !!existingUser
    });
  } catch (error) {
    console.error("Error checking email:", error);
    next(error);
  }
};

export const signup = async (req, res, next) => {
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

    // Generate JWT token
    const token = jwt.sign({
      id: String(newUser.id),
      name: newUser.name,
      role: newUser.role
    }, AUTH_KEY, {
      expiresIn: 2 * 24 * 3600 // 2 days
    });

    const responseData = {
      userId: `${newUser.id}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.created_at,
      accessToken: token,
    };

    return handleResponse(res, 201, "User created successfully", responseData);
  } catch (error) {
    console.error("Error in user signup:", error);
    next(error);
  }
};