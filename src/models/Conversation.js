// models/conversation.js (updated)
const mongoose = require('mongoose');
const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  lastMessage: { type: String, trim: true },
  lastMessageAt: { type: Date },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
}, { timestamps: true });
module.exports = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);