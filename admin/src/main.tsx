import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { OrderNotifyProvider } from "./contexts/OrderNotifyContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <OrderNotifyProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </OrderNotifyProvider>
  </React.StrictMode>
);
