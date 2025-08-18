export interface Shipper {
  _id: string;
  userId: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  vehicleInfo: {
    type: 'motorcycle' | 'car' | 'bicycle' | 'truck';
    brand: string;
    model: string;
    licensePlate?: string;
  };
  documents: {
    idCard: string;
    driverLicense: string;
    vehicleRegistration?: string;
    insurance?: string;
  };
  status: 'active' | 'inactive' | 'suspended';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  workingStatus: 'online' | 'offline' | 'busy';
  currentLocation: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
  };
  workingArea: {
    type: 'Polygon';
    coordinates: number[][][];
    city: string;
    district: string;
  };
  workingHours: {
    start: string; // HH:mm format
    end: string; // HH:mm format
    days: number[]; // 0-6 (Sunday-Saturday)
  };
  rating: number;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageDeliveryTime: number; // in minutes
  totalEarnings: number;
  idCardNumber?: string;
  bankAccount?: string;
  bankName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShipperOrder {
  _id: string;
  orderId: string;
  shipperId: string;
  order: {
    _id: string;
    orderNumber: string;
    customer: {
      fullName: string;
      phone: string;
      email: string;
    };
    deliveryAddress: {
      address: string;
      city: string;
      district: string;
      coordinates: [number, number];
    };
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    items: Array<{
      product: {
        name: string;
        image: string;
      };
      quantity: number;
      price: number;
    }>;
  };
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  pickupTime?: string;
  deliveryTime?: string;
  pickupLocation: {
    coordinates: [number, number];
    address: string;
  };
  deliveryLocation: {
    coordinates: [number, number];
    address: string;
  };
  codAmount: number;
  actualCodAmount?: number;
  paymentStatus: 'pending' | 'collected' | 'submitted' | 'discrepancy';
  deliveryProof?: {
    photos: string[];
    signature?: string;
    notes?: string;
  };
  failureReason?: string;
  trackingHistory: Array<{
    status: string;
    timestamp: string;
    location?: {
      coordinates: [number, number];
      address: string;
    };
    notes?: string;
  }>;
  assignedAt: string;
  updatedAt: string;
}

export interface ShipperReport {
  _id: string;
  shipperId: string;
  shipper: {
    fullName: string;
    phone: string;
  };
  type: 'incident' | 'address_issue' | 'damaged_goods' | 'customer_issue' | 'other';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  location?: {
    coordinates: [number, number];
    address: string;
  };
  photos?: string[];
  orderId?: string;
  resolution?: {
    adminNotes: string;
    actionTaken: string;
    resolvedAt: string;
    resolvedBy: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ShipperStatistics {
  totalShipers: number;
  activeShipers: number;
  totalOrders: number;
  completedOrders: number;
  failedOrders: number;
  totalCodAmount: number;
  collectedCodAmount: number;
  submittedCodAmount: number;
  outstandingCodAmount: number;
  averageDeliveryTime: number;
  successRate: number;
}

export interface ShipperPerformance {
  shipperId: string;
  shipperName: string;
  totalOrders: number;
  completedOrders: number;
  failedOrders: number;
  successRate: number;
  averageDeliveryTime: number;
  totalEarnings: number;
  totalCodCollected: number;
  totalCodSubmitted: number;
  outstandingCod: number;
  rating: number;
  lastActive: string;
}
