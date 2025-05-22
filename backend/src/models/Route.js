import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
    routeId: {
        type: String,
        required: true,
        unique: true
    },
    agencyId: {
        type: String,
        required: true
    },
    shortName: {
        type: String,
        required: true
    },
    longName: {
        type: String,
        required: true
    },
    type: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        default: '#000000'
    },
    textColor: {
        type: String,
        default: '#FFFFFF'
    },
    region: {
        type: String,
        required: true,
        enum: ['NCR', 'Luzon', 'Visayas', 'Mindanao']
    },
    city: {
        type: String,
        required: true
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

// Index for geospatial queries
routeSchema.index({ region: 1, city: 1 });

export default mongoose.model('Route', routeSchema); 