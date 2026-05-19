const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/crypto');

const VisitorSchema = new mongoose.Schema({
  passNo: {
    type: String,
    required: true,
    unique: true
  },
  validityDate: {
    type: Date,
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  dob: {
    type: Date,
    required: true
  },
  dor: {
    type: Date,
    required: true
  },
  tor: {
    type: String,
    required: true
  },
  bg: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  identificationMark: {
    type: String,
    trim: true
  },
  skillSet: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  nationality: {
    type: String,
    default: 'Indian',
    trim: true
  },
  aadhaarNumber: {
    type: String,
    required: true,
    set: encrypt,
    get: decrypt
  },
  nokName: {
    type: String,
    trim: true
  },
  nokRelation: {
    type: String,
    trim: true
  },
  nokPhone: {
    type: String,
    trim: true
  },
  valuables: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  photoUrl: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Media', 'Politician', 'Government Officer', 'Normal Visitor']
  },
  qrCode: {
    type: String // Base64 data URL
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model('Visitor', VisitorSchema);
