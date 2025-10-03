import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from "./config/db.js";
import errorHandling from './middlewares/errorHandling.js';

import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// Add Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
// app.use('/api/v1', userRoutes);
app.use('/api/v1', authRoutes);

// Error Handling Middleware
app.use(errorHandling)

// Databse Connection
app.get('/', async (req, res) => {
  const result = await pool.query('SELECT current_database()');
  res.send('The Database name is ' + result.rows[0].current_database);

});

// Server Running
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});