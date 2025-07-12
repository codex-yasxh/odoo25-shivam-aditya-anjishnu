const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Import routes
const userRoutes = require('./routes/userRoutes');
const swapRoutes = require('./routes/swapRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler'); // Make sure this file exists and exports a middleware

// Middleware
// Enable CORS for all routes
app.use(cors());
// Parse JSON request bodies
app.use(express.json());
// Parse URL-encoded request bodies (for form data)
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded images
// Serves files from the 'uploads' directory under the '/uploads' URL path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File upload configuration for Multer
const storage = multer.diskStorage({
  // Define the destination folder for uploaded files
  destination: function (req, file, cb) {
    // 'uploads/' will be created in the root of your backend directory if it doesn't exist
    cb(null, 'uploads/');
  },
  // Define the filename for uploaded files
  filename: function (req, file, cb) {
    // Create a unique filename to prevent collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Combine fieldname, unique suffix, and original file extension
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Initialize Multer upload instance with storage and validation rules
const upload = multer({
  storage: storage,
  // Set file size limit to 5MB
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  // Filter files to allow only images
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept the file
    } else {
      // Reject the file with an error message
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  }
});

// File upload endpoint
// Handles single image uploads to '/api/upload'
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    // Check if a file was actually uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Construct the URL to access the uploaded file
    const fileUrl = `/uploads/${req.file.filename}`;
    // Send success response with file URL
    res.json({
      message: 'File uploaded successfully',
      fileUrl: fileUrl
    });
  } catch (error) {
    // Handle any errors during file upload (e.g., file size limit, file type)
    res.status(500).json({ error: error.message });
  }
});

// Database connection
// Connects to MongoDB using the URI from environment variables or a default local one
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap', {
  useNewUrlParser: true,    // Recommended for new connections
  useUnifiedTopology: true, // Recommended for new connections
})
.then(() => console.log('MongoDB connected')) // Log success
.catch(err => console.error('MongoDB connection error:', err)); // Log error

// Routes
// Mount imported route modules under specific API paths
app.use('/api/users', userRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
// Provides a simple status check for the API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    service: 'Skill Swap Platform API'
  });
});

// Root endpoint
// Provides basic information about the API and available endpoints
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Skill Swap Platform API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      swaps: '/api/swaps',
      feedback: '/api/feedback',
      admin: '/api/admin',
      health: '/api/health',
      upload: '/api/upload' // Added upload endpoint for clarity
    }
  });
});

// Error handling middleware (should be last, before 404 handler if you have one)
// This catches errors passed by 'next(err)' from other middleware/routes
app.use(errorHandler);

// 404 handler - This middleware will be executed if no other route matches the request
// It should be placed AFTER all other routes and error handlers.
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// Define the port for the server to listen on
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
