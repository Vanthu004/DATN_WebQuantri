# Shipper Management System - Web Admin Panel

## Overview
The Shipper Management System is a comprehensive web admin panel that allows administrators to manage, monitor, and support shipper operations for the e-commerce platform. This system integrates with the Node.js Shipper API to provide real-time management capabilities.

## Features

### 1. Shipper Management Dashboard (`/shippers`)
- **Overview Statistics**: Display key metrics including total shippers, active shippers, completed orders, success rates, and COD amounts
- **Quick Access Cards**: Navigate to different management functions
- **Quick Actions**: Fast access to common tasks like adding shippers, assigning orders, and viewing reports

### 2. Shipper List Management (`/shippers/list`)
- **Comprehensive List**: View all shippers with detailed information
- **Advanced Filtering**: Filter by status, verification status, working status, city, and district
- **Search Functionality**: Search shippers by name, email, or phone number
- **Status Management**: Update shipper status (active, inactive, suspended)
- **Verification System**: Approve or reject shipper verification requests
- **Performance Metrics**: View individual shipper performance data
- **Actions**: View details, edit information, and manage status

### 3. Order Assignment (`/shippers/orders`)
- **Order Queue**: View orders waiting to be assigned to shippers
- **Smart Filtering**: Filter orders by city, district, payment method, and value
- **Shipper Selection**: Choose from available shippers for order assignment
- **Assignment Modal**: Detailed order information and shipper selection interface
- **Real-time Updates**: Immediate feedback on order assignments

### 4. Statistics & Analytics (`/shippers/statistics`)
- **Performance Metrics**: Comprehensive statistics on shipper performance
- **Date Range Selection**: Customizable time periods for analysis
- **COD Payment Tracking**: Monitor cash collection and submission status
- **Performance Rankings**: Leaderboard-style performance comparison
- **Export Functionality**: Download reports in Excel or PDF format
- **Chart Placeholders**: Ready for integration with charting libraries

## Technical Implementation

### Frontend Architecture
- **React + TypeScript**: Modern, type-safe development
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox
- **Component-based**: Modular, reusable components
- **State Management**: React hooks for local state management

### API Integration
- **Service Layer**: Centralized API communication through service modules
- **Error Handling**: Comprehensive error handling and user feedback
- **Real-time Updates**: Integration with WebSocket for live data updates

### Styling
- **Modern CSS**: CSS Grid, Flexbox, and custom properties
- **Responsive Design**: Mobile-responsive layouts
- **Visual Hierarchy**: Clear information architecture and visual feedback
- **Accessibility**: ARIA labels and semantic HTML

## File Structure

```
admin/src/
├── pages/shippers/
│   ├── ShipperManagementPage.tsx      # Main dashboard
│   ├── ShipperListPage.tsx            # Shipper list and management
│   ├── OrderAssignmentPage.tsx        # Order assignment interface
│   └── ShipperStatisticsPage.tsx      # Analytics and reporting
├── services/
│   └── shipperService.ts              # API service layer
├── interfaces/
│   └── shipper.ts                     # TypeScript interfaces
├── css/shippers/
│   ├── shipperManagement.css          # Dashboard styling
│   ├── shipperList.css                # List page styling
│   ├── orderAssignment.css            # Assignment page styling
│   └── shipperStatistics.css          # Statistics page styling
└── components/layouts/
    └── LayoutAdmin.tsx                # Updated navigation
```

## API Endpoints Used

### Shipper Management
- `GET /api/admin/shipers` - Get all shippers with filtering
- `GET /api/admin/shipers/:id` - Get shipper details
- `PUT /api/admin/shipers/:id/status` - Update shipper status
- `PUT /api/admin/shipers/:id/verify` - Verify shipper documents
- `GET /api/admin/shipers/active` - Get active shippers

### Order Management
- `GET /api/admin/shipers/orders/to-assign` - Get orders to assign
- `POST /api/admin/shipers/orders/assign` - Assign order to shipper
- `DELETE /api/admin/shipers/orders/:id/assign` - Unassign order

### Statistics & Reporting
- `GET /api/admin/shipers/statistics` - Get overall statistics
- `GET /api/admin/shipers/performance` - Get performance data
- `GET /api/admin/shipers/export` - Export reports

## Usage Guide

### Adding New Shippers
1. Navigate to `/shippers/list`
2. Click "Thêm Shipper mới" button
3. Fill in required information
4. Submit for verification

### Assigning Orders
1. Go to `/shippers/orders`
2. Filter orders by location or payment method
3. Click "Gán Shipper" on desired order
4. Select appropriate shipper from dropdown
5. Confirm assignment

### Monitoring Performance
1. Visit `/shippers/statistics`
2. Select date range for analysis
3. View performance metrics and rankings
4. Export data as needed

### Managing Shipper Status
1. Navigate to `/shippers/list`
2. Use status filters to find specific shippers
3. Click action buttons to update status
4. Verify documents and approve/reject as needed

## Future Enhancements

### Planned Features
- **Real-time Tracking**: Live map integration for shipper locations
- **Advanced Analytics**: Interactive charts and data visualization
- **Automated Assignment**: AI-powered order assignment algorithms
- **Communication Tools**: In-app chat and notification system
- **Mobile App**: Dedicated mobile admin interface

### Integration Opportunities
- **Google Maps API**: Enhanced location services
- **Chart.js/D3.js**: Advanced data visualization
- **Socket.io**: Real-time communication
- **Push Notifications**: Instant alerts and updates

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations
- **Lazy Loading**: Components load on demand
- **Pagination**: Efficient data handling for large datasets
- **Optimized Images**: Responsive image handling
- **CSS Optimization**: Minimal CSS footprint

## Security Features
- **Authentication Required**: All routes protected
- **Role-based Access**: Admin-only functionality
- **Input Validation**: Client and server-side validation
- **Secure API Calls**: HTTPS and proper authentication headers

## Support and Maintenance
- **Error Logging**: Comprehensive error tracking
- **User Feedback**: Toast notifications and loading states
- **Responsive Design**: Works on all device sizes
- **Accessibility**: WCAG 2.1 AA compliance

---

For technical support or feature requests, please contact the development team.
