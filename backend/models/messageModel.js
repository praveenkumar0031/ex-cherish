import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', index: true },
  text: { type: String, required: true },
}, { timestamps: true });

// Compound index for faster chat history retrieval
messageSchema.index({ createdAt: 1 });

export default mongoose.model('Message', messageSchema);
