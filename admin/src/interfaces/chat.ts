// admin/src/interfaces/chat.ts
export interface ChatRoom {
  _id: string;
  roomId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone_number?: string;
    avatar_url?: string;
  };
  assignedStaff?: {
    _id: string;
    name: string;
    avatar_url?: string;
    role: string;
  } | null;
  subject: string;
  category: 'product_inquiry' | 'order_support' | 'complaint' | 'general';
  status: 'open' | 'assigned' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  lastMessageAt: string;
  metadata: {
    orderId?: string;
    productId?: string;
    tags?: string[];
    customerInfo?: {
      phone?: string;
      email?: string;
    };
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  sender_role: 'user' | 'admin' | 'staff';
  sender_name: string;
  sender_avatar?: string;
  content: string;
  type: 'text' | 'image';
  metadata?: Record<string, unknown>;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    name: string;
    avatar_url?: string;
    role: string;
  };
}

export interface ChatStatistics {
  rooms: {
    status: {
      open: number;
      assigned: number;
      resolved: number;
      closed: number;
    };
    category: {
      product_inquiry: number;
      order_support: number;
      complaint: number;
      general: number;
    };
    daily: {
      _id: string;
      count: number;
    }[];
    total: number;
  };
  messages: {
    total: number;
    period: string;
  };
  staff: {
    id: string;
    name: string;
    avatar_url?: string;
    roomCount: number;
    resolvedCount: number;
    resolutionRate: string;
  }[];
}

export interface CreateChatRoomData {
  subject: string;
  category?: 'product_inquiry' | 'order_support' | 'complaint' | 'general';
  metadata?: {
    orderId?: string;
    productId?: string;
    customerInfo?: {
      phone?: string;
      email?: string;
    };
  };
}

export interface SendMessageData {
  roomId: string;
  content: string;
  type?: 'text' | 'image';
  metadata?: Record<string, unknown>;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  total: number;
  hasMore: boolean;
}