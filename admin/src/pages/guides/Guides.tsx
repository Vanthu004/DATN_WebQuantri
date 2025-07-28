import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface GuideSectionProps {
  title: string;
  children: React.ReactNode;
}

const GuideSection: React.FC<GuideSectionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4 border-b border-gray-200">
      <button
        className="flex justify-between items-center w-full py-3 text-left text-lg font-semibold text-gray-800 hover:text-blue-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        {isOpen ? <FaChevronUp className="text-gray-600" /> : <FaChevronDown className="text-gray-600" />}
      </button>
      {isOpen && (
        <div className="pl-4 pb-4 text-gray-600">
          {children}
        </div>
      )}
    </div>
  );
};

const Guides: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Hướng dẫn sử dụng hệ thống quản trị</h1>
      <p className="text-gray-600 mb-8">
        Trang này cung cấp hướng dẫn chi tiết để sử dụng các tính năng của hệ thống quản trị. Nhấp vào từng mục dưới đây để xem chi tiết.
      </p>

      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Hướng dẫn quản lý sản phẩm */}
        <GuideSection title="Quản lý sản phẩm">
          <p className="mb-2">Hệ thống cho phép quản lý danh sách sản phẩm, thêm, sửa, hoặc xóa sản phẩm.</p>
          <ul className="list-disc ml-6">
            <li>
              <strong>Xem danh sách sản phẩm</strong>: Truy cập <Link to="/products" className="text-blue-500 hover:underline">Sản phẩm</Link> để xem toàn bộ sản phẩm. Sử dụng bộ lọc hoặc tìm kiếm để tìm sản phẩm cụ thể.
            </li>
            <li>
              <strong>Thêm sản phẩm</strong>: Vào <Link to="/products/add" className="text-blue-500 hover:underline">Thêm sản phẩm</Link>, điền thông tin (tên, giá, danh mục, hình ảnh) và lưu.
            </li>
            <li>
              <strong>Sửa sản phẩm</strong>: Từ danh sách sản phẩm, nhấp vào nút "Sửa" để cập nhật thông tin sản phẩm tại <Link to="/products" className="text-blue-500 hover:underline">/products/update/:id</Link>.
            </li>
            <li>
              <strong>Xóa sản phẩm</strong>: Trong danh sách sản phẩm, nhấp vào nút "Xóa" và xác nhận. Lưu ý: Hành động này không thể hoàn tác.
            </li>
          </ul>
        </GuideSection>

        {/* Hướng dẫn quản lý danh mục */}
        <GuideSection title="Quản lý danh mục">
          <p className="mb-2">Quản lý danh mục sản phẩm, bao gồm danh mục chính và loại danh mục.</p>
          <ul className="list-disc ml-6">
            <li>
              <strong>Xem danh sách danh mục</strong>: Truy cập <Link to="/categories" className="text-blue-500 hover:underline">Danh mục</Link> để xem tất cả danh mục.
            </li>
            <li>
              <strong>Thêm danh mục</strong>: Vào <Link to="/categories/add" className="text-blue-500 hover:underline">Thêm danh mục</Link>, nhập tên và mô tả, sau đó lưu.
            </li>
            <li>
              <strong>Sửa danh mục</strong>: Từ danh sách danh mục, nhấp vào "Sửa" để cập nhật thông tin tại <Link to="/categories" className="text-blue-500 hover:underline">/categories/update/:id</Link>.
            </li>
            <li>
              <strong>Quản lý loại danh mục</strong>: Truy cập <Link to="/categories/types" className="text-blue-500 hover:underline">Loại danh mục</Link> để quản lý các loại danh mục đặc biệt.
            </li>
          </ul>
        </GuideSection>

        {/* Hướng dẫn quản lý đơn hàng */}
        <GuideSection title="Quản lý đơn hàng">
          <p className="mb-2">Xem và quản lý các đơn hàng từ khách hàng.</p>
          <ul className="list-disc ml-6">
            <li>
              <strong>Xem danh sách đơn hàng</strong>: Truy cập <Link to="/orders" className="text-blue-500 hover:underline">Đơn hàng</Link> để xem tất cả đơn hàng. Sử dụng bộ lọc để xem theo trạng thái (chờ xử lý, đã giao, v.v.).
            </li>
            <li>
              <strong>Xem chi tiết đơn hàng</strong>: Nhấp vào một đơn hàng để xem chi tiết tại <Link to="/orders" className="text-blue-500 hover:underline">/orders/:id</Link>.
            </li>
            <li>
              <strong>Cập nhật trạng thái đơn hàng</strong>: Trong chi tiết đơn hàng, thay đổi trạng thái (ví dụ: từ "Chờ xử lý" sang "Đã giao").
            </li>
          </ul>
        </GuideSection>

        {/* Hướng dẫn quản lý người dùng */}
        <GuideSection title="Quản lý người dùng">
          <p className="mb-2">Quản lý tài khoản người dùng và quyền truy cập.</p>
          <ul className="list-disc ml-6">
            <li>
              <strong>Xem danh sách người dùng</strong>: Truy cập <Link to="/users" className="text-blue-500 hover:underline">Người dùng</Link> để xem tất cả tài khoản.
            </li>
            <li>
              <strong>Chỉnh sửa người dùng</strong>: Nhấp vào nút "Sửa" để cập nhật thông tin hoặc quyền của người dùng.
            </li>
            <li>
              <strong>Xóa người dùng</strong>: Nhấp vào nút "Xóa" trong danh sách người dùng. Lưu ý: Hành động này không thể hoàn tác.
            </li>
          </ul>
        </GuideSection>

        {/* Hướng dẫn quản lý thông báo */}
        <GuideSection title="Quản lý thông báo">
          <p className="mb-2">Xem và quản lý các thông báo hệ thống, bao gồm thông báo đơn hàng mới.</p>
          <ul className="list-disc ml-6">
            <li>
              <strong>Xem thông báo</strong>: Truy cập <Link to="/notify" className="text-blue-500 hover:underline">Thông báo</Link> để xem danh sách thông báo. Các thông báo mới được hiển thị bằng badge trong sidebar.
            </li>
            <li>
              <strong>Xóa hoặc đánh dấu đã đọc</strong>: Nhấp vào thông báo để đánh dấu đã đọc hoặc xóa nếu cần.
            </li>
          </ul>
        </GuideSection>

        {/* Hướng dẫn quản lý vouchers */}
        <GuideSection title="Quản lý vouchers">
          <p className="mb-2">Tạo và quản lý mã giảm giá (vouchers) cho khách hàng.</p>
          <ul className="list-disc ml-6">
            <li>
              <strong>Xem danh sách vouchers</strong>: Truy cập <Link to="/vouchers" className="text-blue-500 hover:underline">Vouchers</Link> để xem tất cả mã giảm giá.
            </li>
            <li>
              <strong>Thêm voucher</strong>: Nhấp vào nút "Thêm" để tạo mã giảm giá mới, bao gồm giá trị và thời hạn.
            </li>
            <li>
              <strong>Xóa hoặc chỉnh sửa</strong>: Sử dụng các nút "Sửa" hoặc "Xóa" trong danh sách vouchers.
            </li>
          </ul>
        </GuideSection>

        {/* Hướng dẫn quản lý bình luận */}
        <GuideSection title="Quản lý bình luận và đánh giá">
          <p className="mb-2">Xem và kiểm duyệt các bình luận, đánh giá từ khách hàng.</p>
          <ul className="list-disc ml-6">
            <li>
              <strong>Xem danh sách bình luận</strong>: Truy cập <Link to="/comments" className="text-blue-500 hover:underline">Bình luận - Đánh giá</Link> để xem tất cả bình luận.
            </li>
            <li>
              <strong>Kiểm duyệt bình luận</strong>: Xóa hoặc ẩn các bình luận không phù hợp.
            </li>
          </ul>
        </GuideSection>

        {/* Hướng dẫn cài đặt */}
        <GuideSection title="Cài đặt hệ thống">
          <p className="mb-2">Tùy chỉnh các thiết lập hệ thống.</p>
          <ul className="list-disc ml-6">
            <li>
              <strong>Truy cập cài đặt</strong>: Vào <Link to="/setting" className="text-blue-500 hover:underline">Cài đặt</Link> để thay đổi các thông số hệ thống.
            </li>
            <li>
              <strong>Lưu thay đổi</strong>: Sau khi chỉnh sửa, nhấp vào nút "Lưu" để áp dụng.
            </li>
          </ul>
        </GuideSection>

        {/* Mẹo sử dụng chung */}
        <GuideSection title="Mẹo sử dụng chung">
          <ul className="list-disc ml-6">
            <li>
              <strong>Đăng xuất</strong>: Nhấp vào nút "Đăng xuất" ở góc trên bên phải để thoát khỏi hệ thống.
            </li>
            <li>
              <strong>Thông báo Toast</strong>: Hệ thống sử dụng <code>react-toastify</code> để hiển thị thông báo (ví dụ: thành công, lỗi). Các thông báo xuất hiện ở góc trên bên phải và tự động biến mất sau 3 giây.
            </li>
            <li>
              <strong>Kiểm tra quyền truy cập</strong>: Nếu bạn không thể truy cập một trang, đảm bảo tài khoản của bạn có quyền quản trị. Liên hệ quản trị viên nếu cần.
            </li>
            <li>
              <strong>Hỗ trợ</strong>: Liên hệ đội ngũ hỗ trợ qua email hoặc số điện thoại được cung cấp trong cài đặt hệ thống.
            </li>
          </ul>
        </GuideSection>
      </div>

      <div className="mt-8 text-gray-600">
        <p>Nếu bạn cần thêm thông tin hoặc hỗ trợ, vui lòng liên hệ quản trị viên hệ thống.</p>
        <p className="mt-2">Cập nhật lần cuối: Tháng 7, 2025</p>
      </div>
    </div>
  );
};

export default Guides;