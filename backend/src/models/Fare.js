import mongoose from 'mongoose';

const fareSchema = new mongoose.Schema({
    fareId: {
        type: String,
        required: true,
        unique: true
    },
    routeId: {
        type: String,
        required: true
    },
    fromStopId: {
        type: String,
        required: true
    },
    toStopId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'PHP'
    },
    fareType: {
        type: String,
        required: true,
        enum: ['Regular', 'Student', 'Senior', 'PWD', 'Child']
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Cash', 'Beep', 'QR', 'Credit Card']
    },
    validFrom: {
        type: Date,
        required: true
    },
    validTo: {
        type: Date,
        required: true
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

// Indexes for efficient querying
fareSchema.index({ routeId: 1, fromStopId: 1, toStopId: 1 });
fareSchema.index({ region: 1, city: 1 });
fareSchema.index({ validFrom: 1, validTo: 1 });

export default mongoose.model('Fare', fareSchema); 