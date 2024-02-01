"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/card";
import { OrdersList } from "../order/order-list";
import { getOrdersAverageTip } from "../order/order.utils";
import { useStore } from "@/store";

export const LocationCard = () => {
  const { location } = useStore();

  if (Object.keys(location).length === 0) return null;

  return (
    <Card key={location.id}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">
          Average Tip: {getOrdersAverageTip(location.orders)}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <h4 className="mb-2">Previous Tips</h4>
        <OrdersList orders={location.orders} />
      </CardContent>
    </Card>
  );
};
