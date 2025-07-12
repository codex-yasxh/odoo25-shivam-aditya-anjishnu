const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  profilePhoto: {
    type: String,
    default: null
  },
  skillsOffered: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill name cannot exceed 50 characters']
  }],
  skillsWanted: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill name cannot exceed 50 characters']
  }],
  availability: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Weekdays', 'Weekends', 'Evenings', 'Mornings', 'Afternoons']
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'banned'],
    default: 'active'
  },
  banReason: {
    type: String,
    default: null
  },
  bannedAt: {
    type: Date