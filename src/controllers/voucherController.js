const Voucher = require('../models/Voucher');

exports.createVoucher = async (req, res) => {
  try {
    const voucher = new Voucher(req.body); // Không truyền voucher_id từ client
    const saved = await voucher.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find().populate('User_id');
    res.status(200).json(vouchers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id).populate('User_id');
    if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
    res.status(200).json(voucher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateVoucher = async (req, res) => {
  try {
    const updated = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Voucher not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteVoucher = async (req, res) => {
  try {
    const deleted = await Voucher.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Voucher not found' });
    res.status(200).json({ message: 'Voucher deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
