import mongoose from 'mongoose';

const stopSchema = new mongoose.Schema({
    stopId: {
        type: String,
        required: true,
        unique: true
    },
    code: String,
    name: {
        type: String,
        required: true
    },
    description: String,
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    type: {
        type: Number,
        required: true
    },
    parentStation: String,
    wheelchairBoarding: {
        type: Number,
        default: 0
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

// Create geospatial index
stopSchema.index({ location: '2dsphere' });
stopSchema.index({ region: 1, city: 1 });

export default mongoose.model('Stop', stopSchema); 