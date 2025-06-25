import React, { useState } from "react";
import { Register } from "../../services/auth";
import "../../css/auth/register.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const RegisterPage = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone_number: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await Register(form);
      setSuccess("Đăng ký thành công!");
      toast.success("Đăng ký thành công");
      navigate("/login");
    } catch (err) {
      setError("Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Đăng ký</h2>
        {error && <div className="register-error">{error}</div>}
        {success && <div className="register-success">{success}</div>}
        <input
          type="text"
          name="name"
          placeholder="Họ và tên"
          value={form.name}
          onChange={handleChange}
          required
        />
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
        <input
          type="text"
          name="phone_number"
          placeholder="Số điện thoại"
          value={form.phone_number}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Địa chỉ"
          value={form.address}
          onChange={handleChange}
          required
        />
        <button type="submit">Đăng ký</button>
      </form>
    </div>
  );
};

export default RegisterPage;
