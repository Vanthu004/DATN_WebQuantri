const Notification = require('../models/Notification');

exports.createNotification = async (req, res) => {
  try {
    const notification = new Notification(req.body); // Không truyền notication_id
    const saved = await notification.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('user_id')
      .populate('order_id');
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('user_id')
      .populate('order_id');
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateNotification = async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Notification not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const deleted = await Notification.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Notification not found' });
    res.status(200).json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
