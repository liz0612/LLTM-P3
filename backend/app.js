
import dotenv from 'dotenv';
dotenv.config();  // Loads environment variables from .env file

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';  // To hash passwords
import jwt from 'jsonwebtoken';  // For JWT authentication

// Create an express app
const app = express();

// Middleware setup
app.use(cors());
app.use(cookieParser());
app.use(morgan('dev')); // Logs HTTP requests to the console
app.use(helmet()); // Security middleware to set various HTTP headers

// Body parser
app.use(express.json()); // Parses incoming requests with JSON payloads

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error:', err));

// User Schema (for signup)
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

// User model
const User = mongoose.model('User', userSchema);

// Signup Route
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
  
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }
  
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword,
    });
  
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  });

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Check the password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send the response
    res.cookie('auth_token', token, { httpOnly: true });
    res.status(200).json({ message: 'Login successful', token });
});

// Example route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start the server
const PORT = process.env.PORT || 3000;  // Changed from 5000 to 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});