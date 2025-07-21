import { createContext, useContext, useState, ReactNode } from "react";

type OrderNotifyContextType = {
  newOrderCount: number;
  setNewOrderCount: (count: number) => void;
};

const OrderNotifyContext = createContext<OrderNotifyContextType | undefined>(undefined);

export const OrderNotifyProvider = ({ children }: { children: ReactNode }) => {
  const [newOrderCount, setNewOrderCount] = useState(0);
  return (
    <OrderNotifyContext.Provider value={{ newOrderCount, setNewOrderCount }}>
      {children}
    </OrderNotifyContext.Provider>
  );
};

export const useOrderNotify = () => {
  const ctx = useContext(OrderNotifyContext);
  if (!ctx) throw new Error("useOrderNotify must be used within OrderNotifyProvider");
  return ctx;
};