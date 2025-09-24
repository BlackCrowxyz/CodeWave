import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

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

};

export const signout = async (req, res, next) => {
 
};
