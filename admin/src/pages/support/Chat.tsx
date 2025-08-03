import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { GiftedChat, IMessage, Bubble, BubbleProps, InputToolbar, InputToolbarProps } from 'react-gifted-chat';
import '../../css/support/Chat.css';

interface User {
  _id: string;
  name: string;
  avata_url?: string;
}

interface Message {
  _id: string | number;
  text: string;
  image: string | null;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
}

interface MessageResponse {
  message: string;
  messages: Message[];
}

const Chat: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchCurrentUserAndMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Vui lòng đăng nhập lại');
          console.error('No token found in localStorage');
          setLoading(false);
          return;
        }

        // Lấy thông tin admin
        console.log('Fetching current user from /api/users/me');
        const userResponse = await axios.get<User>('http://localhost:3000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Current user:', userResponse.data);
        setCurrentUser(userResponse.data);

        // Lấy tin nhắn với userId
        console.log(`Fetching messages for userId: ${userId}`);
        const messageResponse = await axios.get<MessageResponse>(
          `http://localhost:3000/api/users/messages?receiver_id=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Messages response:', messageResponse.data);

        // Chuyển đổi tin nhắn sang định dạng GiftedChat
        const formattedMessages: IMessage[] = messageResponse.data.messages.map((msg) => ({
          _id: msg._id,
          text: msg.text || '',
          createdAt: new Date(msg.createdAt),
          user: {
            _id: msg.user._id,
            name: msg.user.name,
            avatar: msg.user.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${msg.user._id}`,
          },
          image: msg.image || undefined,
        }));

        console.log('Formatted messages:', formattedMessages);
        setMessages(formattedMessages.reverse()); // Đảo ngược để tin nhắn mới nhất ở dưới
        setLoading(false);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
        console.error('Error fetching data:', error);
        toast.error('Lỗi khi lấy tin nhắn: ' + errorMessage);
        setLoading(false);
      }
    };

    if (userId) {
      fetchCurrentUserAndMessages();
    }
  }, [userId]);

  // Hàm xử lý gửi tin nhắn (tạm thời, sẽ hoàn thiện ở Bước 10)
  const onSend = async (newMessages: IMessage[] = []) => {
    console.log('Sending new messages:', newMessages);
    setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
  };

  // Custom renderBubble để hiển thị tên user
  const renderBubble = (props: BubbleProps<IMessage>) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: { backgroundColor: '#0084ff' },
          left: { backgroundColor: '#fff' },
        }}
        renderMessageText={(textProps) => (
          <div style={{ 
            color: textProps.position === 'right' ? '#fff' : '#333', 
            padding: '8px 12px',
            fontSize: 14,
          }}>
            {textProps.currentMessage?.text}
          </div>
        )}
        renderUsername={() =>
          props.currentMessage ? (
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
              {props.currentMessage.user.name}
            </div>
          ) : null
        }
      />
    );
  };

  // Custom renderInputToolbar để đảm bảo input hiển thị
  const renderInputToolbar = (props: InputToolbarProps) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          borderTopWidth: 1,
          borderTopColor: '#ccc',
          backgroundColor: '#fff',
          padding: 8,
          zIndex: 10,
        }}
      />
    );
  };

  if (loading) {
    return <div className="chat-loading">Đang tải...</div>;
  }

  if (!messages.length) {
    return (
      <div className="chat-container">
        <h1 className="chat-title">Chat với {currentUser ? currentUser.name : 'Người dùng'}</h1>
        <div className="chat-empty">Chưa có tin nhắn nào</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <h1 className="chat-title">Chat với {currentUser ? currentUser.name : 'Người dùng'}</h1>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: currentUser?._id || '',
          name: currentUser?.name || 'Admin',
          avatar: currentUser?.avata_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${currentUser?._id || 'admin'}`,
        }}
        placeholder="Nhập tin nhắn..."
        showUserAvatar={true}
        showAvatarForEveryMessage={false}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        locale="vi"
        timeFormat="HH:mm"
        dateFormat="DD/MM/YYYY"
      />
    </div>
  );
};

export default Chat;