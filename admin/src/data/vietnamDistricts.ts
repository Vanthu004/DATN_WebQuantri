export interface District {
  code: string;
  name: string;
  type: 'quan' | 'huyen' | 'thanh_pho' | 'thi_xa';
}

export interface Province {
  code: string;
  name: string;
  districts: District[];
}

export const vietnamProvinces: Province[] = [
  {
    code: '01',
    name: 'Hà Nội',
    districts: [
      { code: '001', name: 'Ba Đình', type: 'quan' },
      { code: '002', name: 'Hoàn Kiếm', type: 'quan' },
      { code: '003', name: 'Tây Hồ', type: 'quan' },
      { code: '004', name: 'Long Biên', type: 'quan' },
      { code: '005', name: 'Cầu Giấy', type: 'quan' },
      { code: '006', name: 'Đống Đa', type: 'quan' },
      { code: '007', name: 'Hai Bà Trưng', type: 'quan' },
      { code: '008', name: 'Hoàng Mai', type: 'quan' },
      { code: '009', name: 'Thanh Xuân', type: 'quan' },
      { code: '016', name: 'Sóc Sơn', type: 'huyen' },
      { code: '017', name: 'Đông Anh', type: 'huyen' },
      { code: '018', name: 'Gia Lâm', type: 'huyen' },
      { code: '019', name: 'Từ Liêm', type: 'huyen' },
      { code: '020', name: 'Thanh Trì', type: 'huyen' },
      { code: '021', name: 'Mê Linh', type: 'huyen' },
      { code: '250', name: 'Hà Đông', type: 'quan' },
      { code: '268', name: 'Sơn Tây', type: 'thi_xa' },
      { code: '269', name: 'Ba Vì', type: 'huyen' },
      { code: '271', name: 'Phúc Thọ', type: 'huyen' },
      { code: '272', name: 'Đan Phượng', type: 'huyen' },
      { code: '273', name: 'Hoài Đức', type: 'huyen' },
      { code: '274', name: 'Quốc Oai', type: 'huyen' },
      { code: '275', name: 'Thạch Thất', type: 'huyen' },
      { code: '276', name: 'Chương Mỹ', type: 'huyen' },
      { code: '277', name: 'Thanh Oai', type: 'huyen' },
      { code: '278', name: 'Thường Tín', type: 'huyen' },
      { code: '279', name: 'Phú Xuyên', type: 'huyen' },
      { code: '280', name: 'Ứng Hòa', type: 'huyen' },
      { code: '281', name: 'Mỹ Đức', type: 'huyen' }
    ]
  },
  {
    code: '79',
    name: 'TP. Hồ Chí Minh',
    districts: [
      { code: '760', name: 'Quận 1', type: 'quan' },
      { code: '761', name: 'Quận 2', type: 'quan' },
      { code: '762', name: 'Quận 3', type: 'quan' },
      { code: '763', name: 'Quận 4', type: 'quan' },
      { code: '764', name: 'Quận 5', type: 'quan' },
      { code: '765', name: 'Quận 6', type: 'quan' },
      { code: '766', name: 'Quận 7', type: 'quan' },
      { code: '767', name: 'Quận 8', type: 'quan' },
      { code: '768', name: 'Quận 9', type: 'quan' },
      { code: '769', name: 'Quận 10', type: 'quan' },
      { code: '770', name: 'Quận 11', type: 'quan' },
      { code: '771', name: 'Quận 12', type: 'quan' },
      { code: '772', name: 'Tân Bình', type: 'quan' },
      { code: '773', name: 'Bình Tân', type: 'quan' },
      { code: '774', name: 'Tân Phú', type: 'quan' },
      { code: '775', name: 'Phú Nhuận', type: 'quan' },
      { code: '776', name: 'Gò Vấp', type: 'quan' },
      { code: '777', name: 'Bình Thạnh', type: 'quan' },
      { code: '778', name: 'Thủ Đức', type: 'quan' },
      { code: '783', name: 'Củ Chi', type: 'huyen' },
      { code: '784', name: 'Hóc Môn', type: 'huyen' },
      { code: '785', name: 'Bình Chánh', type: 'huyen' },
      { code: '786', name: 'Nhà Bè', type: 'huyen' },
      { code: '787', name: 'Cần Giờ', type: 'huyen' }
    ]
  },
  {
    code: '48',
    name: 'Đà Nẵng',
    districts: [
      { code: '490', name: 'Hải Châu', type: 'quan' },
      { code: '491', name: 'Thanh Khê', type: 'quan' },
      { code: '492', name: 'Sơn Trà', type: 'quan' },
      { code: '493', name: 'Ngũ Hành Sơn', type: 'quan' },
      { code: '494', name: 'Liên Chiểu', type: 'quan' },
      { code: '495', name: 'Cẩm Lệ', type: 'quan' },
      { code: '497', name: 'Hòa Vang', type: 'huyen' },
      { code: '498', name: 'Hoàng Sa', type: 'huyen' }
    ]
  },
  {
    code: '95',
    name: 'Bạc Liêu',
    districts: [
      { code: '954', name: 'Thành phố Bạc Liêu', type: 'thanh_pho' },
      { code: '956', name: 'Hồng Dân', type: 'huyen' },
      { code: '957', name: 'Phước Long', type: 'huyen' },
      { code: '958', name: 'Vĩnh Lợi', type: 'huyen' },
      { code: '959', name: 'Giá Rai', type: 'huyen' },
      { code: '960', name: 'Đông Hải', type: 'huyen' },
      { code: '961', name: 'Hoà Bình', type: 'huyen' }
    ]
  },
  {
    code: '27',
    name: 'Bắc Ninh',
    districts: [
      { code: '256', name: 'Thành phố Bắc Ninh', type: 'thanh_pho' },
      { code: '258', name: 'Yên Phong', type: 'huyen' },
      { code: '259', name: 'Quế Võ', type: 'huyen' },
      { code: '260', name: 'Tiên Du', type: 'huyen' },
      { code: '261', name: 'Từ Sơn', type: 'thi_xa' },
      { code: '262', name: 'Thuận Thành', type: 'huyen' },
      { code: '263', name: 'Gia Bình', type: 'huyen' },
      { code: '264', name: 'Lương Tài', type: 'huyen' }
    ]
  },
  {
    code: '74',
    name: 'Bình Dương',
    districts: [
      { code: '718', name: 'Thành phố Thủ Dầu Một', type: 'thanh_pho' },
      { code: '719', name: 'Huyện Bàu Bàng', type: 'huyen' },
      { code: '720', name: 'Huyện Dầu Tiếng', type: 'huyen' },
      { code: '721', name: 'Thị xã Bến Cát', type: 'thi_xa' },
      { code: '722', name: 'Huyện Phú Giáo', type: 'huyen' },
      { code: '723', name: 'Thị xã Tân Uyên', type: 'thi_xa' },
      { code: '724', name: 'Thành phố Dĩ An', type: 'thanh_pho' },
      { code: '725', name: 'Thành phố Thuận An', type: 'thanh_pho' },
      { code: '726', name: 'Huyện Bắc Tân Uyên', type: 'huyen' }
    ]
  },
  {
    code: '60',
    name: 'Bình Thuận',
    districts: [
      { code: '593', name: 'Thành phố Phan Thiết', type: 'thanh_pho' },
      { code: '594', name: 'Thị xã La Gi', type: 'thi_xa' },
      { code: '595', name: 'Huyện Tuy Phong', type: 'huyen' },
      { code: '596', name: 'Huyện Bắc Bình', type: 'huyen' },
      { code: '597', name: 'Huyện Hàm Thuận Bắc', type: 'huyen' },
      { code: '598', name: 'Huyện Hàm Thuận Nam', type: 'huyen' },
      { code: '599', name: 'Huyện Tánh Linh', type: 'huyen' },
      { code: '600', name: 'Huyện Đức Linh', type: 'huyen' },
      { code: '601', name: 'Huyện Hàm Tân', type: 'huyen' },
      { code: '602', name: 'Huyện Phú Quý', type: 'huyen' }
    ]
  },
  {
    code: '96',
    name: 'Cà Mau',
    districts: [
      { code: '964', name: 'Thành phố Cà Mau', type: 'thanh_pho' },
      { code: '966', name: 'U Minh', type: 'huyen' },
      { code: '967', name: 'Thới Bình', type: 'huyen' },
      { code: '968', name: 'Trần Văn Thời', type: 'huyen' },
      { code: '969', name: 'Cái Nước', type: 'huyen' },
      { code: '970', name: 'Đầm Dơi', type: 'huyen' },
      { code: '971', name: 'Năm Căn', type: 'huyen' },
      { code: '972', name: 'Phú Tân', type: 'huyen' },
      { code: '973', name: 'Ngọc Hiển', type: 'huyen' }
    ]
  },
  {
    code: '92',
    name: 'Cần Thơ',
    districts: [
      { code: '918', name: 'Quận Ninh Kiều', type: 'quan' },
      { code: '919', name: 'Quận Ô Môn', type: 'quan' },
      { code: '923', name: 'Quận Bình Thuỷ', type: 'quan' },
      { code: '924', name: 'Quận Cái Răng', type: 'quan' },
      { code: '925', name: 'Quận Thốt Nốt', type: 'quan' },
      { code: '926', name: 'Huyện Vĩnh Thạnh', type: 'huyen' },
      { code: '927', name: 'Huyện Cờ Đỏ', type: 'huyen' },
      { code: '928', name: 'Huyện Phong Điền', type: 'huyen' },
      { code: '929', name: 'Huyện Thới Lai', type: 'huyen' }
    ]
  }
];

// Hàm lấy danh sách tỉnh/thành phố
export const getProvinces = () => {
  return vietnamProvinces.map(province => ({
    code: province.code,
    name: province.name
  }));
};

// Hàm lấy danh sách quận/huyện theo tỉnh/thành phố
export const getDistrictsByProvince = (provinceCode: string) => {
  const province = vietnamProvinces.find(p => p.code === provinceCode);
  return province ? province.districts : [];
};

// Hàm tìm kiếm tỉnh/thành phố theo tên
export const searchProvinces = (searchTerm: string) => {
  const term = searchTerm.toLowerCase();
  return vietnamProvinces
    .filter(province => 
      province.name.toLowerCase().includes(term) ||
      province.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(term)
    )
    .map(province => ({
      code: province.code,
      name: province.name
    }));
};

// Hàm tìm kiếm quận/huyện theo tên
export const searchDistricts = (searchTerm: string, provinceCode?: string) => {
  const term = searchTerm.toLowerCase();
  let districts: District[] = [];
  
  if (provinceCode) {
    districts = getDistrictsByProvince(provinceCode);
  } else {
    districts = vietnamProvinces.flatMap(province => province.districts);
  }
  
  return districts
    .filter(district => 
      district.name.toLowerCase().includes(term) ||
      district.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(term)
    );
};
