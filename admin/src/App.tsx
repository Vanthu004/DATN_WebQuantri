import { Route, Routes } from "react-router-dom";
import "./App.css";
import PageNotFound from "./pages/PageNotFound";
import Dashboard from "./pages/statics/Dashboard";
import LayoutAdmin from "./components/layouts/LayoutAdmin";
import ListProduct from "./pages/products/ListProduct";
import ListCategory from "./pages/categories/ListCategory";
import AddCategory from "./pages/categories/AddCategory";
import { ToastContainer } from "react-toastify";
import UpdateCategory from "./pages/categories/UpdateCategory";
import AddProduct from "./pages/products/AddProduct";
import UpdateProduct from "./pages/products/UpdateProduct";

function App() {
  return (
    <>
      <Routes>
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

          <Route path="" element />
          <Route path="" element />
          <Route path="" element />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
