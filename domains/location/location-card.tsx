"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/card";
import { OrdersList } from "../order/order-list";
import { getOrdersAverageTip } from "../order/order.utils";
import { useStore } from "@/store";
import { tipEmoji, tipLabel } from "../tip/tip.constants";

export const LocationCard = () => {
  const { location } = useStore();

  if (Object.keys(location).length === 0) {
    return (
      <p className="font-semibold px-2">
        Search for a location to display all orders and tips associated with
        that address.
      </p>
    );
  }

  const averageTip = getOrdersAverageTip(location.orders);

  return (
    <Card key={location.id}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex justify-between">
          <span>Average: {tipLabel[averageTip.toString()]}</span>
          <span>{tipEmoji[averageTip.toString()]}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <h4 className="mb-2">Previous Tips</h4>
        <OrdersList orders={location.orders} location={location} />
      </CardContent>
    </Card>
  );
};
