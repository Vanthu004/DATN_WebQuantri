import { Route, Routes } from "react-router-dom";
import "./App.css";
import PageNotFound from "./pages/PageNotFound";
import Dashboard from "./pages/statics/Dashboard";
import LayoutAdmin from "./components/layouts/LayoutAdmin";

function App() {
  return (
    <>
      <Routes>
        <Route element={<LayoutAdmin />}>
          <Route path="/" index element={<Dashboard />} />
          <Route path="" element />
          <Route path="" element />
          <Route path="" element />
          <Route path="" element />
          <Route path="" element />
          <Route path="" element />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;
