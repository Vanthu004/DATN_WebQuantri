import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
<<<<<<< HEAD

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
=======
import { OrderNotifyProvider } from "./contexts/OrderNotifyContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <OrderNotifyProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </OrderNotifyProvider>
>>>>>>> 76b74e7da45b4da85182c8151f94424bc81c9e08
  </React.StrictMode>
);
