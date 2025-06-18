const Statistic = require("../models/statistic");

/* Tạo báo cáo thống kê mới */
exports.createStatistic = async (req, res) => {
  try {
    const newStat = new Statistic(req.body);
    await newStat.save();
    res.status(201).json(newStat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Lấy toàn bộ thống kê */
exports.getAllStatistics = async (req, res) => {
  try {
    const list = await Statistic.find().populate("product_id", "name");
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy thống kê theo ID */
exports.getStatisticById = async (req, res) => {
  try {
    const stat = await Statistic.findById(req.params.id).populate(
      "product_id",
      "name"
    );
    if (!stat) return res.status(404).json({ msg: "Không tìm thấy báo cáo" });
    res.json(stat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy thống kê của 1 sản phẩm */
exports.getStatisticsByProduct = async (req, res) => {
  try {
    const list = await Statistic.find({ product_id: req.params.productId });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Cập nhật thống kê */
exports.updateStatistic = async (req, res) => {
  try {
    const updated = await Statistic.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: "Không tìm thấy báo cáo" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Xoá thống kê */
exports.deleteStatistic = async (req, res) => {
  try {
    const deleted = await Statistic.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Không tìm thấy báo cáo" });
    res.json({ msg: "Đã xoá báo cáo" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
