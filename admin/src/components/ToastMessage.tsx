import React, { useEffect } from "react";

interface ToastMessageProps {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

const toastStyle: React.CSSProperties = {
  position: "fixed",
  top: 24,
  right: 24,
  minWidth: 220,
  zIndex: 9999,
  padding: "12px 24px",
  borderRadius: 8,
  color: "#fff",
  fontWeight: 500,
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  fontSize: 16,
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const typeColors: Record<string, string> = {
  success: "#4caf50",
  error: "#f44336",
};

const ToastMessage: React.FC<ToastMessageProps> = ({
  type,
  message,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{ ...toastStyle, background: typeColors[type] }}>
      {type === "success" ? "✔️" : "❌"}
      <span>{message}</span>
      <button
        style={{
          marginLeft: 12,
          background: "none",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          fontSize: 18,
        }}
        onClick={onClose}
        aria-label="Đóng"
      >
        ×
      </button>
    </div>
  );
};

export default ToastMessage;
