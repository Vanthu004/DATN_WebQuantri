import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUser,
  FaProductHunt,
  FaList,
  FaShoppingCart,
} from "react-icons/fa";
import { MdOutlineNotificationsActive } from "react-icons/md";
import { IoColorPaletteOutline } from "react-icons/io5";
import { CgSize } from "react-icons/cg";
import { RiDiscountPercentFill } from "react-icons/ri";
import { BiSolidCommentDetail } from "react-icons/bi";
import { AiFillSetting } from "react-icons/ai";

const menuItems = [
  {
    path: "/",
    icon: <FaTachometerAlt className="mr-2" />,
    label: "Bảng điều khiển",
  },
  {
    path: "/notifications",
    icon: <MdOutlineNotificationsActive className="mr-2" />,
    label: "Thông báo",
  },
  {
    path: "/users",
    icon: <FaUser className="mr-2" />,
    label: "Người dùng",
  },
  {
    path: "/products",
    icon: <FaProductHunt className="mr-2" />,
    label: "Sản phẩm",
  },
  {
    path: "/categories",
    icon: <FaList className="mr-2" />,
    label: "Danh mục",
  },
  {
    path: "/colors",
    icon: <IoColorPaletteOutline className="mr-2" />,
    label: "Danh mục màu sắc",
  },
  {
    path: "/sizies",
    icon: <CgSize className="mr-2" />,
    label: "Danh mục kích cỡ",
  },
  {
    path: "/vouchers",
    icon: <RiDiscountPercentFill className="mr-2" />,
    label: "Vouchers",
  },
  {
    path: "/order",
    icon: <FaShoppingCart className="mr-2" />,
    label: "Đơn hàng",
  },
  {
    path: "/comments",
    icon: <BiSolidCommentDetail className="mr-2" />,
    label: "Bình luận - Đánh giá",
  },
  {
    path: "/slides",
    icon: <AiFillSetting className="mr-2" />,
    label: "Cài đặt Slide",
  },
];

const LayoutAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      {/* Header */}
      <div className="w-full bg-white border-b border-gray-200 flex items-center justify-between px-8 py-3">
        <div className="flex items-center space-x-3">
          <img
            src="https://i.imgur.com/jInJnWw.png"
            alt="SneakerHub Logo"
            className="h-10 w-auto object-contain"
          />
          <span className="text-2xl font-bold text-[#ff5b2e] tracking-wide">
            Kenhquanly
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <span className="text-gray-600">admin1</span>
          <button
            className="px-4 py-2 bg-[#ff5b2e] text-white rounded-lg hover:bg-[#e04a1e] transition-colors duration-200 text-sm font-medium"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>
      </div>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
          {/* Logo Section */}
          <div className="p-6 flex flex-col items-start">
            <span className="text-lg font-semibold text-gray-700 mb-2">
              Tài khoản
            </span>
          </div>
          {/* Menu */}
          <div className="flex-1 p-2 overflow-y-auto scrollbar-hide">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 text-gray-700 hover:bg-gray-100 hover:text-[#ff5b2e] font-medium
                    ${
                      location.pathname === item.path
                        ? "bg-gray-100 text-[#ff5b2e]"
                        : ""
                    }`}
                  >
                    {item.icon}
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-8 min-h-[80vh]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutAdmin;
