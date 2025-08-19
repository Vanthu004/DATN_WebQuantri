// admin/src/services/chatApi.ts

import { 
  ChatRoom, 
  Message, 
  ChatStatistics, 
  CreateChatRoomData, 
  SendMessageData,
  PaginationInfo 
} from '../interfaces/chat';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export interface ChatRoomsResponse {
  chatRooms: ChatRoom[];
  pagination: PaginationInfo;
  statistics?: ChatStatistics['rooms'];
}

export interface MessagesResponse {
  messages: Message[];
  pagination: PaginationInfo;
}

export const chatApi = {
  // Chat Rooms
  async createChatRoom(data: CreateChatRoomData): Promise<{ chatRoom: ChatRoom }> {
    const response = await fetch(`${API_URL}/api/chat/rooms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể tạo phòng chat');
    }
    
    return response.json();
  },

  async getMyChatRooms(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ChatRoomsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const response = await fetch(`${API_URL}/api/chat/rooms/my-rooms?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Không thể tải danh sách phòng chat');
    }
    
    return response.json();
  },

  async getAssignedChatRooms(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ChatRoomsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const response = await fetch(`${API_URL}/api/chat/rooms/assigned?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Không thể tải danh sách phòng được gán');
    }
    
    return response.json();
  },

  async getAllChatRooms(params?: {
    status?: string;
    category?: string;
    priority?: string;
    assigned?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ChatRoomsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.priority) searchParams.append('priority', params.priority);
    if (params?.assigned !== undefined) searchParams.append('assigned', params.assigned.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const response = await fetch(`${API_URL}/api/chat/rooms/all?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Không thể tải danh sách tất cả phòng chat');
    }
    
    return response.json();
  },

  async getChatRoomById(roomId: string): Promise<ChatRoom> {
  const response = await fetch(`${API_URL}/api/chat/rooms/${roomId}`, {
    headers: getAuthHeaders(),
  });
  
  console.log('🔍 getChatRoomById response:', response.status, await response.clone().json());
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Không thể tải thông tin phòng chat');
  }
  
  return response.json();
},

  async assignStaffToRoom(roomId: string, staffId: string): Promise<{ chatRoom: ChatRoom }> {
    const response = await fetch(`${API_URL}/api/chat/rooms/${roomId}/assign`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ staffId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể gán staff cho phòng chat');
    }
    
    return response.json();
  },

  async updateRoomStatus(roomId: string, status: ChatRoom['status']): Promise<{ chatRoom: ChatRoom }> {
    const response = await fetch(`${API_URL}/api/chat/rooms/${roomId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể cập nhật trạng thái phòng chat');
    }
    
    return response.json();
  },

  // Messages
  async sendMessage(data: SendMessageData): Promise<{ data: Message }> {
    const response = await fetch(`${API_URL}/api/chat/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể gửi tin nhắn');
    }
    
    return response.json();
  },

  async getMessages(roomId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<MessagesResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const response = await fetch(`${API_URL}/api/chat/rooms/${roomId}/messages?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể tải tin nhắn');
    }
    
    return response.json();
  },

  // Statistics
  async getChatStatistics(period: '7d' | '30d' = '7d'): Promise<ChatStatistics> {
    const response = await fetch(`${API_URL}/api/chat/statistics?period=${period}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Không thể tải thống kê chat');
    }
    
    return response.json();
  },

  // Staff list for assignment (reuse existing user API)
  async getStaffList(): Promise<{ _id: string; name: string; avatar_url?: string; role: string }[]> {
    const response = await fetch(`${API_URL}/api/users?role=staff&role=admin`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Không thể tải danh sách staff');
    }
    
    const data = await response.json();
    return data.users || data; // Adjust based on your API response structure
  },
};