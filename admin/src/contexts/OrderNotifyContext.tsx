import { createContext, useContext, useState, ReactNode } from "react";

interface Order {
  _id: string;
  order_code: string;
  total_price: number;
  user_id?: { name?: string; email?: string };
  createdAt?: string;
  status?: string;
}

type OrderNotifyContextType = {
  newOrderCount: number;
  setNewOrderCount: (count: number) => void;
  latestOrder: Order | null;
  setLatestOrder: (order: Order | null) => void;
  showToast: boolean;
  setShowToast: (show: boolean) => void;
  lastCheckedOrderId: string | null;
  setLastCheckedOrderId: (id: string | null) => void;
  resetOrderChecking: () => void;
};

const OrderNotifyContext = createContext<OrderNotifyContextType | undefined>(undefined);

export const OrderNotifyProvider = ({ children }: { children: ReactNode }) => {
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [lastCheckedOrderId, setLastCheckedOrderId] = useState<string | null>(null);

  const resetOrderChecking = () => {
    setLastCheckedOrderId(null);
    setShowToast(false);
    setLatestOrder(null);
  };

  return (
    <OrderNotifyContext.Provider value={{ 
      newOrderCount, 
      setNewOrderCount, 
      latestOrder, 
      setLatestOrder,
      showToast,
      setShowToast,
      lastCheckedOrderId,
      setLastCheckedOrderId,
      resetOrderChecking
    }}>
      {children}
    </OrderNotifyContext.Provider>
  );
};

export const useOrderNotify = () => {
  const ctx = useContext(OrderNotifyContext);
  if (!ctx) throw new Error("useOrderNotify must be used within OrderNotifyProvider");
  return ctx;
};