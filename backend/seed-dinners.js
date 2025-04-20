require('dotenv').config();
const mongoose = require('mongoose');
const Dinner = require('./src/models/Dinner');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample dinner data
const sampleDinners = [
  {
    title: 'Authentic Italian Pasta Night',
    description: 'Join us for a traditional Italian pasta dinner with homemade sauces, fresh bread, and wine pairing. Learn about Italian cooking techniques while enjoying a delicious meal.',
    date: new Date('2024-05-15'),
    time: '19:00',
    price: 45,
    maxGuests: 6,
    currentGuests: 0,
    location: {
      address: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105'
    },
    menu: [
      { name: 'Homemade Fettuccine Alfredo', description: 'Creamy parmesan sauce with fresh herbs' },
      { name: 'Classic Spaghetti Bolognese', description: 'Rich meat sauce with tomatoes and garlic' },
      { name: 'Tiramisu', description: 'Traditional Italian dessert with coffee and mascarpone' }
    ],
    images: ['https://images.unsplash.com/photo-1551183053-bf91a1d81141'],
    cuisine: 'Italian',
    dietaryRestrictions: ['Vegetarian option available'],
    status: 'available'
  },
  {
    title: 'Japanese Sushi Making Workshop',
    description: 'Learn the art of sushi making from a professional chef. We\'ll cover rice preparation, fish selection, and rolling techniques. All ingredients and equipment provided.',
    date: new Date('2024-05-20'),
    time: '18:30',
    price: 65,
    maxGuests: 4,
    currentGuests: 0,
    location: {
      address: '456 Market St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103'
    },
    menu: [
      { name: 'California Roll', description: 'Crab, avocado, cucumber' },
      { name: 'Spicy Tuna Roll', description: 'Fresh tuna with spicy sauce' },
      { name: 'Salmon Nigiri', description: 'Fresh salmon over seasoned rice' }
    ],
    images: ['https://images.unsplash.com/photo-1579871494447-9811cf80d66c'],
    cuisine: 'Japanese',
    dietaryRestrictions: ['Gluten-free option available'],
    status: 'available'
  },
  {
    title: 'Mexican Fiesta Night',
    description: 'Experience authentic Mexican cuisine with homemade tortillas, guacamole, and various fillings. Learn about Mexican cooking traditions while enjoying margaritas and music.',
    date: new Date('2024-05-25'),
    time: '19:30',
    price: 40,
    maxGuests: 8,
    currentGuests: 0,
    location: {
      address: '789 Mission St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94110'
    },
    menu: [
      { name: 'Homemade Guacamole', description: 'Fresh avocados with lime and cilantro' },
      { name: 'Carne Asada Tacos', description: 'Grilled steak with onions and cilantro' },
      { name: 'Churros', description: 'Cinnamon sugar pastries with chocolate sauce' }
    ],
    images: ['https://images.unsplash.com/photo-1565299585323-38d6b0865b47'],
    cuisine: 'Mexican',
    dietaryRestrictions: ['Vegetarian option available'],
    status: 'available'
  },
  {
    title: 'Indian Curry Cooking Class',
    description: 'Learn to make authentic Indian curries from scratch. We\'ll cover spice blending, rice preparation, and traditional cooking methods. All skill levels welcome.',
    date: new Date('2024-06-01'),
    time: '18:00',
    price: 55,
    maxGuests: 5,
    currentGuests: 0,
    location: {
      address: '321 Howard St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103'
    },
    menu: [
      { name: 'Butter Chicken', description: 'Tender chicken in a rich tomato sauce' },
      { name: 'Vegetable Biryani', description: 'Fragrant rice with mixed vegetables' },
      { name: 'Gulab Jamun', description: 'Sweet milk dumplings in syrup' }
    ],
    images: ['https://images.unsplash.com/photo-1585937421612-70a008356fbe'],
    cuisine: 'Indian',
    dietaryRestrictions: ['Vegetarian option available', 'Gluten-free option available'],
    status: 'available'
  },
  {
    title: 'Mediterranean Meze Night',
    description: 'Enjoy a variety of Mediterranean small plates with wine pairing. Learn about the health benefits of the Mediterranean diet while sampling authentic dishes.',
    date: new Date('2024-06-05'),
    time: '19:00',
    price: 50,
    maxGuests: 6,
    currentGuests: 0,
    location: {
      address: '555 Folsom St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105'
    },
    menu: [
      { name: 'Hummus', description: 'Creamy chickpea dip with olive oil' },
      { name: 'Falafel', description: 'Crispy chickpea fritters with tahini sauce' },
      { name: 'Baklava', description: 'Layered phyllo pastry with nuts and honey' }
    ],
    images: ['https://images.unsplash.com/photo-1541013406133-94ed77c39e59'],
    cuisine: 'Mediterranean',
    dietaryRestrictions: ['Vegetarian', 'Vegan option available'],
    status: 'available'
  }
];

// Function to seed the database
async function seedDinners() {
  try {
    // First, find a host user
    const host = await User.findOne({ role: 'host' });
    
    if (!host) {
      console.error('No host user found. Please create a host user first.');
      process.exit(1);
    }
    
    console.log(`Found host: ${host.name}`);
    
    // Clear existing dinners
    await Dinner.deleteMany({});
    console.log('Cleared existing dinners');
    
    // Add host ID to each dinner
    const dinnersWithHost = sampleDinners.map(dinner => ({
      ...dinner,
      host: host._id
    }));
    
    // Insert the sample dinners
    await Dinner.insertMany(dinnersWithHost);
    console.log(`Added ${sampleDinners.length} sample dinners`);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDinners(); 