import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUser,
  FaProductHunt,
  FaList,
  FaShoppingCart,
} from "react-icons/fa";
import { MdOutlineNotificationsActive } from "react-icons/md";
import { RiDiscountPercentFill } from "react-icons/ri";
import { BiSolidCommentDetail } from "react-icons/bi";
import { AiFillSetting } from "react-icons/ai";
import "../../css/layouts/layoutAdmin.css";
<<<<<<< HEAD
=======
import { useOrderNotify } from "../../contexts/OrderNotifyContext";

import logo from '../../assets/LogoSwear.png';

>>>>>>> 76b74e7da45b4da85182c8151f94424bc81c9e08

const menuItems = [
  {
    path: "/",
    icon: <FaTachometerAlt />,
    label: "Bảng điều khiển",
  },
  {
<<<<<<< HEAD
    path: "/notifications",
=======
    path: "/notify",
>>>>>>> 76b74e7da45b4da85182c8151f94424bc81c9e08
    icon: <MdOutlineNotificationsActive />,
    label: "Thông báo",
  },
  {
    path: "/users",
    icon: <FaUser />,
    label: "Người dùng",
  },
  {
    path: "/products",
    icon: <FaProductHunt />,
    label: "Sản phẩm",
  },
  {
    path: "/categories",
    icon: <FaList />,
    label: "Danh mục",
  },
  {
    path: "/vouchers",
    icon: <RiDiscountPercentFill />,
    label: "Vouchers",
  },
  {
<<<<<<< HEAD
    path: "/order",
=======
    path: "/orders",
>>>>>>> 76b74e7da45b4da85182c8151f94424bc81c9e08
    icon: <FaShoppingCart />,
    label: "Đơn hàng",
  },
  {
    path: "/comments",
    icon: <BiSolidCommentDetail />,
    label: "Bình luận - Đánh giá",
  },
  {
    path: "/setting",
    icon: <AiFillSetting />,
    label: "Cài đặt",
  },
];

const LayoutAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
<<<<<<< HEAD
=======
  const { newOrderCount } = useOrderNotify();
>>>>>>> 76b74e7da45b4da85182c8151f94424bc81c9e08

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="layout-container">
      {/* Header */}
      <header className="layout-header">
        <Link to="/" className="logo-section">
<<<<<<< HEAD
          <img src="https://i.imgur.com/jInJnWw.png" alt="SneakerHub Logo" />
          <span className="brand-name">Swear</span>
=======
          <img src = {logo} alt="SwearLogo" />
>>>>>>> 76b74e7da45b4da85182c8151f94424bc81c9e08
        </Link>
        <div className="header-actions">
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
                    to={item.path}
                    className={location.pathname === item.path ? "active" : ""}
                  >
                    {item.icon}
                    <span>{item.label}</span>
<<<<<<< HEAD
=======
                    {/* Hiển thị badge nếu là menu Thông báo và có số mới > 0 */}
                    {item.path === "/notify" && newOrderCount > 0 && (
                      <span className="menu-badge">{newOrderCount}</span>
                    )}
>>>>>>> 76b74e7da45b4da85182c8151f94424bc81c9e08
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
