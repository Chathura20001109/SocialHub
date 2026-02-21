// server/models/Follow.js
const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Create a unique index for follower-following pairs
followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ following: 1 }); // For getting followers of a user

module.exports = mongoose.model('Follow', followSchema);
