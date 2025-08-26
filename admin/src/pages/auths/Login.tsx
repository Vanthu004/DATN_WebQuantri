import React, { useState } from "react";
import { Login as LoginService } from "../../services/auth";
import "../../css/auth/login.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext"; // Thêm import useAuth

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // Thêm: Lấy hàm login từ context

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = (await LoginService(form)) as { token?: string; user?: any };
      if (res && res.token) {
        const role = res.user?.role as string | undefined;
        if (!role || !["admin", "staff"].includes(role)) {
          setError("Tài khoản của bạn không có quyền truy cập trang quản trị");
          toast.error("Không có quyền truy cập admin");
          return;
        }

        // Gọi login từ context để update state và lưu storage
        login(res.token, res.user);
        toast.success("Đăng nhập thành công");
        navigate("/");
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      setError("Đăng nhập thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Đăng nhập</h2>
        {error && <div className="login-error">{error}</div>}
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
};

export default Login;