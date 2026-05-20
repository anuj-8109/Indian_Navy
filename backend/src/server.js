const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const logRoutes = require('./routes/logRoutes');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/logs', logRoutes);

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Seed default admin user if none exists
const seedDefaultAdmin = async () => {
  try {
    const adminCount = await User.countDocuments();
    if (adminCount === 0) {
      // User model pre-save hook will hash the password
      await User.create({
        username: 'admin',
        password: 'Admin@123',
        isPasswordChanged: false
      });
      console.log('------------------------------------------');
      console.log('DEFAULT ADMIN SEEDED SUCCESSFULLY');
      console.log('Username: admin');
      console.log('Password: Admin@123');
      console.log('Please change the password after your first login.');
      console.log('------------------------------------------');
    }
  } catch (error) {
    console.error('Error seeding default admin:', error);
  }
};

// Seed admin on server start
seedDefaultAdmin();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
