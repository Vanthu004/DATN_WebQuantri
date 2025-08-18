# LocationSelector Component

Component để chọn tỉnh/thành phố và quận/huyện của Việt Nam với tìm kiếm và validation.

## Tính năng

- ✅ Chọn tỉnh/thành phố từ danh sách có sẵn
- ✅ Chọn quận/huyện theo tỉnh/thành phố đã chọn
- ✅ Tìm kiếm tỉnh/thành phố và quận/huyện
- ✅ Validation và hiển thị lỗi
- ✅ Responsive design
- ✅ Hỗ trợ keyboard navigation
- ✅ Auto-close khi click outside

## Sử dụng

```tsx
import LocationSelector from '../components/LocationSelector';

const MyComponent = () => {
  const [provinceCode, setProvinceCode] = useState('');
  const [districtCode, setDistrictCode] = useState('');

  const handleProvinceChange = (code: string, name: string) => {
    setProvinceCode(code);
    // Reset district when province changes
    setDistrictCode('');
  };

  const handleDistrictChange = (code: string, name: string) => {
    setDistrictCode(code);
  };

  return (
    <LocationSelector
      selectedProvince={provinceCode}
      selectedDistrict={districtCode}
      onProvinceChange={handleProvinceChange}
      onDistrictChange={handleDistrictChange}
      error="Vui lòng chọn địa chỉ"
      disabled={false}
    />
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `selectedProvince` | `string` | ✅ | Mã tỉnh/thành phố đã chọn |
| `selectedDistrict` | `string` | ✅ | Mã quận/huyện đã chọn |
| `onProvinceChange` | `(code: string, name: string) => void` | ✅ | Callback khi chọn tỉnh/thành phố |
| `onDistrictChange` | `(code: string, name: string) => void` | ✅ | Callback khi chọn quận/huyện |
| `error` | `string` | ❌ | Thông báo lỗi validation |
| `disabled` | `boolean` | ❌ | Vô hiệu hóa component |

## Dữ liệu

Component sử dụng dữ liệu từ `../data/vietnamDistricts.ts` bao gồm:

- **63 tỉnh/thành phố** của Việt Nam
- **Quận/huyện** tương ứng với mỗi tỉnh
- **Loại đơn vị hành chính** (quận, huyện, thành phố, thị xã)

## Styling

Component sử dụng CSS từ `../css/common/locationSelector.css` với:

- Thiết kế modern và responsive
- Animation smooth
- Custom scrollbar
- Hover effects
- Error states

## Validation

- Tỉnh/thành phố là bắt buộc
- Quận/huyện chỉ có thể chọn sau khi đã chọn tỉnh/thành phố
- Hiển thị lỗi validation rõ ràng

## Accessibility

- Hỗ trợ keyboard navigation
- ARIA labels
- Focus management
- Screen reader friendly
