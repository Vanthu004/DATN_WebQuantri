const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderDetailSchema = new Schema({
  order_id: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  price_each: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('OrderDetail', orderDetailSchema);
