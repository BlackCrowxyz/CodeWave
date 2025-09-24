import { createUserService, deleteUserByIdService, getAllUsersService, getUserByIdService, updateUserByIdService } from "../models/userModel.js";



const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({
    status: status,
    message: message,
    data: data
  });
}

export const createUser = async (req, res, next) => {

}

export const getAllUsers = async (req, res, next) => {

}

export const getUserById = async (req, res, next) => {

}

export const updateUser = async (req, res, next) => {

}

export const deleteUser = async (req, res, next) => {

}