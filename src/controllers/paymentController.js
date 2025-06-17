const Payment = require("../models/payment");

exports.createPayment = async (req, res) => {
  try {
    const { payment_id, order_id, payment_method, amount_paid, note } = req.body;
    const payment = new Payment({ payment_id, order_id, payment_method, amount_paid, note });
    const savedPayment = await payment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({ payment_id: req.params.payment_id });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { payment_method, transaction_code, payment_status, amount_paid, note } = req.body;
    const payment = await Payment.findOneAndUpdate(
      { payment_id: req.params.payment_id },
      { payment_method, transaction_code, payment_status, amount_paid, note, payment_date: Date.now() },
      { new: true, runValidators: true }
    );
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findOneAndDelete({ payment_id: req.params.payment_id });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};