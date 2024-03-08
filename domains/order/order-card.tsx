"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/card";
import { useStore } from "@/store";

export const OrderCard = () => {
  const { order } = useStore();

  if (Object.keys(order).length === 0) {
    return (
      <p className="font-semibold px-2">
        Search for a order to display the location and tip associated with that
        order.
      </p>
    );
  }

  return (
    <Card key={order.id}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex justify-between"></CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <h4 className="mb-2">Location</h4>
        <span>{order.locationId}</span>
      </CardContent>
    </Card>
  );
};
