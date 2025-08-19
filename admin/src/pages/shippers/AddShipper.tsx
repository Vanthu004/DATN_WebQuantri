import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaMotorcycle, FaIdCard, FaCamera } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { shipperService } from '../../services/shipperService';
import LocationSelector from '../../components/LocationSelector';
import '../../css/shippers/addShipper.css';
import '../../css/common/locationSelector.css';

interface AddShipperForm {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  provinceCode: string;
  provinceName: string;
  districtCode: string;
  districtName: string;
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel: string;
  licensePlate: string;
  idCardNumber: string;
  bankAccount: string;
  bankName: string;
}

const AddShipper: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AddShipperForm>({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    provinceCode: '',
    provinceName: '',
    districtCode: '',
    districtName: '',
    vehicleType: '',
    vehicleBrand: '',
    vehicleModel: '',
    licensePlate: '',
    idCardNumber: '',
    bankAccount: '',
    bankName: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<AddShipperForm>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof AddShipperForm]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProvinceChange = (provinceCode: string, provinceName: string) => {
    setFormData(prev => ({
      ...prev,
      provinceCode,
      provinceName,
      districtCode: '',
      districtName: ''
    }));
    // Clear district errors
    if (errors.districtCode) {
      setErrors(prev => ({ ...prev, districtCode: '' }));
    }
    if (errors.provinceCode) {
      setErrors(prev => ({ ...prev, provinceCode: '' }));
    }
  };

  const handleDistrictChange = (districtCode: string, districtName: string) => {
    setFormData(prev => ({
      ...prev,
      districtCode,
      districtName
    }));
    // Clear district error
    if (errors.districtCode) {
      setErrors(prev => ({ ...prev, districtCode: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AddShipperForm> = {};

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên là bắt buộc';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.fullName.trim())) {
      newErrors.fullName = 'Họ tên chỉ được chứa chữ cái và khoảng trắng';
    }

    // Validate phone number
    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại phải có 10-11 chữ số';
    } else if (!/^(03|05|07|08|09)[0-9]{8}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại không đúng định dạng Việt Nam';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Mật khẩu phải chứa chữ hoa, chữ thường và số';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    // Validate address
    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Địa chỉ phải có ít nhất 10 ký tự';
    }

    // Validate location
    if (!formData.provinceCode) {
      newErrors.provinceCode = 'Vui lòng chọn tỉnh/thành phố';
    }
    if (!formData.districtCode) {
      newErrors.districtCode = 'Vui lòng chọn quận/huyện';
    }

    // Validate vehicle information
    if (!formData.vehicleType) {
      newErrors.vehicleType = 'Loại phương tiện là bắt buộc';
    }

    if (!formData.vehicleBrand.trim()) {
      newErrors.vehicleBrand = 'Hãng xe là bắt buộc';
    } else if (formData.vehicleBrand.trim().length < 2) {
      newErrors.vehicleBrand = 'Hãng xe phải có ít nhất 2 ký tự';
    }

    if (!formData.vehicleModel.trim()) {
      newErrors.vehicleModel = 'Dòng xe là bắt buộc';
    } else if (formData.vehicleModel.trim().length < 2) {
      newErrors.vehicleModel = 'Dòng xe phải có ít nhất 2 ký tự';
    }

    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'Biển số xe là bắt buộc';
    } else if (!/^[0-9]{2}[A-Z][0-9]{4,5}$/.test(formData.licensePlate.trim())) {
      newErrors.licensePlate = 'Biển số xe không đúng định dạng (VD: 30A12345)';
    }

    // Validate ID card
    if (!formData.idCardNumber.trim()) {
      newErrors.idCardNumber = 'Số CMND/CCCD là bắt buộc';
    } else if (!/^[0-9]{9,12}$/.test(formData.idCardNumber.trim())) {
      newErrors.idCardNumber = 'Số CMND/CCCD phải có 9-12 chữ số';
    }

    // Validate bank information
    if (!formData.bankAccount.trim()) {
      newErrors.bankAccount = 'Số tài khoản ngân hàng là bắt buộc';
    } else if (!/^[0-9]{10,16}$/.test(formData.bankAccount.trim())) {
      newErrors.bankAccount = 'Số tài khoản phải có 10-16 chữ số';
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Tên ngân hàng là bắt buộc';
    } else if (formData.bankName.trim().length < 3) {
      newErrors.bankName = 'Tên ngân hàng phải có ít nhất 3 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    try {
      setLoading(true);
      
             const shipperData = {
         user: {
           fullName: formData.fullName.trim(),
           phone: formData.phone.trim(),
           email: formData.email.trim(),
           password: formData.password
         },
         address: formData.address.trim(),
         city: formData.provinceName,
         district: formData.districtName,
         vehicleInfo: {
           type: formData.vehicleType,
           brand: formData.vehicleBrand.trim(),
           model: formData.vehicleModel.trim(),
           licensePlate: formData.licensePlate.trim()
         },
         idCardNumber: formData.idCardNumber.trim(),
         bankAccount: formData.bankAccount.trim(),
         bankName: formData.bankName.trim()
       };

      await shipperService.createShiper(shipperData);
      
      toast.success('Thêm shipper thành công!');
      navigate('/shippers/list');
    } catch (error: any) {
      console.error('Error creating shipper:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm shipper');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-shipper-page">
      <div className="page-header">
        <h1>Thêm Shipper mới</h1>
        <p>Điền thông tin để tạo tài khoản shipper mới</p>
      </div>

      <form onSubmit={handleSubmit} className="add-shipper-form">
        {/* Thông tin cá nhân */}
        <div className="form-section">
          <h3><FaUser /> Thông tin cá nhân</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName">Họ và tên *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Nhập họ và tên đầy đủ"
                className={errors.fullName ? 'error' : ''}
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Số điện thoại *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại"
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ email"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="idCardNumber">Số CMND/CCCD *</label>
              <input
                type="text"
                id="idCardNumber"
                name="idCardNumber"
                value={formData.idCardNumber}
                onChange={handleInputChange}
                placeholder="Nhập số CMND/CCCD"
                className={errors.idCardNumber ? 'error' : ''}
              />
              {errors.idCardNumber && <span className="error-message">{errors.idCardNumber}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Mật khẩu *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Nhập lại mật khẩu"
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>
        </div>

                 {/* Địa chỉ */}
         <div className="form-section">
           <h3><FaMapMarkerAlt /> Địa chỉ</h3>
           <div className="form-group full-width">
             <label htmlFor="address">Địa chỉ chi tiết *</label>
             <input
               type="text"
               id="address"
               name="address"
               value={formData.address}
               onChange={handleInputChange}
               placeholder="Nhập địa chỉ chi tiết (số nhà, đường, phường/xã)"
               className={errors.address ? 'error' : ''}
             />
             {errors.address && <span className="error-message">{errors.address}</span>}
           </div>

           <LocationSelector
             selectedProvince={formData.provinceCode}
             selectedDistrict={formData.districtCode}
             onProvinceChange={handleProvinceChange}
             onDistrictChange={handleDistrictChange}
             error={errors.provinceCode || errors.districtCode}
             disabled={loading}
           />
         </div>

        {/* Thông tin phương tiện */}
        <div className="form-section">
          <h3><FaMotorcycle /> Thông tin phương tiện</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vehicleType">Loại phương tiện *</label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                className={errors.vehicleType ? 'error' : ''}
              >
                <option value="">Chọn loại phương tiện</option>
                <option value="motorcycle">Xe máy</option>
                <option value="bicycle">Xe đạp</option>
                <option value="car">Ô tô</option>
                <option value="truck">Xe tải</option>
              </select>
              {errors.vehicleType && <span className="error-message">{errors.vehicleType}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="vehicleBrand">Hãng xe *</label>
              <input
                type="text"
                id="vehicleBrand"
                name="vehicleBrand"
                value={formData.vehicleBrand}
                onChange={handleInputChange}
                placeholder="Nhập hãng xe"
                className={errors.vehicleBrand ? 'error' : ''}
              />
              {errors.vehicleBrand && <span className="error-message">{errors.vehicleBrand}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vehicleModel">Dòng xe *</label>
              <input
                type="text"
                id="vehicleModel"
                name="vehicleModel"
                value={formData.vehicleModel}
                onChange={handleInputChange}
                placeholder="Nhập dòng xe"
                className={errors.vehicleModel ? 'error' : ''}
              />
              {errors.vehicleModel && <span className="error-message">{errors.vehicleModel}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="licensePlate">Biển số xe *</label>
              <input
                type="text"
                id="licensePlate"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleInputChange}
                placeholder="Nhập biển số xe"
                className={errors.licensePlate ? 'error' : ''}
              />
              {errors.licensePlate && <span className="error-message">{errors.licensePlate}</span>}
            </div>
          </div>
        </div>

        {/* Thông tin ngân hàng */}
        <div className="form-section">
          <h3><FaIdCard /> Thông tin ngân hàng</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bankName">Tên ngân hàng *</label>
              <input
                type="text"
                id="bankName"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                placeholder="Nhập tên ngân hàng"
                className={errors.bankName ? 'error' : ''}
              />
              {errors.bankName && <span className="error-message">{errors.bankName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="bankAccount">Số tài khoản *</label>
              <input
                type="text"
                id="bankAccount"
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleInputChange}
                placeholder="Nhập số tài khoản ngân hàng"
                className={errors.bankAccount ? 'error' : ''}
              />
              {errors.bankAccount && <span className="error-message">{errors.bankAccount}</span>}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/shippers/list')}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Đang tạo...' : 'Tạo Shipper'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddShipper;
