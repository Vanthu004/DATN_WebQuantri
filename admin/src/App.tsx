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
import Comments from "./pages/comments/Comments";

function App() {
  return (
    <>
      <Routes>
        {/* Private routes */}
        <Route element={<PrivateRouter />}>
          <Route element={<LayoutAdmin />}>
            <Route path="/" index element={<Dashboard />} />
            <Route path="/notify" element={<Notify />} />
            <Route path="/vouchers" element={<Vouchers />} />
            <Route path="/comments" element={<Comments />} />

            {/* Product Path*/}
            <Route path="/products" element={<ListProduct />} />
            <Route path="/products/add" element={<AddProduct />} />
            <Route path="/products/update/:id" element={<UpdateProduct />} />

            {/* Category Path */}
            <Route path="/categories/types" element={<ManageCategoryType />} />
            <Route path="/categories" element={<ListCategory />} />
            <Route path="/categories/add" element={<AddCategory />} />
            <Route path="/categories/update/:id" element={<UpdateCategory />} />

            {/* Products by Category Type */}
            <Route path="/products/category-type/:type" element={<ProductsByCategoryType />} />

            {/* User Path */}
            <Route path="/users" element={<ListUser />} />

            {/* Order Path */}
            <Route path="/orders" element={<OrderPage />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/setting" element={<Setting />} />
          </Route>
        </Route>
        {/* Public path */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
