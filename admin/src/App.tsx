import { Route, Routes } from "react-router-dom";
import "./App.css";
import PageNotFound from "./pages/PageNotFound";
import LayoutAdmin from "./components/layouts/LayoutAdmin";
import ListProduct from "./pages/products/ListProduct";
import ListCategory from "./pages/categories/ListCategory";
import AddCategory from "./pages/categories/AddCategory";
import UpdateCategory from "./pages/categories/UpdateCategory";
import AddProduct from "./pages/products/AddProduct";
import UpdateProduct from "./pages/products/UpdateProduct";
import PrivateRouter from "./hooks/PrivateRouter";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RegisterPage from "./pages/auths/Register";
import Login from "./pages/auths/Login";
import ListUser from "./pages/users/ListUser";
import UserManagementPage from "./pages/users/UserManagementPage";
import Setting from "./pages/settings/Setting";
import OrderPage from "./pages/orders/Order";
import OrderDetail from "./pages/orders/OrderDetail";
import ManageCategoryType from "./pages/categoryTypes/ManageCategoryType";
import ProductsByCategoryType from "./pages/products/ProductsByCategoryType";
import Notify from "./pages/notify/Notify";
import Vouchers from "./pages/vouchers/Vouchers";
import AddVoucher from "./pages/vouchers/AddVoucher";
import EditVoucher from "./pages/vouchers/UpdateVoucher";
import Comments from "./pages/comments/Comments";
import SalesStatisticsPage from "./pages/statistics/SalesStatisticsPage";

{/* Chat Support Routes */}
// Chat Support Pages
import ChatDashboard from "./pages/chat/ChatDashboard";
import ChatRoomsList from "./pages/chat/ChatRoomsList";
import ChatRoomDetail from "./pages/chat/ChatRoomDetail";
import ShipperManagementPage from "./pages/shippers/ShipperManagementPage";
import ShipperListPage from "./pages/shippers/ShipperListPage";
import OrderAssignmentPage from "./pages/shippers/OrderAssignmentPage";
import ShipperStatisticsPage from "./pages/shippers/ShipperStatisticsPage";
import AddShipper from "./pages/shippers/AddShipper";
import ShipperReportsPage from "./pages/shippers/ShipperReportsPage";
import { ChatProvider } from "./contexts/ChatContext";
import ListSizes from "./pages/sizes/ListSizes";
import AddSize from "./pages/sizes/AddSize";
import UpdateSize from "./pages/sizes/UpdateSize";
import ListColors from "./pages/colors/ListColors";
import AddColor from "./pages/colors/AddColor";
import UpdateColor from "./pages/colors/UpdateColor";
import Guides from "./pages/guides/Guides"; // Import trang mới
import { OrderNotifyProvider } from "./contexts/OrderNotifyContext";


function App() {
  return (
    <OrderNotifyProvider>
      <ChatProvider>
      <Routes>
        {/* Private routes */}
        <Route element={<PrivateRouter />}>
          <Route element={<LayoutAdmin />}>
            <Route path="/" index element={<SalesStatisticsPage />} />
            <Route path="/notify" element={<Notify />} />
            <Route path="/statistics" element={<SalesStatisticsPage />} />
            
            {/* Shipper Management Routes */}
            <Route path="/shippers" element={<ShipperManagementPage />} />
            <Route path="/shippers/list" element={<ShipperListPage />} />
            <Route path="/shippers/add" element={<AddShipper />} />
            <Route path="/shippers/orders" element={<OrderAssignmentPage />} />
            <Route path="/shippers/statistics" element={<ShipperStatisticsPage />} />
            <Route path="/shippers/reports" element={<ShipperReportsPage />} />
            
            <Route path="/vouchers" element={<Vouchers />} />
            <Route path="/addvouchers" element={<AddVoucher />} />
            <Route path="//updatevouchers/:voucher_id" element={<EditVoucher />} />
            <Route path="/updatevouchers/:voucher_id" element={<EditVoucher />} />
            <Route path="/comments" element={<Comments />} />
              <Route path="/chat/dashboard" element={<ChatDashboard />} />
              <Route path="/chat/rooms" element={<ChatRoomsList />} />
              <Route path="/chat/room/:roomId" element={<ChatRoomDetail />} />
              
              {/* Redirect /chat to dashboard */}
              <Route path="/chat" element={<ChatDashboard />} />
            {/* Product Path */}
            <Route path="/products" element={<ListProduct />} />
            <Route path="/products/add" element={<AddProduct />} />
            <Route path="/products/update/:id" element={<UpdateProduct />} />

            {/* Category Path */}
            <Route path="/categories/types" element={<ManageCategoryType />} />
            <Route path="/categories" element={<ListCategory />} />
            <Route path="/categories/add" element={<AddCategory />} />
            <Route path="/categories/update/:id" element={<UpdateCategory />} />

            {/* Size Path */}
            <Route path="/sizes" element={<ListSizes />} />
            <Route path="/sizes/add" element={<AddSize />} />
            <Route path="/sizes/update/:id" element={<UpdateSize />} />

            {/* Color Path */}
            <Route path="/colors" element={<ListColors />} />
            <Route path="/colors/add" element={<AddColor />} />
            <Route path="/colors/update/:id" element={<UpdateColor />} />

            {/* Products by Category Type */}
            <Route path="/products/category-type/:type" element={<ProductsByCategoryType />} />

            {/* User Path */}
            <Route path="/users" element={<ListUser />} />
            <Route path="/users/manage" element={<UserManagementPage />} />

            {/* Order Path */}
            <Route path="/orders" element={<OrderPage />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/setting" element={<Setting />} />

            {/* Thêm route mới cho Guides */}
            <Route path="/guides" element={<Guides />} />
          </Route>
        </Route>
        {/* Public path */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
      </ChatProvider>
    </OrderNotifyProvider>
  );
}
export default App;