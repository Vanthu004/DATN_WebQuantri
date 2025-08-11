const salesStatisticsController = require('../controllers/salesStatisticsController');

// Middleware để cập nhật thống kê sản phẩm khi đơn hàng được tạo
const updateProductStatsOnOrderCreate = async (req, res, next) => {
  try {
    // Lưu response gốc
    const originalJson = res.json;
    
    // Override res.json để bắt response
    res.json = function(data) {
      // Nếu đơn hàng được tạo thành công
      if (data.success && data.data && data.data._id) {
        // Cập nhật thống kê sản phẩm bất đồng bộ
        salesStatisticsController.updateProductStatistics(data.data._id)
          .catch(error => {
            console.error('Error updating product statistics:', error);
          });
      }
      
      // Gọi hàm json gốc
      return originalJson.call(this, data);
    };
    
    next();
  } catch (error) {
    console.error('Error in updateProductStatsOnOrderCreate middleware:', error);
    next();
  }
};

// Middleware để cập nhật thống kê khi đơn hàng được cập nhật
const updateProductStatsOnOrderUpdate = async (req, res, next) => {
  try {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Nếu đơn hàng được cập nhật thành công
      if (data.success && data.data && data.data._id) {
        // Cập nhật thống kê sản phẩm bất đồng bộ
        salesStatisticsController.updateProductStatistics(data.data._id)
          .catch(error => {
            console.error('Error updating product statistics:', error);
          });
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  } catch (error) {
    console.error('Error in updateProductStatsOnOrderUpdate middleware:', error);
    next();
  }
};

// Middleware để cập nhật thống kê khi OrderDetail được tạo
const updateProductStatsOnOrderDetailCreate = async (req, res, next) => {
  try {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Nếu OrderDetail được tạo thành công
      if (data.success && data.data && data.data.order_id) {
        // Cập nhật thống kê sản phẩm bất đồng bộ
        salesStatisticsController.updateProductStatistics(data.data.order_id)
          .catch(error => {
            console.error('Error updating product statistics:', error);
          });
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  } catch (error) {
    console.error('Error in updateProductStatsOnOrderDetailCreate middleware:', error);
    next();
  }
};

module.exports = {
  updateProductStatsOnOrderCreate,
  updateProductStatsOnOrderUpdate,
  updateProductStatsOnOrderDetailCreate
}; 