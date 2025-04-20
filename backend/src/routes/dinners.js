const express = require('express');
const router = express.Router();
const Dinner = require('../models/Dinner');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const { auth, isHost } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all dinners
router.get('/', async (req, res) => {
  try {
    const dinners = await Dinner.find()
      .populate('host', 'name email')
      .sort({ date: 1 });
    res.json(dinners);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dinners', error: error.message });
  }
});

// Get upcoming dinners
router.get('/upcoming', async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const upcomingDinners = await Dinner.find({
      date: { $gte: today, $lte: thirtyDaysFromNow },
      status: { $ne: 'cancelled' }
    })
      .populate('host', 'name email')
      .sort({ date: 1 });
    
    res.json(upcomingDinners);
  } catch (error) {
    console.error('Error fetching upcoming dinners:', error);
    res.status(500).json({ message: 'Error fetching upcoming dinners', error: error.message });
  }
});

// Get featured dinners
router.get('/featured', async (req, res) => {
  try {
    // For now, we'll consider all available dinners as featured
    // In the future, you could add a 'featured' field to the Dinner model
    const featuredDinners = await Dinner.find({
      status: 'available'
    })
      .populate('host', 'name email')
      .sort({ date: 1 })
      .limit(6); // Limit to 6 featured dinners
    
    res.json(featuredDinners);
  } catch (error) {
    console.error('Error fetching featured dinners:', error);
    res.status(500).json({ message: 'Error fetching featured dinners', error: error.message });
  }
});

// Get host's dinners
router.get('/my-dinners', auth, isHost, async (req, res) => {
  try {
    console.log('Fetching host dinners for user:', {
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      userRole: req.user.activeRole,
      userRoles: req.user.roles
    });
    
    const dinners = await Dinner.find({ host: req.user._id })
      .populate('host', 'name email')
      .sort({ date: 1 });
    
    console.log('Found dinners for host:', {
      count: dinners.length,
      dinnerIds: dinners.map(d => d._id),
      dinnerTitles: dinners.map(d => d.title)
    });
    
    res.json(dinners);
  } catch (error) {
    console.error('Error fetching host dinners:', error);
    res.status(500).json({ message: 'Error fetching host dinners', error: error.message });
  }
});

// Get single dinner
router.get('/:id', async (req, res) => {
  try {
    const dinner = await Dinner.findById(req.params.id)
      .populate('host', 'name email phone');
    if (!dinner) {
      return res.status(404).json({ message: 'Dinner not found' });
    }
    res.json(dinner);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dinner', error: error.message });
  }
});

// Create dinner (host only)
router.post('/', auth, isHost, upload.array('images', 5), async (req, res) => {
  try {
    console.log('Creating dinner with data:', {
      body: req.body,
      files: req.files ? req.files.length : 0
    });

    // Format the location data
    const location = {
      address: req.body.location,
      city: '',  // These can be added later if needed
      state: '',
      zipCode: ''
    };

    // Parse and format the menu data
    let menu = [];
    try {
      menu = JSON.parse(req.body.menu);
    } catch (err) {
      console.error('Error parsing menu data:', err);
      return res.status(400).json({ message: 'Invalid menu data format' });
    }

    // Create the dinner object with the correct format
    const dinner = new Dinner({
      title: req.body.title,
      description: req.body.description,
      host: req.user._id,
      date: new Date(req.body.date),
      time: req.body.time,
      price: req.body.price,
      maxGuests: req.body.maxGuests,
      currentGuests: 0,
      location: location,
      menu: menu,
      cuisine: req.body.cuisine,
      dietaryRestrictions: req.body.dietaryRestrictions || [],
      status: 'available',
      images: req.files ? req.files.map(file => ({
        data: file.buffer,
        contentType: file.mimetype
      })) : []
    });

    await dinner.save();
    console.log('Dinner created successfully:', dinner._id);
    res.status(201).json(dinner);
  } catch (error) {
    console.error('Error creating dinner:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update dinner (host only)
router.put('/:id', auth, isHost, upload.array('images', 5), async (req, res) => {
  try {
    const dinner = await Dinner.findById(req.params.id);
    if (!dinner) {
      return res.status(404).json({ message: 'Dinner not found' });
    }

    if (dinner.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this dinner' });
    }

    // Parse JSON strings from form data
    const location = JSON.parse(req.body.location);
    const menu = JSON.parse(req.body.menu);
    const dietaryRestrictions = JSON.parse(req.body.dietaryRestrictions);

    // Prepare update data
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      date: new Date(req.body.date),
      time: req.body.time,
      price: parseFloat(req.body.price),
      maxGuests: parseInt(req.body.maxGuests),
      location: location,
      menu: menu,
      cuisine: req.body.cuisine,
      dietaryRestrictions: dietaryRestrictions
    };

    // If new images are uploaded, add them to the update data
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => ({
        data: file.buffer,
        contentType: file.mimetype
      }));
    }

    const updatedDinner = await Dinner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedDinner);
  } catch (error) {
    console.error('Error updating dinner:', error);
    res.status(500).json({ message: 'Error updating dinner', error: error.message });
  }
});

// Delete dinner (host only)
router.delete('/:id', auth, isHost, async (req, res) => {
  try {
    const dinner = await Dinner.findById(req.params.id);
    
    if (!dinner) {
      return res.status(404).json({ message: 'Dinner not found' });
    }

    // Check if the user is the host of this dinner
    if (dinner.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this dinner' });
    }

    // Find all bookings for this dinner before deletion
    const bookings = await Booking.find({ dinner: dinner._id });

    // Create notifications for the host
    const hostNotification = new Notification({
      recipient: dinner.host,
      type: 'dinner_deleted',
      title: 'Dinner Deleted',
      message: `You have deleted your dinner "${dinner.title}"`,
      relatedDinner: dinner._id
    });
    await hostNotification.save();

    // Create notifications for all guests
    for (const booking of bookings) {
      const guestNotification = new Notification({
        recipient: booking.guest,
        type: 'dinner_deleted',
        title: 'Dinner Deleted',
        message: `The dinner "${dinner.title}" has been deleted by the host`,
        relatedDinner: dinner._id,
        relatedBooking: booking._id
      });
      await guestNotification.save();
    }

    // Delete the dinner
    await Dinner.findByIdAndDelete(req.params.id);

    res.json({ 
      message: 'Dinner deleted successfully',
      notificationsSent: bookings.length + 1 // +1 for host notification
    });
  } catch (error) {
    console.error('Error deleting dinner:', error);
    res.status(500).json({ message: 'Error deleting dinner', error: error.message });
  }
});

// Cancel dinner (host only)
router.patch('/:id/cancel', auth, isHost, async (req, res) => {
  try {
    const dinner = await Dinner.findById(req.params.id);
    
    if (!dinner) {
      return res.status(404).json({ message: 'Dinner not found' });
    }

    // Check if the user is the host of this dinner
    if (dinner.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this dinner' });
    }

    // Update dinner status
    dinner.status = 'cancelled';
    await dinner.save();

    // Find all bookings for this dinner
    const bookings = await Booking.find({ dinner: dinner._id });

    // Create notifications for the host
    const hostNotification = new Notification({
      recipient: dinner.host,
      type: 'dinner_cancelled',
      title: 'Dinner Cancelled',
      message: `You have cancelled your dinner "${dinner.title}"`,
      relatedDinner: dinner._id
    });
    await hostNotification.save();

    // Create notifications for all guests
    for (const booking of bookings) {
      const guestNotification = new Notification({
        recipient: booking.guest,
        type: 'dinner_cancelled',
        title: 'Dinner Cancelled',
        message: `The dinner "${dinner.title}" has been cancelled by the host`,
        relatedDinner: dinner._id,
        relatedBooking: booking._id
      });
      await guestNotification.save();
    }

    res.json({ 
      message: 'Dinner cancelled successfully',
      dinner,
      notificationsSent: bookings.length + 1 // +1 for host notification
    });
  } catch (error) {
    console.error('Error cancelling dinner:', error);
    res.status(500).json({ message: 'Error cancelling dinner', error: error.message });
  }
});

// Get dinner image
router.get('/:id/image/:imageIndex', async (req, res) => {
  try {
    const dinner = await Dinner.findById(req.params.id);
    if (!dinner) {
      return res.status(404).json({ message: 'Dinner not found' });
    }

    const imageIndex = parseInt(req.params.imageIndex);
    if (imageIndex < 0 || imageIndex >= dinner.images.length) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const image = dinner.images[imageIndex];
    res.set('Content-Type', image.contentType);
    res.send(image.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 