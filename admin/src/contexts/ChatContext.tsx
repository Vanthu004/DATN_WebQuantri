import React, { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react';
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
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const connectSocket = () => {
    if (state.socket?.connected) {
      console.log('🔍 Socket already connected, skipping');
      return;
    }

    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      console.error('🔍 No token found, cannot connect socket');
      toast.error('Vui lòng đăng nhập để kết nối chat');
      return;
    }

    let decodedToken = null;
    try {
      decodedToken = JSON.parse(atob(currentToken.split('.')[1]));
      console.log('🔍 Connecting to namespace /chat with token:', decodedToken);
    } catch (error) {
      console.error('🔍 Token decode error:', error);
      toast.error('Token không hợp lệ, vui lòng đăng nhập lại');
      return;
    }

    const newSocket = io(`${import.meta.env.VITE_API_URL}/chat`, {
      auth: (cb) => {
        const latestToken = localStorage.getItem('token');
        let authTokenPayload = null;
        try {
          authTokenPayload = latestToken ? JSON.parse(atob(latestToken.split('.')[1])) : null;
          console.log('🔍 Socket auth token:', authTokenPayload);
        } catch (error) {
          console.error('🔍 Socket auth token decode error:', error);
        }
        cb({ token: latestToken });
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to chat server (/chat)');
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
      newSocket.emit('join_user_rooms');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from chat server (/chat)');
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      toast.error(`Không thể kết nối đến server chat: ${error.message}`);
    });

    newSocket.on('rooms_joined', (data) => {
      console.log('📱 Joined rooms:', data);
    });

    newSocket.on('room_joined', (data) => {
      console.log('🚪 Joined room:', data);
    });

    newSocket.on('new_message', (message: Message) => {
      console.log('🔍 Received new_message:', message);
      dispatch({ type: 'ADD_MESSAGE', payload: message });
      const token = localStorage.getItem('token');
      let currentUserId = null;
      try {
        currentUserId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;
      } catch (error) {
        console.error('🔍 Token decode error in new_message:', error);
      }
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
      console.log('🔍 Emitting join_room:', { roomId });
      state.socket.emit('join_room', { roomId });
    } else {
      console.log('🔍 Cannot join room, socket not connected:', { roomId });
      connectSocket();
      setTimeout(() => {
        if (state.socket?.connected) {
          console.log('🔍 Retry join_room:', { roomId });
          state.socket.emit('join_room', { roomId });
        }
      }, 1000);
    }
  };

  const leaveRoom = (roomId: string) => {
    if (state.socket?.connected) {
      console.log('🔍 Emitting leave_room:', { roomId });
      state.socket.emit('leave_room', { roomId });
    }
  };

  const sendMessage = (roomId: string, content: string, type: 'text' | 'image' = 'text') => {
    if (state.socket?.connected) {
      const token = localStorage.getItem('token');
      let userInfo = null;
      try {
        userInfo = token ? JSON.parse(atob(token.split('.')[1])) : null;
      } catch (error) {
        console.error('🔍 Token decode error in sendMessage:', error);
      }
      console.log('🔍 Emitting send_message:', { roomId, content, type, user: userInfo });
      state.socket.emit('send_message', { roomId, content, type });
    } else {
      console.log('🔍 Cannot send message, socket not connected:', { roomId });
    }
  };

  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    const checkToken = () => {
      const currentToken = localStorage.getItem('token');
      if (currentToken !== token) {
        console.log('🔍 Token changed in same tab, reconnecting socket');
        setToken(currentToken);
        disconnectSocket();
        connectSocket();
      }
    };

    const interval = setInterval(checkToken, 1000); // Kiểm tra token mỗi 1s
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    const handleStorageChange = () => {
      console.log('🔍 Token changed in another tab, reconnecting socket');
      setToken(localStorage.getItem('token'));
      disconnectSocket();
      connectSocket();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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