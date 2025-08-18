import { useState, useEffect } from 'react';
import { ConversationList, Conversation, Avatar } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabase';
import { blockUser } from '../../services/user';
import { Loader2 } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  avatar_url?: string;
  ban: { isBanned: boolean; reason?: string };
}

interface Message {
  _id: string;
  text: string;
  image?: string | null;
  createdAt: string;
  user: { _id: string; name: string; avatar: string };
}

interface UserWithMessages extends User {
  latestMessage?: Message;
  unreadCount?: number;
}

interface ConversationsResponse {
  message: string;
  data: UserWithMessages[];
}

interface SupabaseTokenResponse {
  user: { id: string; email: string; role: string; name: string; avatar_url?: string };
  supabaseToken: { access_token: string; refresh_token: string };
}

interface ErrorResponse {
  message?: string;
}

const Support = () => {
  const [conversations, setConversations] = useState<UserWithMessages[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Lấy userId và Supabase token
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!token) {
          toast.error('Vui lòng đăng nhập lại');
          console.log('No token found in localStorage');
          navigate('/login');
          return;
        }
        console.log('Fetching supabase-token with URL:', `${import.meta.env.VITE_API_URL}/supabase-token`);
        const response = await axios.get<SupabaseTokenResponse>(
          `${import.meta.env.VITE_API_URL}/supabase-token`,
          {
            headers: { Authorization: `Bearer ${token}` },
            validateStatus: (status) => status >= 200 && status < 500,
          }
        );

        if (typeof response.data !== 'object' || !response.data.user?.id) {
          throw new Error('Invalid response format from supabase-token API');
        }

        console.log('Supabase token response:', response.data);
        setUserId(response.data.user.id);
        // Bỏ setSession để tránh lỗi JWT
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Fetch user error:', axiosError.response?.data || axiosError.message);
        toast.error('Lỗi lấy thông tin người dùng: ' + (axiosError.response?.data?.message || axiosError.message));
        if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchUser();
  }, [token, navigate]);

  // Lấy danh sách cuộc trò chuyện
  const fetchConversations = async () => {
    try {
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        navigate('/login');
        return;
      }
      console.log('Fetching conversations with URL:', `${import.meta.env.VITE_API_URL}/messages/conversations`);
      const response = await axios.get<ConversationsResponse>(
        `${import.meta.env.VITE_API_URL}/messages/conversations`,
        {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: (status) => status >= 200 && status < 500,
        }
      );

      if (typeof response.data !== 'object' || !response.data.data) {
        throw new Error('Invalid response format from conversations API');
      }

      console.log('Conversations response:', response.data);
      setConversations(response.data.data);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error('Fetch conversations error:', axiosError.response?.data || axiosError.message);
      toast.error('Lỗi lấy danh sách cuộc trò chuyện: ' + (axiosError.response?.data?.message || axiosError.message));
      if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    if (token) fetchConversations();
  }, [token]);

  // Supabase Realtime: Cập nhật khi có tin nhắn mới
  useEffect(() => {
    if (!userId || !token) return;

    console.log('Subscribing to Supabase Realtime for userId:', userId);
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          console.log('New message:', payload.new);
          try {
            await fetchConversations();
            setConversations((prev) =>
              prev.map((conv) =>
                conv._id === payload.new.sender_id
                  ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1 }
                  : conv
              )
            );
          } catch (error) {
            console.error('Error updating conversations:', error);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Unsubscribing from Supabase Realtime');
      supabase.removeChannel(channel);
    };
  }, [userId, token]);

  // Chặn người dùng
  const handleBlockUser = async (userId: string) => {
    try {
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        navigate('/login');
        return;
      }
      console.log('Blocking user:', userId);
      await blockUser(userId, { isBanned: true, reason: 'Vi phạm quy định', bannedUntil: null }, token);
      toast.success('Chặn người dùng thành công');
      await fetchConversations();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error('Block user error:', axiosError.response?.data || axiosError.message);
      toast.error('Lỗi chặn người dùng: ' + (axiosError.response?.data?.message || axiosError.message));
    }
  };

  return (
    <div className="h-[600px] p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Hỗ trợ người dùng</h1>
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : conversations.length === 0 ? (
        <p className="text-gray-500 text-center">Không có cuộc trò chuyện nào.</p>
      ) : (
        <ConversationList>
          {conversations.map((conv) => (
            <Conversation
              key={conv._id}
              name={conv.name}
              lastSenderName={conv.latestMessage?.user.name}
              info={
                conv.ban.isBanned
                  ? `Bị khóa: ${conv.ban.reason || 'Không rõ lý do'}`
                  : conv.latestMessage
                  ? conv.latestMessage.text || 'Đã gửi một ảnh'
                  : 'Chưa có tin nhắn'
              }
              lastActivityTime={
                conv.latestMessage ? new Date(conv.latestMessage.createdAt).toLocaleTimeString('vi-VN') : ''
              }
              onClick={() => navigate(`/chat/${conv._id}`)}
              unreadCnt={conv.unreadCount || 0}
            >
              <Avatar src={conv.avatar_url || 'https://api.dicebear.com/9.x/avataaars/svg'} name={conv.name} />
              {!conv.ban.isBanned && (
                <Conversation.Operations>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBlockUser(conv._id);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Chặn
                  </button>
                </Conversation.Operations>
              )}
            </Conversation>
          ))}
        </ConversationList>
      )}
    </div>
  );
};

export default Support;