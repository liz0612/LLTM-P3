import dotenv from 'dotenv';
dotenv.config();  // This loads the .env variables into `process.env`

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import moment from 'moment';
import mongoose from 'mongoose';

// Create an express app
const app = express();

// Middleware setup
app.use(cors());
app.use(cookieParser());
app.use(morgan('dev')); // logs HTTP requests to the console
app.use(helmet()); // security middleware to set various HTTP headers

// Body parser
app.use(express.json()); // parses incoming requests with JSON payloads

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error:', err));

// Example route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start the server
const PORT = process.env.PORT || 3000;  // Changed from 5000 to 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});