import { useState, useEffect, useRef } from "react";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  Avatar,
  InputToolbox,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/supabase";
import { Loader2, Image as ImageIcon } from "lucide-react";

interface Message {
  _id: string;
  text: string;
  image?: string | null;
  createdAt: string;
  user: { _id: string; name: string; avatar: string };
}

interface MessagesResponse {
  message: string;
  messages: Message[];
}

interface SendMessageResponse {
  message: string;
  data: Message;
}

interface SupabaseTokenResponse {
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
    avatar_url?: string;
  };
  supabaseToken: { access_token: string; refresh_token: string };
}

interface ErrorResponse {
  message?: string;
}

const Chat = () => {
  const { userId } = useParams<{ userId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string>("Admin");
  const [adminAvatar, setAdminAvatar] = useState<string>("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const elements = document.querySelectorAll(".cs-message__content");
    elements.forEach((el) => {
      console.log("Message height:", el.clientHeight);
    });
  }, [messages]);

  // Lấy adminId từ API supabase-token
  useEffect(() => {
    const fetchAdminId = async () => {
      try {
        if (!token) {
          toast.error("Vui lòng đăng nhập lại");
          navigate("/login");
          return;
        }
        console.log(
          "Fetching supabase-token with URL:",
          `${import.meta.env.VITE_API_URL}/supabase-token`
        );
        const response = await axios.get<SupabaseTokenResponse>(
          `${import.meta.env.VITE_API_URL}/supabase-token`,
          {
            headers: { Authorization: `Bearer ${token}` },
            validateStatus: (status) => status >= 200 && status < 500,
          }
        );

        if (typeof response.data !== "object" || !response.data.user?.id) {
          throw new Error("Invalid response format from supabase-token API");
        }

        console.log("Supabase token response:", response.data);
        setAdminId(response.data.user.id);
        setAdminName(response.data.user.name || "Admin");
        setAdminAvatar(
          response.data.user.avatar_url ||
            "https://api.dicebear.com/9.x/avataaars/svg"
        );
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error(
          "Fetch adminId error:",
          axiosError.response?.data || axiosError.message
        );
        toast.error(
          "Lỗi lấy thông tin người dùng: " +
            (axiosError.response?.data?.message || axiosError.message)
        );
        if (
          axiosError.response?.status === 401 ||
          axiosError.response?.status === 403
        ) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };
    if (token) fetchAdminId();
  }, [token, navigate]);

  // Lấy lịch sử tin nhắn
  const fetchMessages = async () => {
    try {
      if (!token || !userId) {
        toast.error("Vui lòng đăng nhập lại");
        navigate("/login");
        return;
      }
      console.log("Fetching messages for userId:", userId);
      const response = await axios.get<MessagesResponse>(
        `${import.meta.env.VITE_API_URL}/messages?receiver_id=${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: (status) => status >= 200 && status < 500,
        }
      );

      if (typeof response.data !== "object" || !response.data.messages) {
        throw new Error("Invalid response format from messages API");
      }

      console.log("Messages response:", response.data);
      setMessages(response.data.messages);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(
        "Fetch messages error:",
        axiosError.response?.data || axiosError.message
      );
      toast.error(
        "Lỗi lấy tin nhắn: " +
          (axiosError.response?.data?.message || axiosError.message)
      );
      if (
        axiosError.response?.status === 401 ||
        axiosError.response?.status === 403
      ) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && userId) fetchMessages();
  }, [userId, token]);

  // Supabase Realtime: Cập nhật tin nhắn mới
  useEffect(() => {
    if (!userId || !token || !adminId) return;

    console.log(
      "Subscribing to Supabase Realtime for messages with userId:",
      userId,
      "adminId:",
      adminId
    );
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `(sender_id=eq.${userId} AND receiver_id=eq.${adminId}) OR (sender_id=eq.${adminId} AND receiver_id=eq.${userId})`,
        },
        async (payload) => {
          console.log("New message:", payload.new);
          const newMsg: Message = {
            _id: payload.new.id,
            text: payload.new.content || "",
            image: payload.new.image_url || null,
            createdAt: payload.new.created_at,
            user: {
              _id: payload.new.sender_id,
              name: payload.new.sender_name || "User",
              avatar:
                payload.new.sender_avatar_url ||
                "https://api.dicebear.com/9.x/avataaars/svg",
            },
          };
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      console.log("Unsubscribing from Supabase Realtime");
      supabase.removeChannel(channel);
    };
  }, [userId, token, adminId]);

  // Xử lý chọn ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!newMessage.trim() && !image) return;

    try {
      setSending(true);
      let imageUrl: string | null = null;

      // Upload ảnh nếu có
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        console.log("Uploading image:", image.name);
        const uploadResponse = await axios.post<{ imageUrl: string }>(
          `${import.meta.env.VITE_API_URL}/upload-image`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("Upload response:", uploadResponse.data);
        imageUrl = uploadResponse.data.imageUrl;
        if (!imageUrl) {
          throw new Error("Upload ảnh thất bại: Không nhận được URL");
        }
        console.log("Image uploaded:", imageUrl);
      }

      // Gửi tin nhắn
      console.log(
        "Sending message to userId:",
        userId,
        "with content:",
        newMessage,
        "and image:",
        imageUrl
      );
      const response = await axios.post<SendMessageResponse>(
        `${import.meta.env.VITE_API_URL}/messages`,
        {
          receiver_id: userId,
          content: newMessage || null,
          image_url: imageUrl,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Send message response:", response.data);
      const sentMessage = response.data.data;
      console.log("Sent message:", sentMessage);
      setMessages((prev) => [
        ...prev,
        {
          _id: sentMessage._id,
          text: sentMessage.text || "",
          image: sentMessage.image || null,
          createdAt: sentMessage.createdAt,
          user: {
            _id: adminId || sentMessage.user?._id || "",
            name: adminName,
            avatar: adminAvatar,
          },
        },
      ]);
      setNewMessage("");
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(
        "Send message error:",
        axiosError.response?.data || axiosError.message
      );
      toast.error(
        "Lỗi gửi tin nhắn: " +
          (axiosError.response?.data?.message || axiosError.message)
      );
      if (
        axiosError.response?.status === 401 ||
        axiosError.response?.status === 403
      ) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[600px] p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">
        Trò chuyện với {messages.length > 0 ? messages[0].user.name : "User"}
      </h1>
      {loading || !adminId ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <MainContainer
          style={{
            height: "calc(100% - 60px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <ChatContainer
            style={{ flex: 1, display: "flex", flexDirection: "column" }}
          >
            <MessageList
              style={{
                flex: 1,
                maxHeight: "calc(100% - 100px)",
                overflowY: "auto",
              }}
            >
              {messages.map((msg) => (
                <Message
                  key={msg._id}
                  model={{
                    sentTime: new Date(msg.createdAt).toLocaleTimeString(
                      "vi-VN"
                    ),
                    sender: msg.user.name || "Unknown",
                    direction:
                      msg.user._id === userId ? "incoming" : "outgoing",
                    position: "single",
                  }}
                >
                  <Message.HtmlContent
                    html={`${
                      msg.text
                        ? `<div style="margin: 0; padding: 0;">${msg.text}</div>`
                        : ""
                    }
  ${
    msg.image
      ? `<img src="${msg.image}" alt="image" style="max-width:200px; margin-top:8px;" />`
      : ""
  }`}
                  />

                  <Avatar
                    src={
                      msg.user.avatar ||
                      "https://api.dicebear.com/9.x/avataaars/svg"
                    }
                    name={msg.user.name || "Unknown"}
                  />
                </Message>
              ))}
            </MessageList>
            <InputToolbox
              style={{
                position: "sticky",
                bottom: 0,
                zIndex: 10,
                background: "white",
                padding: "8px 16px",
                width: "100%",
                boxSizing: "border-box",
                minHeight: "40px",
              }}
            >
              <div className="flex items-center gap-4 w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <ImageIcon className="w-6 h-6 text-gray-500 hover:text-blue-500" />
                </label>
                <MessageInput
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(val) => setNewMessage(val)}
                  onSend={handleSendMessage}
                  disabled={sending}
                  attachButton={false}
                  style={{
                    flex: 1,
                    minHeight: "20px",
                    fontSize: "16px",
                    padding: "9px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                {image && (
                  <div className="flex items-center gap-2">
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded"
                    />
                    <span className="text-sm text-gray-500 truncate max-w-[150px]">
                      {image.name}
                    </span>
                  </div>
                )}
              </div>
            </InputToolbox>
          </ChatContainer>
        </MainContainer>
      )}
      <style>{`

 .cs-message__content {
  padding: 4px 8px !important;
  margin: 0 !important;
  min-height: unset !important;
  line-height: 1.2 !important;
  background-color: #007aff !important; /* Xanh iMessage */
  color: white !important;              /* Chữ trắng */
  border-radius: 16px !important;
  padding: 6px 12px !important;
   border: none !important;
  box-shadow: none !important;
  font-size: 16px !important;
  font-weight: 500 !important;
}
.cs-message__html-content > * {
   margin: 0 !important;
  padding: 0 !important;
  display: inline !important;
  line-height: 1.25 !important;
}
  .cs-message__html-content {
   display: inline-block !important;
  margin: 5px 0 0 0 !important;  /* trên: 2px, dưới: 0 */
  padding: 0 !important;
  line-height: 1.25 !important;
}

      
        .cs-message-input__content-editor {
  min-height: 40px !important;
  max-height: 60px !important;
  font-size: 16px !important;
  padding: 8px 12px !important;
  overflow-y: auto !important;
}

.cs-button--send {
  font-size: 20px !important;
  width: 44px !important;
  height: 44px !important;
  margin-left: 4px !important;
  margin-right: 4px !important;
}

        .cs-message-list {
          overflow-y: auto !important;
          max-height: calc(100% - 100px) !important;
        }
          
      `}</style>
    </div>
  );
};

<<<<<<< HEAD
export default Dashboard;

export default Dashboard;
=======
export default Chat;
>>>>>>> 49e5cf6f05ce9bde46578a20aba5c006a9680b15
