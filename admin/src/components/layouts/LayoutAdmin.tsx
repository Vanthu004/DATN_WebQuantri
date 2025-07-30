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
import logo from '../../assets/LogoSwear.png';
import { useOrderNotify } from "../../contexts/OrderNotifyContext";



const menuItems = [
  {
    path: "/",
    icon: <FaTachometerAlt />,
    label: "Bảng điều khiển",
  },
  {
    path: "/notify",
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
    path: "/sizes",
    icon: <FaList />,
    label: "Kích thước",
  },
  {
    path: "/colors",
    icon: <FaList />,
    label: "Màu sắc",
  },
  {
    path: "/vouchers",
    icon: <RiDiscountPercentFill />,
    label: "Vouchers",
  },
  {
    path: "/orders",
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
  const { newOrderCount } = useOrderNotify();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="layout-container">
      {/* Header */}
      <header className="layout-header">
        <Link to="/" className="logo-section">
          <img src = {logo} alt="SwearLogo" />
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
                    {/* Hiển thị badge nếu là menu Thông báo và có số mới > 0 */}
                    {item.path === "/notify" && newOrderCount > 0 && (
                      <span className="menu-badge">{newOrderCount}</span>
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
