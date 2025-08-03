import { useEffect, useRef, useCallback } from 'react';
import { useOrderNotify } from '../contexts/OrderNotifyContext';

interface Order {
  _id: string;
  order_code: string;
  total_price: number;
  user_id?: { name?: string; email?: string };
  createdAt?: string;
  status?: string;
}

export const useOrderNotification = () => {
  const {
    setNewOrderCount,
    setLatestOrder,
    setShowToast,
    lastCheckedOrderId,
    setLastCheckedOrderId,
    resetOrderChecking
  } = useOrderNotify();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkForNewOrders = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3000/api/orders");
      if (!res.ok) {
        console.error('Failed to fetch orders:', res.status);
        return;
      }
      
      const data = await res.json();
      
      if (Array.isArray(data) && data.length > 0) {
        // Sắp xếp theo thời gian tạo mới nhất
        const sortedOrders = data.sort((a: Order, b: Order) => 
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
        
        const newest = sortedOrders[0];
        
        // Kiểm tra nếu có đơn hàng mới
        if (newest && lastCheckedOrderId && newest._id !== lastCheckedOrderId) {
          console.log('New order detected:', newest.order_code);
          setLatestOrder(newest);
          setShowToast(true);
          
          // Tự động ẩn toast sau 8 giây
          setTimeout(() => {
            setShowToast(false);
          }, 8000);
        }
        
        // Cập nhật ID đơn hàng cuối cùng đã kiểm tra
        if (newest) {
          setLastCheckedOrderId(newest._id);
        }

        // Đếm số đơn hàng chờ xử lý
        const pendingOrders = data.filter((order: Order) => order.status === "Chờ xử lý");
        setNewOrderCount(pendingOrders.length);
      }
    } catch (error) {
      console.error('Error checking for new orders:', error);
    }
  }, [lastCheckedOrderId, setLatestOrder, setShowToast, setLastCheckedOrderId, setNewOrderCount]);

  const startOrderChecking = useCallback(() => {
    // Chạy ngay lập tức
    checkForNewOrders();
    
    // Thiết lập interval để kiểm tra mỗi 5 giây
    intervalRef.current = setInterval(checkForNewOrders, 5000);
  }, [checkForNewOrders]);

  const stopOrderChecking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startOrderChecking();

    return () => {
      stopOrderChecking();
    };
  }, [startOrderChecking, stopOrderChecking]);

  return {
    checkForNewOrders,
    startOrderChecking,
    stopOrderChecking,
    resetOrderChecking
  };
}; 