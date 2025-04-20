const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  dinner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dinner',
    required: true
  },
  type: {
    type: String,
    enum: ['host_review', 'guest_review'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
reviewSchema.index({ reviewer: 1, reviewed: 1 });
reviewSchema.index({ reviewed: 1, type: 1 });
reviewSchema.index({ dinner: 1 });

// Static method to get average rating for a user
reviewSchema.statics.getAverageRating = async function(userId, type) {
  const result = await this.aggregate([
    {
      $match: {
        reviewed: userId,
        type: type
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  return result[0] || { averageRating: 0, totalReviews: 0 };
};

// Instance method to update user's average rating after a review is created/updated
reviewSchema.methods.updateUserRating = async function() {
  const Review = this.constructor;
  const stats = await Review.getAverageRating(this.reviewed, this.type);
  
  // Update the reviewed user's average rating
  await mongoose.model('User').findByIdAndUpdate(this.reviewed, {
    $set: {
      [`${this.type === 'host_review' ? 'hostRating' : 'guestRating'}.average`]: stats.averageRating,
      [`${this.type === 'host_review' ? 'hostRating' : 'guestRating'}.count`]: stats.totalReviews
    }
  });
};

// Pre-save middleware to ensure one review per dinner
reviewSchema.pre('save', async function(next) {
  const Review = this.constructor;
  const existingReview = await Review.findOne({
    reviewer: this.reviewer,
    reviewed: this.reviewed,
    dinner: this.dinner
  });

  if (existingReview && !this.isModified()) {
    next(new Error('You have already reviewed this user for this dinner'));
  }
  next();
});

// Post-save middleware to update user ratings
reviewSchema.post('save', async function() {
  await this.updateUserRating();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 