require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample host data
const hostData = {
  name: 'Chef Maria Rodriguez',
  email: 'maria@example.com',
  password: 'password123',
  role: 'host',
  phone: '555-123-4567',
  bio: 'Professional chef with 15 years of experience in various cuisines. Passionate about teaching others the art of cooking.',
  profileImage: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c'
};

// Function to seed the host
async function seedHost() {
  try {
    // Check if host already exists
    const existingHost = await User.findOne({ email: hostData.email });
    
    if (existingHost) {
      console.log('Host already exists:', existingHost.name);
      process.exit(0);
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(hostData.password, salt);
    
    // Create the host user
    const host = new User({
      ...hostData,
      password: hashedPassword
    });
    
    await host.save();
    console.log('Host created successfully:', host.name);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedHost(); 