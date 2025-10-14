import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config()

const AUTH_KEY = process.env.APP_SECRET;

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({
    status: status,
    message: message,
    data: data
  });
};

const verifyToken = async (req, res, next) => {
  try {
    let token = req.headers["x-access-token"];
    console.log("Access token : ", token)
    if (!token || token == null || token.trim() == "") {
      return handleResponse(res, 400, "Invalid token. Authentication failed.");
    }
    jwt.verify(token, AUTH_KEY, (err, decoded) => {
      if (err) {
        return handleResponse(res, 401, "Unauthorised.");
      }
      console.log("decoded user: ", decoded)
      req.user = {
        id: decoded.id,
        role: decoded.role,
        username: decoded.username
      }
      next();
    });
  } catch (error) {
    console.log(error, 'error')
    return handleResponse(res, 500, "Server error occurred");
  }
};

const verifyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return handleResponse(res, 401, "Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      return handleResponse(res, 403, "Insufficient permissions");
    }

    next();
  };
};

const authJwt = {
  verifyToken,
  verifyRole
};

export default authJwt;
