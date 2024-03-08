import { create } from "zustand";
import { LocationsWithOrders } from "@/domains/location/location.types";
import { OrdersWithLocation } from "@/domains/order/order.types";

type Store = {
  location: LocationsWithOrders;
  order: OrdersWithLocation;
  setLocation: (value: LocationsWithOrders) => void;
  setOrder: (value: OrdersWithLocation) => void;
};

export const useStore = create<Store>()((set) => ({
  location: {} as LocationsWithOrders,
  order: {} as OrdersWithLocation,
  setLocation: (value) => set(() => ({ location: value })),
  setOrder: (value) => set(() => ({ order: value })),
}));
