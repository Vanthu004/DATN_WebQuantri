import { useState } from "react";
import { createColor } from "../../services/color";
import { useNavigate } from "react-router-dom";
import "../../css/color/addColor.css";

const AddColor = () => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [hexCode, setHexCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name.trim()) {
      setError("Tên màu không được để trống");
      return;
    }
    setLoading(true);
    try {
      await createColor({ name, code, hex_code: hexCode });
      setSuccess("Thêm màu thành công!");
      setTimeout(() => navigate("/colors"), 1000);
    } catch (err) {
      setError("Có lỗi xảy ra khi thêm màu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-color-container">
      <h2 className="add-color-title">Thêm màu mới</h2>
      <form className="add-color-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Tên màu <span className="text-red">*</span></label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nhập tên màu"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="code">Mã màu</label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Nhập mã màu (nếu có)"
          />
        </div>
        <div className="form-group">
          <label htmlFor="hex_code">Mã hex</label>
          <input
            id="hex_code"
            type="text"
            value={hexCode}
            onChange={e => setHexCode(e.target.value)}
            placeholder="#FF0000"
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}
        <button className="add-color-btn" type="submit" disabled={loading}>
          {loading ? "Đang lưu..." : "Thêm màu"}
        </button>
      </form>
    </div>
  );
};

export default AddColor;
