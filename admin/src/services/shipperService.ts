import api from '../configs/api';
import { Shipper, ShipperOrder, ShipperReport, ShipperStatistics, ShipperPerformance } from '../interfaces/shipper';

// Shipper Management
export const shipperService = {
  // Create new shipper
  createShiper: async (shipperData: {
    user: {
      fullName: string;
      phone: string;
      email: string;
      password: string;
    };
    address: string;
    city: string;
    district: string;
    vehicleInfo: {
      type: string;
      brand: string;
      model: string;
      licensePlate: string;
    };
    idCardNumber: string;
    bankAccount: string;
    bankName: string;
  }) => {
    const response = await api.post('/admin/shipers', shipperData);
    return response.data;
  },

  // Get all shippers with filtering and pagination
  getAllShipers: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    verificationStatus?: string;
    workingStatus?: string;
    city?: string;
    district?: string;
  }) => {
    const response = await api.get('/admin/shipers', { params });
    return response.data;
  },

  // Get shipper detail
  getShiperDetail: async (shipperId: string) => {
    const response = await api.get(`/admin/shipers/${shipperId}`);
    return response.data;
  },

  // Update shipper status
  updateShiperStatus: async (shipperId: string, status: string) => {
    const response = await api.put(`/admin/shipers/${shipperId}/status`, { status });
    return response.data;
  },

  // Verify shipper
  verifyShiper: async (shipperId: string, verificationData: {
    verificationStatus: string;
    adminNotes?: string;
  }) => {
    const response = await api.put(`/admin/shipers/${shipperId}/verify`, verificationData);
    return response.data;
  },

  // Get shipper location
  getShiperLocation: async (shipperId: string) => {
    const response = await api.get(`/admin/shipers/${shipperId}/location`);
    return response.data;
  },

  // Get active shippers
  getActiveShipers: async () => {
    const response = await api.get('/admin/shipers/active');
    return response.data;
  },
};

// Order Management
export const shipperOrderService = {
  // Get orders to assign
  getOrdersToAssign: async (params?: {
    page?: number;
    limit?: number;
    city?: string;
    district?: string;
    paymentMethod?: string;
  }) => {
    const response = await api.get('/admin/shipers/orders/to-assign', { params });
    return response.data;
  },

  // Assign order to shipper
  assignOrder: async (orderId: string, shipperId: string) => {
    const response = await api.post('/admin/shipers/orders/assign', {
      orderId,
      shipperId,
    });
    return response.data;
  },

  // Unassign order from shipper
  unassignOrder: async (orderId: string) => {
    const response = await api.delete(`/admin/shipers/orders/${orderId}/assign`);
    return response.data;
  },

  // Get shipper orders
  getShiperOrders: async (shipperId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get(`/admin/shipers/${shipperId}/orders`, { params });
    return response.data;
  },

  // Get order detail
  getOrderDetail: async (orderId: string) => {
    const response = await api.get(`/admin/shipers/orders/${orderId}`);
    return response.data;
  },
};

// Report Management
export const shipperReportService = {
  // Get all shipper reports
  getShiperReports: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    severity?: string;
    shipperId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get('/admin/shipers/reports', { params });
    return response.data;
  },

  // Update report status
  updateReportStatus: async (reportId: string, updateData: {
    status: string;
    adminNotes?: string;
    actionTaken?: string;
  }) => {
    const response = await api.put(`/admin/shipers/reports/${reportId}/status`, updateData);
    return response.data;
  },

  // Get report detail
  getReportDetail: async (reportId: string) => {
    const response = await api.get(`/admin/shipers/reports/${reportId}`);
    return response.data;
  },
};

// Statistics and Analytics
export const shipperStatisticsService = {
  // Get overall shipper statistics
  getShiperStatistics: async (params?: {
    startDate?: string;
    endDate?: string;
    city?: string;
    district?: string;
  }) => {
    const response = await api.get('/admin/shipers/statistics', { params });
    return response.data;
  },

  // Get shipper performance
  getShiperPerformance: async (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get('/admin/shipers/performance', { params });
    return response.data;
  },

  // Get COD payment statistics
  getCodStatistics: async (params?: {
    startDate?: string;
    endDate?: string;
    shipperId?: string;
    status?: string;
  }) => {
    const response = await api.get('/admin/shipers/cod-statistics', { params });
    return response.data;
  },

  // Export reports
  exportReport: async (params: {
    type: 'excel' | 'pdf';
    startDate?: string;
    endDate?: string;
    format: string;
  }) => {
    const response = await api.get('/admin/shipers/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};

// Real-time tracking
export const shipperTrackingService = {
  // Get real-time shipper locations
  getRealTimeLocations: async () => {
    const response = await api.get('/admin/shipers/tracking/locations');
    return response.data;
  },

  // Get shipper activity history
  getShiperActivityHistory: async (shipperId: string, params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => {
    const response = await api.get(`/admin/shipers/${shipperId}/activity-history`, { params });
    return response.data;
  },
};

// Notifications
export const shipperNotificationService = {
  // Send notification to shipper
  sendNotification: async (shipperId: string, notificationData: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'urgent';
    data?: any;
  }) => {
    const response = await api.post(`/admin/shipers/${shipperId}/notifications`, notificationData);
    return response.data;
  },

  // Send bulk notifications
  sendBulkNotifications: async (notificationData: {
    shipperIds: string[];
    title: string;
    message: string;
    type: 'info' | 'warning' | 'urgent';
    data?: any;
  }) => {
    const response = await api.post('/admin/shipers/notifications/bulk', notificationData);
    return response.data;
  },
};
