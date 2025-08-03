import { Route, Routes } from "react-router-dom";
import "./App.css";
import PageNotFound from "./pages/PageNotFound";
import Dashboard from "./pages/statics/Dashboard";
import LayoutAdmin from "./components/layouts/LayoutAdmin";
import ListProduct from "./pages/products/ListProduct";
import ListCategory from "./pages/categories/ListCategory";
import AddCategory from "./pages/categories/AddCategory";
import UpdateCategory from "./pages/categories/UpdateCategory";
import AddProduct from "./pages/products/AddProduct";
import UpdateProduct from "./pages/products/UpdateProduct";
import PrivateRouter from "./hooks/PrivateRouter";
import { ToastContainer } from "react-toastify";
import RegisterPage from "./pages/auths/Register";
import Login from "./pages/auths/Login";
import ListUser from "./pages/users/ListUser";
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
import ListSizes from "./pages/sizes/ListSizes";
import AddSize from "./pages/sizes/AddSize";
import UpdateSize from "./pages/sizes/UpdateSize";
import ListColors from "./pages/colors/ListColors";
import AddColor from "./pages/colors/AddColor";
import UpdateColor from "./pages/colors/UpdateColor";
import Guides from "./pages/guides/Guides";
import Support from "./pages/support/Support";
import Chat from "./pages/support/Chat";

function App() {
  return (
    <>
    <>
      <Routes>
        {/* Private routes */}
        <Route element={<PrivateRouter />}>
          <Route element={<LayoutAdmin />}>
            <Route path="/" index element={<Dashboard />} />
            <Route path="/notify" element={<Notify />} />
            <Route path="/vouchers" element={<Vouchers />} />
            <Route path="/addvouchers" element={<AddVoucher />} />
            <Route
              path="/updatevouchers/:voucher_id"
              element={<EditVoucher />}
            />
            <Route path="/comments" element={<Comments />} />
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
            <Route
              path="/products/category-type/:type"
              element={<ProductsByCategoryType />}
            />
            {/* User Path */}
            <Route path="/users" element={<ListUser />} />
            {/* Order Path */}
            <Route path="/orders" element={<OrderPage />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/setting" element={<Setting />} />
            {/* Thêm route mới cho Guides */}
            <Route path="/guides" element={<Guides />} />
            {/* Thêm route mới cho Support */}
            <Route path="/support" element={<Support />} />
            <Route path="/support/:userId" element={<Chat />} />
          </Route>
        </Route>
        {/* Public path */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
    </>
  );
}

export default App;
