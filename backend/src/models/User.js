import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN', 'OPERATOR'],
    default: 'USER'
  },
  preferences: {
    region: String,
    city: String,
    barangay: String,
    favoriteRoutes: [{
      routeId: String,
      type: {
        type: String,
        enum: ['FORMAL', 'INFORMAL']
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    favoriteStops: [{
      stopId: String,
      type: {
        type: String,
        enum: ['FORMAL', 'INFORMAL']
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      preferences: {
        routeUpdates: {
          type: Boolean,
          default: true
        },
        fareChanges: {
          type: Boolean,
          default: true
        },
        serviceAlerts: {
          type: Boolean,
          default: true
        },
        nearbyRoutes: {
          type: Boolean,
          default: false
        }
      }
    },
    theme: {
      type: String,
      enum: ['LIGHT', 'DARK', 'SYSTEM'],
      default: 'SYSTEM'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  profile: {
    phoneNumber: String,
    address: {
      street: String,
      barangay: String,
      city: String,
      region: String
    },
    emergencyContact: {
      name: String,
      phoneNumber: String,
      relationship: String
    }
  },
  travelHistory: [{
    routeId: String,
    type: {
      type: String,
      enum: ['FORMAL', 'INFORMAL']
    },
    fromStop: String,
    toStop: String,
    fare: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  savedLocations: [{
    name: String,
    type: {
      type: String,
      enum: ['HOME', 'WORK', 'SCHOOL', 'OTHER']
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    address: String
  }],
  lastLogin: {
    type: Date,
    default: Date.now
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

// Method to add favorite route
userSchema.methods.addFavoriteRoute = async function(routeId, type) {
  if (!this.preferences.favoriteRoutes.some(fav => fav.routeId === routeId)) {
    this.preferences.favoriteRoutes.push({ routeId, type });
    await this.save();
  }
};

// Method to remove favorite route
userSchema.methods.removeFavoriteRoute = async function(routeId) {
  this.preferences.favoriteRoutes = this.preferences.favoriteRoutes.filter(
    fav => fav.routeId !== routeId
  );
  await this.save();
};

// Method to add travel history
userSchema.methods.addTravelHistory = async function(travelData) {
  this.travelHistory.push(travelData);
  if (this.travelHistory.length > 100) {
    this.travelHistory = this.travelHistory.slice(-100);
  }
  await this.save();
};

// Method to add saved location
userSchema.methods.addSavedLocation = async function(locationData) {
  this.savedLocations.push(locationData);
  await this.save();
};

export default mongoose.model('User', userSchema); 