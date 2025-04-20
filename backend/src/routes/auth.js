const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with initial role
    const user = new User({
      name,
      email,
      password,
      roles: [role || 'user'],
      activeRole: role || 'user',
      phone
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, roles: user.roles, activeRole: user.activeRole },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        activeRole: user.activeRole
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, roles: user.roles, activeRole: user.activeRole },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('Login successful:', {
      userId: user._id,
      roles: user.roles,
      activeRole: user.activeRole
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        activeRole: user.activeRole
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Logout - client-side only, no server action needed
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Verify Token
router.get('/verify', auth, async (req, res) => {
  try {
    res.json({ 
      isValid: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        roles: req.user.roles,
        activeRole: req.user.activeRole
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ isValid: false, error: error.message });
  }
});

// Route to become a host
router.post('/become-host', auth, async (req, res) => {
  try {
    const user = req.user;
    
    console.log('User requesting to become a host:', {
      userId: user._id,
      name: user.name,
      currentRoles: user.roles,
      activeRole: user.activeRole
    });
    
    // Check if user already has the host role
    if (user.roles.includes('host')) {
      console.log('User already has host role:', {
        userId: user._id,
        name: user.name,
        roles: user.roles,
        activeRole: user.activeRole
      });
      
      // Set active role to host if not already
      if (user.activeRole !== 'host') {
        user.activeRole = 'host';
        await user.save();
        
        console.log('Set active role to host:', {
          userId: user._id,
          name: user.name,
          roles: user.roles,
          activeRole: user.activeRole
        });
      }
      
      // Generate a new token with the updated active role
      const token = jwt.sign(
        { userId: user._id, role: user.activeRole },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      
      return res.json({
        message: 'Already a host, active role updated',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          roles: user.roles,
          activeRole: user.activeRole
        },
        token
      });
    }
    
    // Add the host role to the user's roles
    user.addRole('host');
    
    // Set the active role to host
    user.activeRole = 'host';
    
    await user.save();
    
    console.log('User became a host:', {
      userId: user._id,
      name: user.name,
      roles: user.roles,
      activeRole: user.activeRole
    });
    
    // Generate a new token with the updated active role
    const token = jwt.sign(
      { userId: user._id, role: user.activeRole },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Successfully became a host',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        activeRole: user.activeRole
      },
      token
    });
  } catch (error) {
    console.error('Error becoming a host:', error);
    res.status(500).json({ message: 'Error becoming a host', error: error.message });
  }
});

// Switch role
router.post('/switch-role', auth, async (req, res) => {
  try {
    const { role } = req.body;
    
    // Normalize the role to ensure consistent format
    const normalizedRole = role ? role.toLowerCase().trim() : null;
    
    if (!normalizedRole) {
      console.log('No role provided in switch-role request');
      return res.status(400).json({ message: 'Role is required' });
    }
    
    const user = req.user;
    
    console.log('Switch role request received:', {
      userId: user._id,
      userName: user.name,
      requestedRole: normalizedRole,
      originalRole: role,
      currentRoles: user.roles,
      currentActiveRole: user.activeRole,
      hasRole: user.hasRole(normalizedRole)
    });
    
    // Check if user has the requested role
    if (!user.hasRole(normalizedRole)) {
      console.log('User does not have the requested role:', {
        userId: user._id,
        requestedRole: normalizedRole,
        originalRole: role,
        availableRoles: user.roles
      });
      
      // Check if we need to fix the roles array
      if (normalizedRole === 'user' && !user.roles.includes('user')) {
        console.log('Fixing roles array - adding user role');
        user.roles.push('user');
        await user.save();
        
        console.log('Roles array fixed:', {
          userId: user._id,
          roles: user.roles
        });
      } else if (normalizedRole === 'host' && !user.roles.includes('host')) {
        console.log('Fixing roles array - adding host role');
        user.roles.push('host');
        await user.save();
        
        console.log('Roles array fixed:', {
          userId: user._id,
          roles: user.roles
        });
      } else {
        return res.status(400).json({ 
          message: 'User does not have the requested role',
          requestedRole: normalizedRole,
          availableRoles: user.roles
        });
      }
    }
    
    // Set the active role
    const success = user.setActiveRole(normalizedRole);
    
    if (!success) {
      console.log('Failed to set active role:', {
        userId: user._id,
        requestedRole: normalizedRole,
        originalRole: role,
        availableRoles: user.roles
      });
      return res.status(400).json({ 
        message: 'Failed to set active role',
        requestedRole: normalizedRole,
        availableRoles: user.roles
      });
    }
    
    await user.save();
    
    console.log('Role switched successfully:', {
      userId: user._id,
      name: user.name,
      roles: user.roles,
      activeRole: user.activeRole
    });
    
    // Generate a new token with the updated active role
    const token = jwt.sign(
      { userId: user._id, role: user.activeRole },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Role switched successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        activeRole: user.activeRole
      },
      token
    });
  } catch (error) {
    console.error('Error switching role:', error);
    res.status(500).json({ message: 'Error switching role', error: error.message });
  }
});

// Debug route to check and fix user roles
router.get('/debug-user-roles', auth, async (req, res) => {
  try {
    const user = req.user;
    console.log('Debug user roles:', {
      userId: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      activeRole: user.activeRole
    });
    
    // Check if user has both roles
    const hasUserRole = user.roles.includes('user');
    const hasHostRole = user.roles.includes('host');
    
    if (!hasUserRole || !hasHostRole) {
      // Fix the roles array
      const updatedRoles = [];
      if (!hasUserRole) updatedRoles.push('user');
      if (!hasHostRole) updatedRoles.push('host');
      
      // Add missing roles
      user.roles = [...user.roles, ...updatedRoles];
      await user.save();
      
      console.log('Fixed user roles:', {
        userId: user._id,
        name: user.name,
        roles: user.roles,
        activeRole: user.activeRole
      });
      
      return res.json({
        message: 'User roles fixed',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          roles: user.roles,
          activeRole: user.activeRole
        }
      });
    }
    
    return res.json({
      message: 'User roles are correct',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        activeRole: user.activeRole
      }
    });
  } catch (error) {
    console.error('Error in debug user roles:', error);
    res.status(500).json({ message: 'Error checking user roles', error: error.message });
  }
});

module.exports = router; 