const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true
    },
    role: {
        type: String,
        enum: ['Client', 'Manager'],
        default: 'Client'
    },
    password: { // Will be used if we decide to add password later, but requirement says OTP mainly. 
        // Wait, requirement said "mot de passe" AND "OTP". So both.
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
