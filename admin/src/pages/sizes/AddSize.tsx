import { useState } from "react";
import { createSize } from "../../services/size";
import { useNavigate } from "react-router-dom";
import "../../css/size/addSize.css";

const AddSize = () => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name.trim()) {
      setError("Tên size không được để trống");
      return;
    }
    setLoading(true);
    try {
      await createSize({ name, code });
      setSuccess("Thêm size thành công!");
      setTimeout(() => navigate("/sizes"), 1000);
    } catch (err) {
        console.log(error)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-size-container">
      <h2 className="add-size-title">Thêm size mới</h2>
      <form className="add-size-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Tên size <span className="text-red">*</span></label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nhập tên size"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="code">Mã size</label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Nhập mã size (nếu có)"
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}
        <button className="add-size-btn" type="submit" disabled={loading}>
          {loading ? "Đang lưu..." : "Thêm size"}
        </button>
      </form>
    </div>
  );
};

export default AddSize;
