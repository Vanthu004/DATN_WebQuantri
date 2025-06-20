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
import RegisterPage from "./pages/auths/register";
import Login from "./pages/auths/login";
import PrivateRouter from "./hooks/PrivateRouter";

function App() {
  return (
    <>
      <Routes>
        {/* Private routes */}
        <Route element={<PrivateRouter />}>
          <Route element={<LayoutAdmin />}>
            <Route path="/" index element={<Dashboard />} />

            {/* Product Path*/}
            <Route path="/products" element={<ListProduct />} />
            <Route path="/products/add" element={<AddProduct />} />
            <Route path="/products/update/:id" element={<UpdateProduct />} />

            {/* Category Path */}
            <Route path="/categories" element={<ListCategory />} />
            <Route path="/categories/add" element={<AddCategory />} />
            <Route path="/categories/update/:id" element={<UpdateCategory />} />

            {/* Các route khác cần đăng nhập có thể thêm ở đây */}
          </Route>
        </Route>
        {/* Public routes */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
