// admin/src/contexts/ChatContext.tsx

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatRoom, Message } from '../interfaces/chat';
import { toast } from 'react-toastify';

interface ChatState {
  socket: Socket | null;
  isConnected: boolean;
  currentRoom: ChatRoom | null;
  messages: Message[];
  rooms: ChatRoom[];
  unreadCount: number;
  onlineUsers: string[];
}

type ChatAction =
  | { type: 'SET_SOCKET'; payload: Socket }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'SET_CURRENT_ROOM'; payload: ChatRoom | null }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_ROOMS'; payload: ChatRoom[] }
  | { type: 'UPDATE_ROOM'; payload: { roomId: string; updates: Partial<ChatRoom> } }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'SET_ONLINE_USERS'; payload: string[] }
  | { type: 'DISCONNECT_SOCKET' };

const initialState: ChatState = {
  socket: null,
  isConnected: false,
  currentRoom: null,
  messages: [],
  rooms: [],
  unreadCount: 0,
  onlineUsers: [],
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_SOCKET':
      return { ...state, socket: action.payload };
    
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };
    
    case 'SET_CURRENT_ROOM':
      return { ...state, currentRoom: action.payload };
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    
    case 'ADD_MESSAGE': {
      // Avoid duplicates
      const messageExists = state.messages.find(m => m.id === action.payload.id);
      if (messageExists) return state;
      
      return { 
        ...state, 
        messages: [...state.messages, action.payload].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      };
    }
    case 'SET_ROOMS':
      return { ...state, rooms: action.payload };
    
    case 'UPDATE_ROOM':
      return {
        ...state,
        rooms: state.rooms.map(room => 
          room.roomId === action.payload.roomId 
            ? { ...room, ...action.payload.updates }
            : room
        ),
        currentRoom: state.currentRoom?.roomId === action.payload.roomId
          ? { ...state.currentRoom, ...action.payload.updates }
          : state.currentRoom
      };
    
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };
    
    case 'SET_ONLINE_USERS':
      return { ...state, onlineUsers: action.payload };
    
    case 'DISCONNECT_SOCKET':
      if (state.socket) {
        state.socket.disconnect();
      }
      return { ...state, socket: null, isConnected: false };
    
    default:
      return state;
  }
};

interface ChatContextType extends ChatState {
  dispatch: React.Dispatch<ChatAction>;
  connectSocket: () => void;
  disconnectSocket: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string, type?: 'text' | 'image') => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const connectSocket = () => {
    const token = localStorage.getItem('token');
    if (!token || state.socket?.connected) return;

    const newSocket = io(`${import.meta.env.VITE_API_URL}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to chat server');
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
      
      // Auto join user rooms
      newSocket.emit('join_user_rooms');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from chat server');
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      toast.error('Không thể kết nối đến server chat');
    });

    // Chat events
    newSocket.on('rooms_joined', (data) => {
      console.log('📱 Joined rooms:', data);
    });

    newSocket.on('room_joined', (data) => {
      console.log('🚪 Joined room:', data);
    });

    newSocket.on('new_message', (message: Message) => {
      dispatch({ type: 'ADD_MESSAGE', payload: message });
      
      // Show notification if message is not from current user
      const currentUserId = JSON.parse(atob(token.split('.')[1])).userId;
      if (message.sender_id !== currentUserId) {
        toast.info(`Tin nhắn mới từ ${message.sender_name}`);
      }
    });

    newSocket.on('room_updated', (data) => {
      dispatch({ 
        type: 'UPDATE_ROOM', 
        payload: { 
          roomId: data.roomId, 
          updates: { lastMessageAt: data.lastMessageAt } 
        } 
      });
    });

    newSocket.on('room_assigned', (data) => {
      dispatch({ 
        type: 'UPDATE_ROOM', 
        payload: { 
          roomId: data.roomId, 
          updates: { assignedStaff: data.assignedStaff, status: 'assigned' } 
        } 
      });
      toast.info(data.message);
    });

    newSocket.on('room_status_updated', (data) => {
      dispatch({ 
        type: 'UPDATE_ROOM', 
        payload: { 
          roomId: data.roomId, 
          updates: { status: data.status } 
        } 
      });
    });

    newSocket.on('user_joined', (data) => {
      console.log('👤 User joined:', data);
    });

    newSocket.on('user_left', (data) => {
      console.log('👋 User left:', data);
    });

    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      toast.error(error.message || 'Lỗi kết nối');
    });

    dispatch({ type: 'SET_SOCKET', payload: newSocket });
  };

  const disconnectSocket = () => {
    dispatch({ type: 'DISCONNECT_SOCKET' });
  };

  const joinRoom = (roomId: string) => {
    if (state.socket?.connected) {
      state.socket.emit('join_room', { roomId });
    }
  };

  const leaveRoom = (roomId: string) => {
    if (state.socket?.connected) {
      state.socket.emit('leave_room', { roomId });
    }
  };

  const sendMessage = (roomId: string, content: string, type: 'text' | 'image' = 'text') => {
    if (state.socket?.connected) {
      state.socket.emit('send_message', { roomId, content, type });
    }
  };

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connectSocket();
    
    return () => {
      disconnectSocket();
    };
  }, []);

  const contextValue: ChatContextType = {
    ...state,
    dispatch,
    connectSocket,
    disconnectSocket,
    joinRoom,
    leaveRoom,
    sendMessage,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};