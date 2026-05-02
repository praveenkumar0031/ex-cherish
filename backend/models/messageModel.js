const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For individual
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },     // For room chat
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // 86400 seconds = 24 hours
});

// The 'expires' property automatically creates a TTL index in MongoDB.
module.exports = mongoose.model('Message', messageSchema);