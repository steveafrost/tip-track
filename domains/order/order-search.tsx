"use client";

import { Combobox } from "@/components/combobox";
import { useStore } from "@/store";
import { Option } from "@/types/all.types";
import { OrdersWithLocation } from "./order.types";

type OrderSearchProps = {
  orders?: OrdersWithLocation[];
};

export const OrderSearch = ({ orders = [] }: OrderSearchProps) => {
  const { setOrder } = useStore();

  const options = orders.map((order) => ({
    id: order.id,
    value: order.externalId,
    label: order.externalId,
  })) as Option[];

  const handleOnSelect = (selectedOrder: Option) => {
    const matchingOrder = orders.find((order) => order.id === selectedOrder.id);

    if (!matchingOrder) return;

    setOrder(matchingOrder);
  };

  return <Combobox options={options.slice(0, 5)} onSelect={handleOnSelect} />;
};
