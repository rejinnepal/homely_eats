const mongoose = require('mongoose');

const dinnerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  maxGuests: {
    type: Number,
    required: true
  },
  currentGuests: {
    type: Number,
    default: 0
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  menu: [{
    name: String,
    description: String
  }],
  images: [{
    data: Buffer,
    contentType: String
  }],
  cuisine: {
    type: String,
    required: true
  },
  dietaryRestrictions: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['available', 'full', 'cancelled'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add logging for dinner creation
dinnerSchema.pre('save', function(next) {
  console.log('Saving dinner:', {
    id: this._id,
    title: this.title,
    host: this.host,
    date: this.date,
    status: this.status
  });
  next();
});

// Add logging for dinner retrieval
dinnerSchema.post('find', function(docs) {
  console.log('Retrieved dinners:', {
    count: docs.length,
    dinnerIds: docs.map(d => d._id),
    dinnerTitles: docs.map(d => d.title),
    hosts: docs.map(d => d.host)
  });
});

module.exports = mongoose.model('Dinner', dinnerSchema); 