import React, { useState } from "react";
import { updateUserRole } from "../services/user";
import User, { UpdateRoleResponse } from "../interfaces/user";

interface UserRoleManagerProps {
  user: User;
  onRoleUpdate: (updatedUser: User) => void;
  currentUserRole: string;
  token: string;
}

const UserRoleManager: React.FC<UserRoleManagerProps> = ({
  user,
  onRoleUpdate,
  currentUserRole,
  token,
}) => {
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleRoleChange = async () => {
    if (selectedRole === user.role) {
      setMessage({ type: "error", text: "Role không thay đổi" });
      return;
    }

    // Kiểm tra quyền
    if (currentUserRole !== "admin") {
      setMessage({ type: "error", text: "Bạn không có quyền thay đổi role" });
      return;
    }

    // Không cho phép hạ cấp chính mình
    if (user._id === "current-user-id" && selectedRole !== "admin") {
      setMessage({ type: "error", text: "Bạn không thể hạ cấp chính mình" });
      return;
    }

    setIsUpdating(true);
    setMessage(null);

    try {
      // Validate role before sending
      if (!["admin", "staff", "user"].includes(selectedRole)) {
        throw new Error("Role không hợp lệ");
      }

      // Debug logs
      console.log("Updating role with data:", {
        userId: user._id,
        currentRole: user.role,
        newRole: selectedRole,
        hasToken: !!token,
      });

      const response = await updateUserRole(user._id, selectedRole, token);

      if (response.data) {
        const responseData = response.data as UpdateRoleResponse;
        setMessage({
          type: "success",
          text: `Đã cập nhật role của ${user.name} từ ${user.role} thành ${selectedRole}`,
        });
        onRoleUpdate(responseData.user);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi cập nhật role";
      setMessage({ type: "error", text: errorMessage });
      // Reset về role cũ nếu có lỗi
      setSelectedRole(user.role);
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "staff":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "user":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "👑 Admin";
      case "staff":
        return "👤 Nhân viên";
      case "user":
        return "🛒 Khách hàng";
      default:
        return role;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Cấp quyền người dùng</h3>
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full border ${getRoleColor(
            user.role
          )}`}
        >
          {getRoleLabel(user.role)}
        </span>
      </div>

      <div className="space-y-4">
        {/* Thông tin user */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              {user.avata_url ? (
                <img
                  src={user.avata_url}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Role selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn quyền mới:
          </label>
          <select
            value={selectedRole}
            onChange={(e) =>
              setSelectedRole(e.target.value as "admin" | "staff" | "user")
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isUpdating || currentUserRole !== "admin"}
          >
            <option value="user">🛒 Người dùng (user)</option>
            <option value="staff">👤 Nhân viên (staff)</option>
            <option value="admin">👑 Admin (admin)</option>
          </select>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-3 rounded-md ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleRoleChange}
            disabled={
              isUpdating ||
              currentUserRole !== "admin" ||
              selectedRole === user.role
            }
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              isUpdating ||
              currentUserRole !== "admin" ||
              selectedRole === user.role
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isUpdating ? "🔄 Đang cập nhật..." : "✅ Cập nhật quyền"}
          </button>

          <button
            onClick={() => setSelectedRole(user.role)}
            disabled={isUpdating || selectedRole === user.role}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isUpdating || selectedRole === user.role
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-600 text-white hover:bg-gray-700"
            }`}
          >
            🔄 Reset
          </button>
        </div>

        {/* Warning messages */}
        {currentUserRole !== "admin" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-yellow-800 text-sm">
              ⚠️ Chỉ admin mới có quyền thay đổi role của người dùng
            </p>
          </div>
        )}

        {user.role === "admin" && (
          <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
            <p className="text-orange-800 text-sm">
              ⚠️ Cẩn thận khi thay đổi quyền của admin khác
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRoleManager;
