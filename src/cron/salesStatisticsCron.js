const cron = require('node-cron');
const salesStatisticsController = require('../controllers/salesStatisticsController');

// Cron job để tạo thống kê hàng ngày (chạy lúc 00:01 mỗi ngày)
const dailyStatsJob = cron.schedule('1 0 * * *', async () => {
  console.log('Running daily statistics generation...');
  try {
    // Tạo thống kê cho ngày hôm qua
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(yesterday);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Gọi API để tạo thống kê
    const response = await fetch(`${process.env.BASE_URL}/api/sales-statistics/generate-daily`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('Daily statistics generated successfully');
    } else {
      console.error('Failed to generate daily statistics');
    }
  } catch (error) {
    console.error('Error in daily statistics cron job:', error);
  }
});

// Cron job để reset thống kê hàng ngày (chạy lúc 00:00 mỗi ngày)
const resetDailyStatsJob = cron.schedule('0 0 * * *', async () => {
  console.log('Resetting daily stats...');
  try {
    await salesStatisticsController.resetDailyStats();
  } catch (error) {
    console.error('Error resetting daily stats:', error);
  }
});

// Cron job để reset thống kê hàng tuần (chạy lúc 00:00 mỗi Chủ nhật)
const resetWeeklyStatsJob = cron.schedule('0 0 * * 0', async () => {
  console.log('Resetting weekly stats...');
  try {
    await salesStatisticsController.resetWeeklyStats();
  } catch (error) {
    console.error('Error resetting weekly stats:', error);
  }
});

// Cron job để reset thống kê hàng tháng (chạy lúc 00:00 ngày đầu tháng)
const resetMonthlyStatsJob = cron.schedule('0 0 1 * *', async () => {
  console.log('Resetting monthly stats...');
  try {
    await salesStatisticsController.resetMonthlyStats();
  } catch (error) {
    console.error('Error resetting monthly stats:', error);
  }
});

// Hàm khởi động tất cả cron jobs
const startCronJobs = () => {
  dailyStatsJob.start();
  resetDailyStatsJob.start();
  resetWeeklyStatsJob.start();
  resetMonthlyStatsJob.start();
  
  console.log('Sales statistics cron jobs started');
};

// Hàm dừng tất cả cron jobs
const stopCronJobs = () => {
  dailyStatsJob.stop();
  resetDailyStatsJob.stop();
  resetWeeklyStatsJob.stop();
  resetMonthlyStatsJob.stop();
  
  console.log('Sales statistics cron jobs stopped');
};

module.exports = {
  startCronJobs,
  stopCronJobs,
  dailyStatsJob,
  resetDailyStatsJob,
  resetWeeklyStatsJob,
  resetMonthlyStatsJob
}; 