const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order_date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'pending'
  },
  total_price: {
    type: Number,
    required: true
  },
  shipping_method: String,
  payment_method: String,
  is_paid: {
    type: Boolean,
    default: false
  },
  shipping_address: String,
  payment_date: Date
});

module.exports = mongoose.model('Order', orderSchema);
