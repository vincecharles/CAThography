import mongoose from 'mongoose';

const informalRouteSchema = new mongoose.Schema({
  routeId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['JEEPNEY', 'TRICYCLE', 'UV_EXPRESS'],
    required: true
  },
  routeNumber: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  operator: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  barangay: {
    type: String,
    required: true
  },
  stops: [{
    stopId: String,
    name: String,
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
    landmark: String,
    isTerminal: {
      type: Boolean,
      default: false
    }
  }],
  schedule: {
    startTime: String,
    endTime: String,
    frequency: Number, // minutes between trips
    peakHours: [{
      start: String,
      end: String,
      frequency: Number
    }]
  },
  fare: {
    base: Number,
    perKm: Number,
    minimum: Number,
    peakMultiplier: {
      type: Number,
      default: 1.2
    },
    discounts: {
      student: {
        type: Number,
        default: 0.2
      },
      senior: {
        type: Number,
        default: 0.2
      },
      pwd: {
        type: Number,
        default: 0.2
      }
    }
  },
  vehicle: {
    type: {
      type: String,
      enum: ['JEEPNEY', 'TRICYCLE', 'VAN'],
      required: true
    },
    capacity: Number,
    features: [{
      type: String,
      enum: ['AIRCON', 'WIFI', 'USB_PORTS', 'WHEELCHAIR_ACCESSIBLE']
    }]
  },
  active: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

informalRouteSchema.index({ location: '2dsphere' });
informalRouteSchema.index({ region: 1, city: 1, barangay: 1 });
informalRouteSchema.index({ type: 1, routeNumber: 1 });

export default mongoose.model('InformalRoute', informalRouteSchema); 