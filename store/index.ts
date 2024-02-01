import { create } from "zustand";
import { LocationsWithOrders } from "@/domains/location/location.types";

type Store = {
  location: LocationsWithOrders;
  setLocation: (value: LocationsWithOrders) => void;
};

export const useStore = create<Store>()((set) => ({
  location: {} as LocationsWithOrders,
  setLocation: (value) => set(() => ({ location: value })),
}));
