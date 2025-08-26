import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-red-500 mb-6">
        Không tìm thấy trang bạn yêu cầu. Vui lòng kiểm tra lại đường dẫn hoặc
        quay lại trang chính.
      </p>
      <button 
  onClick={() => navigate("/")}
  className="px-6 py-2 bg-[#007bff] text-white rounded-md transition-colors hover:bg-[#0056b3]"
>
  Quay trở lại trang chủ
</button>

    </div>
  );
};

export default PageNotFound;
