import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSizeById, updateSize } from "../../services/size";
import { Size } from "../../interfaces/size";
import "../../css/size/updateSize.css";

const UpdateSize = () => {
  const { id } = useParams<{ id: string }>();
  const [size, setSize] = useState<Size | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (id) fetchSize(id);
    // eslint-disable-next-line
  }, [id]);

  const fetchSize = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await getSizeById(id);
      setSize(data);
      setName(data.name);
      setCode(data.code || "");
    } catch (err) {
      setError("Không tìm thấy size!");
    } finally {
      setLoading(false);
    }
  };

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
      if (id) await updateSize(id, { name, code });
      setSuccess("Cập nhật size thành công!");
      setTimeout(() => navigate("/sizes"), 1000);
    } catch (err) {
      setError("Cập nhật size thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !size) return <div className="update-size-container">Đang tải...</div>;
  if (error && !size) return <div className="update-size-container form-error">{error}</div>;

  return (
    <div className="update-size-container">
      <h2 className="update-size-title">Cập nhật size</h2>
      <form className="update-size-form" onSubmit={handleSubmit}>
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
        <button className="update-size-btn" type="submit" disabled={loading}>
          {loading ? "Đang lưu..." : "Cập nhật size"}
        </button>
      </form>
    </div>
  );
};

export default UpdateSize;
