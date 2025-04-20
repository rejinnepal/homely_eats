const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  roles: {
    type: [String],
    enum: ['user', 'host'],
    default: ['user']
  },
  activeRole: {
    type: String,
    enum: ['user', 'host'],
    default: 'user'
  },
  phone: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    default: null
  },
  profileImageData: {
    data: Buffer,
    contentType: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user has a specific role
userSchema.methods.hasRole = function(role) {
  // Normalize the role to ensure consistent format
  const normalizedRole = role ? role.toLowerCase().trim() : null;
  
  console.log('Checking if user has role:', {
    userId: this._id,
    requestedRole: normalizedRole,
    originalRole: role,
    currentRoles: this.roles,
    hasRole: this.roles.includes(normalizedRole)
  });
  
  return this.roles.includes(normalizedRole);
};

// Method to add a role
userSchema.methods.addRole = function(role) {
  // Normalize the role to ensure consistent format
  const normalizedRole = role ? role.toLowerCase().trim() : null;
  
  console.log('Adding role to user:', {
    userId: this._id,
    role: normalizedRole,
    originalRole: role,
    currentRoles: this.roles
  });
  
  if (!this.roles.includes(normalizedRole)) {
    this.roles.push(normalizedRole);
    console.log('Role added successfully:', {
      userId: this._id,
      newRoles: this.roles
    });
  } else {
    console.log('Role already exists:', {
      userId: this._id,
      role: normalizedRole,
      currentRoles: this.roles
    });
  }
};

// Method to set active role
userSchema.methods.setActiveRole = function(role) {
  // Normalize the role to ensure consistent format
  const normalizedRole = role ? role.toLowerCase().trim() : null;
  
  console.log('Setting active role:', {
    userId: this._id,
    requestedRole: normalizedRole,
    originalRole: role,
    currentRoles: this.roles,
    currentActiveRole: this.activeRole,
    hasRole: this.roles.includes(normalizedRole)
  });
  
  if (this.roles.includes(normalizedRole)) {
    this.activeRole = normalizedRole;
    console.log('Active role set successfully:', {
      userId: this._id,
      newActiveRole: this.activeRole
    });
    return true;
  }
  
  console.log('Failed to set active role - role not in roles array:', {
    userId: this._id,
    requestedRole: normalizedRole,
    originalRole: role,
    currentRoles: this.roles
  });
  return false;
};

module.exports = mongoose.model('User', userSchema); 