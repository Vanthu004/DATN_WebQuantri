import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getColorById, updateColor } from "../../services/color";
import { Color } from "../../interfaces/color";
import "../../css/color/updateColor.css";

const UpdateColor = () => {
  const { id } = useParams<{ id: string }>();
  const [color, setColor] = useState<Color | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [hexCode, setHexCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (id) fetchColor(id);
    // eslint-disable-next-line
  }, [id]);

  const fetchColor = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await getColorById(id);
      setColor(data);
      setName(data.name);
      setCode(data.code || "");
      setHexCode(data.hex_code || "");
    } catch (err) {
      setError("Không tìm thấy màu!");
    } finally {
      setLoading(false);
    }
  };

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
      if (id) await updateColor(id, { name, code, hex_code: hexCode });
      setSuccess("Cập nhật màu thành công!");
      setTimeout(() => navigate("/colors"), 1000);
    } catch (err) {
      setError("Cập nhật màu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !color) return <div className="update-color-container">Đang tải...</div>;
  if (error && !color) return <div className="update-color-container form-error">{error}</div>;

  return (
    <div className="update-color-container">
      <h2 className="update-color-title">Cập nhật màu</h2>
      <form className="update-color-form" onSubmit={handleSubmit}>
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
        <button className="update-color-btn" type="submit" disabled={loading}>
          {loading ? "Đang lưu..." : "Cập nhật màu"}
        </button>
      </form>
    </div>
  );
};

export default UpdateColor;
