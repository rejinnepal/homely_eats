const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Dinner = require('../models/Dinner');
const { auth, isHost } = require('../middleware/auth');
const Notification = require('../models/Notification');

// Get all bookings for a user
router.get('/my-bookings', auth, async (req, res) => {
  try {
    // Check if user is in guest role
    if (req.user.activeRole !== 'user') {
      return res.status(403).json({ message: 'Access denied. Guest role required' });
    }

    const bookings = await Booking.find({ guest: req.user._id })
      .populate('dinner')
      .populate('host', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Get all bookings for a host
router.get('/host-bookings', auth, isHost, async (req, res) => {
  try {
    const bookings = await Booking.find({ host: req.user._id })
      .populate({
        path: 'dinner',
        select: 'title date time price location'
      })
      .populate({
        path: 'guest',
        select: 'name email'
      })
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching host bookings', error: error.message });
  }
});

// Create a booking
router.post('/', auth, async (req, res) => {
  try {
    const { dinnerId, numberOfGuests, specialRequests } = req.body;
    
    // Find the dinner
    const dinner = await Dinner.findById(dinnerId);
    if (!dinner) {
      return res.status(404).json({ message: 'Dinner not found' });
    }
    
    // Check if dinner is available
    if (dinner.status !== 'available') {
      return res.status(400).json({ message: 'Dinner is not available' });
    }
    
    // Check if there are enough spots
    if (dinner.currentGuests + numberOfGuests > dinner.maxGuests) {
      return res.status(400).json({ message: 'Not enough spots available' });
    }
    
    // Calculate total price
    const totalPrice = dinner.price * numberOfGuests;
    
    // Create booking
    const booking = new Booking({
      dinner: dinnerId,
      guest: req.user._id,
      host: dinner.host,
      numberOfGuests,
      specialRequests,
      totalPrice,
      status: 'pending', // Set initial status to pending for approval
      notification: true // Set notification flag to true
    });
    
    await booking.save();
    
    // Don't update dinner current guests until booking is confirmed
    // This will be handled in the approval process
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
});

// Update booking status
router.patch('/:id/status', auth, isHost, async (req, res) => {
  try {
    const { status } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Only host can update booking status
    if (booking.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    
    // Get the dinner
    const dinner = await Dinner.findById(booking.dinner);
    if (!dinner) {
      return res.status(404).json({ message: 'Dinner not found' });
    }
    
    // Update booking status
    booking.status = status;
    booking.notification = false; // Mark notification as read
    await booking.save();
    
    // If booking is confirmed, update dinner current guests
    if (status === 'confirmed') {
      dinner.currentGuests += booking.numberOfGuests;
      if (dinner.currentGuests >= dinner.maxGuests) {
        dinner.status = 'full';
      }
      await dinner.save();
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status', error: error.message });
  }
});

// Approve booking
router.patch('/:id/approve', auth, isHost, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('guest', 'name email')
      .populate('dinner', 'title date time price location host');
      
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Only host can approve booking
    if (booking.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to approve this booking' });
    }
    
    // Get the dinner
    const dinner = await Dinner.findById(booking.dinner);
    if (!dinner) {
      return res.status(404).json({ message: 'Dinner not found' });
    }
    
    // Check if there are enough spots
    if (dinner.currentGuests + booking.numberOfGuests > dinner.maxGuests) {
      return res.status(400).json({ message: 'Not enough spots available' });
    }
    
    // Update booking status
    booking.status = 'confirmed';
    booking.notification = false; // Mark notification as read
    await booking.save();
    
    // Update dinner current guests
    dinner.currentGuests += booking.numberOfGuests;
    if (dinner.currentGuests >= dinner.maxGuests) {
      dinner.status = 'full';
    }
    await dinner.save();
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error approving booking', error: error.message });
  }
});

// Reject booking
router.patch('/:id/reject', auth, isHost, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('guest', 'name email')
      .populate('dinner', 'title date time price location host');
      
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Only host can reject booking
    if (booking.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this booking' });
    }
    
    // Update booking status
    booking.status = 'rejected';
    booking.notification = false; // Mark notification as read
    await booking.save();
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting booking', error: error.message });
  }
});

// Cancel booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'dinner',
        select: 'title host currentGuests maxGuests status',
        populate: {
          path: 'host',
          select: '_id name email'
        }
      })
      .populate('guest', 'name');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Only guest can cancel their booking
    if (booking.guest._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
    
    // Update dinner current guests only if booking was confirmed
    if (booking.status === 'confirmed') {
      const dinner = await Dinner.findById(booking.dinner._id);
      if (dinner) {
        dinner.currentGuests -= booking.numberOfGuests;
        if (dinner.status === 'full' && dinner.currentGuests < dinner.maxGuests) {
          dinner.status = 'available';
        }
        await dinner.save();
      }
    }

    // Create notification for the host
    const notification = new Notification({
      recipient: booking.dinner.host._id,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Guest ${booking.guest.name || 'Unknown'} has cancelled their booking for "${booking.dinner.title}"`,
      data: {
        dinnerId: booking.dinner._id,
        bookingId: booking._id
      }
    });
    await notification.save();
    
    // Delete the booking
    await Booking.findByIdAndDelete(req.params.id);
    
    // Return the booking data for frontend notification creation
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling booking', error: error.message });
  }
});

// Update booking
router.patch('/:id', auth, async (req, res) => {
  try {
    const { numberOfGuests, specialRequests } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Only guest can update their booking
    if (booking.guest.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    
    // Only allow updates if booking is pending
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Can only update pending bookings' });
    }
    
    // Get the dinner
    const dinner = await Dinner.findById(booking.dinner);
    if (!dinner) {
      return res.status(404).json({ message: 'Dinner not found' });
    }
    
    // Calculate the difference in guests
    const guestDifference = numberOfGuests - booking.numberOfGuests;
    
    // If increasing guests, check if there are enough spots
    if (guestDifference > 0) {
      if (dinner.currentGuests + guestDifference > dinner.maxGuests) {
        return res.status(400).json({ message: 'Not enough spots available' });
      }
    }
    
    // Update booking
    booking.numberOfGuests = numberOfGuests;
    if (specialRequests !== undefined) {
      booking.specialRequests = specialRequests;
    }
    
    // Recalculate total price
    booking.totalPrice = dinner.price * numberOfGuests;
    
    await booking.save();
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking', error: error.message });
  }
});

module.exports = router; 