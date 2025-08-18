import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaChevronDown, FaMapMarkerAlt } from 'react-icons/fa';
import { getProvinces, getDistrictsByProvince, searchProvinces, searchDistricts, Province, District } from '../data/vietnamDistricts';

interface LocationSelectorProps {
  selectedProvince: string;
  selectedDistrict: string;
  onProvinceChange: (provinceCode: string, provinceName: string) => void;
  onDistrictChange: (districtCode: string, districtName: string) => void;
  error?: string;
  disabled?: boolean;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedProvince,
  selectedDistrict,
  onProvinceChange,
  onDistrictChange,
  error,
  disabled = false
}) => {
  const [provinces, setProvinces] = useState<{ code: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [filteredProvinces, setFilteredProvinces] = useState<{ code: string; name: string }[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
  
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [provinceSearchTerm, setProvinceSearchTerm] = useState('');
  const [districtSearchTerm, setDistrictSearchTerm] = useState('');
  
  const [selectedProvinceName, setSelectedProvinceName] = useState('');
  const [selectedDistrictName, setSelectedDistrictName] = useState('');
  
  const provinceDropdownRef = useRef<HTMLDivElement>(null);
  const districtDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const allProvinces = getProvinces();
    setProvinces(allProvinces);
    setFilteredProvinces(allProvinces);
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      const province = provinces.find(p => p.code === selectedProvince);
      if (province) {
        setSelectedProvinceName(province.name);
        const provinceDistricts = getDistrictsByProvince(selectedProvince);
        setDistricts(provinceDistricts);
        setFilteredDistricts(provinceDistricts);
        
        // Reset district if it's not in the new province
        if (selectedDistrict && !provinceDistricts.find(d => d.code === selectedDistrict)) {
          onDistrictChange('', '');
          setSelectedDistrictName('');
        }
      }
    } else {
      setDistricts([]);
      setFilteredDistricts([]);
      setSelectedProvinceName('');
      setSelectedDistrictName('');
    }
  }, [selectedProvince, provinces]);

  useEffect(() => {
    if (selectedDistrict) {
      const district = districts.find(d => d.code === selectedDistrict);
      if (district) {
        setSelectedDistrictName(district.name);
      }
    } else {
      setSelectedDistrictName('');
    }
  }, [selectedDistrict, districts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (provinceDropdownRef.current && !provinceDropdownRef.current.contains(event.target as Node)) {
        setShowProvinceDropdown(false);
      }
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(event.target as Node)) {
        setShowDistrictDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProvinceSearch = (searchTerm: string) => {
    setProvinceSearchTerm(searchTerm);
    if (searchTerm.trim()) {
      const filtered = searchProvinces(searchTerm);
      setFilteredProvinces(filtered);
    } else {
      setFilteredProvinces(provinces);
    }
  };

  const handleDistrictSearch = (searchTerm: string) => {
    setDistrictSearchTerm(searchTerm);
    if (searchTerm.trim()) {
      const filtered = searchDistricts(searchTerm, selectedProvince);
      setFilteredDistricts(filtered);
    } else {
      setFilteredDistricts(districts);
    }
  };

  const handleProvinceSelect = (provinceCode: string, provinceName: string) => {
    onProvinceChange(provinceCode, provinceName);
    setSelectedProvinceName(provinceName);
    setProvinceSearchTerm('');
    setShowProvinceDropdown(false);
    setFilteredProvinces(provinces);
  };

  const handleDistrictSelect = (districtCode: string, districtName: string) => {
    onDistrictChange(districtCode, districtName);
    setSelectedDistrictName(districtName);
    setDistrictSearchTerm('');
    setShowDistrictDropdown(false);
    setFilteredDistricts(districts);
  };

  const getDistrictTypeLabel = (type: string) => {
    switch (type) {
      case 'quan': return 'Quận';
      case 'huyen': return 'Huyện';
      case 'thanh_pho': return 'Thành phố';
      case 'thi_xa': return 'Thị xã';
      default: return '';
    }
  };

  return (
    <div className="location-selector">
      {/* Province Selector */}
      <div className="location-field" ref={provinceDropdownRef}>
        <label htmlFor="province">Tỉnh/Thành phố *</label>
        <div className="location-input-wrapper">
          <div className="location-input">
            <FaMapMarkerAlt className="location-icon" />
            <input
              type="text"
              id="province"
              placeholder="Chọn tỉnh/thành phố"
              value={provinceSearchTerm || selectedProvinceName}
              onChange={(e) => handleProvinceSearch(e.target.value)}
              onFocus={() => setShowProvinceDropdown(true)}
              disabled={disabled}
              className={error ? 'error' : ''}
            />
            <FaChevronDown 
              className={`dropdown-arrow ${showProvinceDropdown ? 'rotated' : ''}`}
              onClick={() => setShowProvinceDropdown(!showProvinceDropdown)}
            />
          </div>
          
          {showProvinceDropdown && (
            <div className="location-dropdown">
              <div className="dropdown-search">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tỉnh/thành phố..."
                  value={provinceSearchTerm}
                  onChange={(e) => handleProvinceSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="dropdown-list">
                {filteredProvinces.length > 0 ? (
                  filteredProvinces.map((province) => (
                    <div
                      key={province.code}
                      className={`dropdown-item ${selectedProvince === province.code ? 'selected' : ''}`}
                      onClick={() => handleProvinceSelect(province.code, province.name)}
                    >
                      {province.name}
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item no-results">
                    Không tìm thấy tỉnh/thành phố
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* District Selector */}
      <div className="location-field" ref={districtDropdownRef}>
        <label htmlFor="district">Quận/Huyện *</label>
        <div className="location-input-wrapper">
          <div className="location-input">
            <FaMapMarkerAlt className="location-icon" />
            <input
              type="text"
              id="district"
              placeholder={selectedProvince ? "Chọn quận/huyện" : "Vui lòng chọn tỉnh/thành phố trước"}
              value={districtSearchTerm || selectedDistrictName}
              onChange={(e) => handleDistrictSearch(e.target.value)}
              onFocus={() => selectedProvince && setShowDistrictDropdown(true)}
              disabled={disabled || !selectedProvince}
              className={error ? 'error' : ''}
            />
            <FaChevronDown 
              className={`dropdown-arrow ${showDistrictDropdown ? 'rotated' : ''}`}
              onClick={() => selectedProvince && setShowDistrictDropdown(!showDistrictDropdown)}
            />
          </div>
          
          {showDistrictDropdown && selectedProvince && (
            <div className="location-dropdown">
              <div className="dropdown-search">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Tìm kiếm quận/huyện..."
                  value={districtSearchTerm}
                  onChange={(e) => handleDistrictSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="dropdown-list">
                {filteredDistricts.length > 0 ? (
                  filteredDistricts.map((district) => (
                    <div
                      key={district.code}
                      className={`dropdown-item ${selectedDistrict === district.code ? 'selected' : ''}`}
                      onClick={() => handleDistrictSelect(district.code, district.name)}
                    >
                      <span className="district-name">{district.name}</span>
                      <span className="district-type">{getDistrictTypeLabel(district.type)}</span>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item no-results">
                    Không tìm thấy quận/huyện
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default LocationSelector;
