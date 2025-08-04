import { useState, useEffect } from 'react';
import { ConversationList, Conversation, Avatar } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabase';
import { blockUser } from '../../services/user';

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
          return;
        }
        console.log('Fetching supabase-token with URL:', `${import.meta.env.VITE_API_URL}/supabase-token`);
        const response = await axios.get<SupabaseTokenResponse>(
          `${import.meta.env.VITE_API_URL}/supabase-token`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log('Supabase token response:', response.data);
        setUserId(response.data.user.id);
        const { error } = await supabase.auth.setSession({
          access_token: response.data.supabaseToken.access_token,
          refresh_token: response.data.supabaseToken.refresh_token,
        });
        if (error) {
          throw new Error(`Supabase setSession error: ${error.message}`);
        }
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Fetch user error:', axiosError.response?.data || axiosError.message);
        toast.error('Lỗi lấy thông tin người dùng: ' + (axiosError.response?.data?.message || axiosError.message));
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchUser();
  }, [token]);

  // Lấy danh sách cuộc trò chuyện
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        if (!token) {
          toast.error('Vui lòng đăng nhập lại');
          return;
        }
        console.log('Fetching conversations with URL:', `${import.meta.env.VITE_API_URL}/api/users/messages/conversations`);
        const response = await axios.get<ConversationsResponse>(
          `${import.meta.env.VITE_API_URL}/api/users/messages/conversations`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log('Conversations response:', response.data);
        setConversations(response.data.data);
        setLoading(false);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Fetch conversations error:', axiosError.response?.data || axiosError.message);
        toast.error('Lỗi lấy danh sách cuộc trò chuyện: ' + (axiosError.response?.data?.message || axiosError.message));
        setLoading(false);
      }
    };
    fetchConversations();
  }, [token]);

  // Supabase Realtime: Cập nhật khi có tin nhắn mới
  useEffect(() => {
    if (!userId) return;
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
        async () => {
          try {
            if (!token) {
              toast.error('Vui lòng đăng nhập lại');
              return;
            }
            console.log('New message detected, fetching conversations');
            const response = await axios.get<ConversationsResponse>(
              `${import.meta.env.VITE_API_URL}/api/users/messages/conversations`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            console.log('Updated conversations:', response.data);
            setConversations(response.data.data);
          } catch (error: unknown) {
            const axiosError = error as AxiosError<ErrorResponse>;
            console.error(
              'Error updating conversations:',
              axiosError.response?.data?.message || axiosError.message
            );
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
        return;
      }
      console.log('Blocking user:', userId);
      await blockUser(userId, { isBanned: true, reason: 'Vi phạm quy định', bannedUntil: null }, token);
      toast.success('Chặn người dùng thành công');
      const response = await axios.get<ConversationsResponse>(
        `${import.meta.env.VITE_API_URL}/api/users/messages/conversations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Updated conversations after block:', response.data);
      setConversations(response.data.data);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error('Block user error:', axiosError.response?.data || axiosError.message);
      toast.error('Lỗi chặn người dùng: ' + (axiosError.response?.data?.message || axiosError.message));
    }
  };

  return (
    <div style={{ height: '600px' }}>
      <h1 style={{ padding: '10px', fontSize: '24px' }}>Hỗ trợ người dùng</h1>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <ConversationList>
          {conversations.length === 0 ? (
            <p>Không có cuộc trò chuyện nào.</p>
          ) : (
            conversations.map((conv) => (
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
              >
                <Avatar src={conv.avatar_url || 'https://api.dicebear.com/9.x/avataaars/svg'} name={conv.name} />
                {!conv.ban.isBanned && (
                  <div style={{ marginLeft: '10px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBlockUser(conv._id);
                      }}
                      style={{ color: 'red' }}
                    >
                      Chặn
                    </button>
                  </div>
                )}
              </Conversation>
            ))
          )}
        </ConversationList>
      )}
    </div>
  );
};

export default Support;