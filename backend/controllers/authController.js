import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { getUserByEmailService } from "../models/userModels.js";

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

export const signup = async (res, req, next) =>{
  // implement singup here
}