// admin/src/components/layouts/LayoutAdmin.tsx (Updated)

import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FaUser,
  FaProductHunt,
  FaList,
  FaShoppingCart,
  FaBook, // Thêm biểu tượng cho Guides
  FaChartBar, // Thêm biểu tượng cho Thống kê
  FaWarehouse, // Thêm biểu tượng cho Kho hàng
} from "react-icons/fa";
import { MdOutlineNotificationsActive } from "react-icons/md";
import { RiDiscountPercentFill } from "react-icons/ri";
import { BiSolidCommentDetail } from "react-icons/bi";
import { BsChatDots } from "react-icons/bs"; // Icon cho Chat Support
import { AiFillSetting } from "react-icons/ai";
import "../../css/layouts/layoutAdmin.css";
import "../../css/notify/orderToast.css";
import logo from '../../assets/LogoSwear.png';
import { useOrderNotify } from "../../contexts/OrderNotifyContext";
import { useOrderNotification } from "../../hooks/useOrderNotification";
import OrderToast from "../OrderToast";

interface User {
  role: string;
}

const LayoutAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { newOrderCount, latestOrder, showToast, setShowToast } = useOrderNotify();
  const [user, setUser] = useState<User | null>(null);
  
  // Khởi tạo hook để kiểm tra đơn hàng mới
  useOrderNotification();

  useEffect(() => {
    // Get user role from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ role: payload.role || 'user' });
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  // Base menu items for all users
  const baseMenuItems = [
    {
      path: "/",
      icon: <FaChartBar />,
      label: "Thống kê",
      roles: ["admin", "staff"]
    },
    {
      path: "/inventory",
      icon: <FaWarehouse />,
      label: "Kho hàng",
      roles: ["admin"]
    },
    {
      path: "/notify",
      icon: <MdOutlineNotificationsActive />,
      label: "Thông báo",
      roles: ["admin", "staff"]
    },
    {
      path: "/users",
      icon: <FaUser />,
      label: "Người dùng",
      roles: ["admin"]
    },
    {
      path: "/products",
      icon: <FaProductHunt />,
      label: "Sản phẩm",
      roles: ["admin"]
    },
    {
      path: "/categories",
      icon: <FaList />,
      label: "Danh mục",
      roles: ["admin"]
    },
    {
      path: "/sizes",
      icon: <FaList />,
      label: "Kích thước",
      roles: ["admin"]
    },
    {
      path: "/colors",
      icon: <FaList />,
      label: "Màu sắc",
      roles: ["admin"]
    },
    {
      path: "/vouchers",
      icon: <RiDiscountPercentFill />,
      label: "Vouchers",
      roles: ["admin"]
    },
    {
      path: "/orders",
      icon: <FaShoppingCart />,
      label: "Đơn hàng",
      roles: ["admin", "staff"]
    },
    {
      path: "/comments",
      icon: <BiSolidCommentDetail />,
      label: "Bình luận - Đánh giá",
      roles: ["admin", "staff"]
    },
    {
      path: "/chat",
      icon: <BsChatDots />,
      label: "Chat Support",
      roles: ["admin", "staff"]
    },
    {
      path: "/setting",
      icon: <AiFillSetting />,
      label: "Cài đặt",
      roles: ["admin", "staff"]
    },
    {
      path: "/guides",
      icon: <FaBook />,
      label: "Hướng dẫn sử dụng",
      roles: ["admin", "staff"]
    },
  ];

  // Filter menu items based on user role
  const menuItems = baseMenuItems.filter(item => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  // Check if chat menu item should have notification badge
  const getChatPath = () => {
    const chatPaths = ['/chat', '/chat/dashboard', '/chat/rooms'];
    return chatPaths.includes(location.pathname) || location.pathname.startsWith('/chat/room/');
  };

  return (
    <div className="layout-container">
      {/* Order Toast Notification */}
      <OrderToast
        order={latestOrder}
        isVisible={showToast}
        onClose={handleCloseToast}
        onViewOrder={handleViewOrder}
      />

      {/* Header */}
      <header className="layout-header">
        <Link to="/" className="logo-section">
          <img src={logo} alt="SwearLogo" />
        </Link>
        <div className="header-actions">
          {user && (
            <div className="user-info">
              <span className="user-role">
                {user.role === 'admin' && 'Quản trị viên'}
                {user.role === 'staff' && 'Nhân viên hỗ trợ'}
                {user.role === 'user' && 'Người dùng'}
              </span>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="layout-body">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-account-section">
            <span className="account-title">Tài khoản</span>
          </div>
          <nav className="sidebar-menu">
            <ul>
              {menuItems.map((item) => (
                <li key={item.path} className="menu-item">
                  <Link
                    to={item.path === '/chat' ? '/chat/dashboard' : item.path}
                    className={
                      (item.path === '/chat' ? getChatPath() : location.pathname === item.path) 
                        ? "active" 
                        : ""
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {/* Hiển thị chấm đỏ nếu là menu Thông báo và có đơn hàng mới */}
                    {item.path === "/notify" && newOrderCount > 0 && (
                      <span className="menu-dot"></span>
                    )}
                    {/* TODO: Add chat notification badge if needed */}
                    {item.path === "/chat" && false && (
                      <span className="menu-dot chat-dot"></span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content-wrapper">
          <div className="main-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default LayoutAdmin;