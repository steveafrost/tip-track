"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/card";
import { useStore } from "@/store";
import { tipLabel } from "../tip/tip.constants";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/sheet";
import { OrderUpdateForm } from "./order-update-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { OrdersWithLocation } from "./order.types";
import { z } from "zod";
import { orderUpdateFormSchema } from "./order.constants";

export const OrderCard = () => {
  const { order, setOrder } = useStore();
  const [activeOrder, setActiveOrder] = useState("");

  useEffect(() => {
    return () => {
      setOrder({} as OrdersWithLocation);
    };
  }, [setOrder]);

  const handleOrderUpdate = (values: z.infer<typeof orderUpdateFormSchema>) => {
    setOrder({
      ...order,
      location: {
        ...order.location,
        address: values.address,
        coordinates: [values.latitude ?? 0, values.longitude ?? 0],
      },
      tip: parseInt(values.tip),
    });
    setActiveOrder("");
  };

  if (Object.keys(order).length === 0) {
    return (
      <p className="font-semibold px-2">
        Search for an order to display the location and tip associated with that
        order.
      </p>
    );
  }

  return (
    <Card key={order.id}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex justify-between">
          Order #{order.externalId}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 space-y-8 flex flex-col">
        <div className="flex flex-col space-y-2">
          <span>Location: {order.location.address}</span>
          <span>
            Tip:{" "}
            {order.tip ? tipLabel[order.tip.toString()] : "No Tip Recorded"}
          </span>
        </div>
        <Sheet
          open={order.locationId === activeOrder}
          onOpenChange={(open) =>
            open ? setActiveOrder(order.locationId) : setActiveOrder("")
          }
        >
          <SheetTrigger asChild>
            <Button type="button">Edit Order</Button>
          </SheetTrigger>
          <SheetContent side={"bottom"}>
            <SheetHeader>
              <SheetTitle>Edit Order #{order.externalId}</SheetTitle>
              <SheetDescription asChild>
                <OrderUpdateForm
                  externalId={order.externalId}
                  existingTip={order.tip}
                  existingLocation={order.location}
                  onUpdate={handleOrderUpdate}
                  shouldAllowEditingLocation={true}
                />
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
};
