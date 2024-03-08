"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/card";
import { useStore } from "@/store";
import { tipEmoji } from "../tip/tip.constants";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/sheet";
import { OrderUpdateForm } from "./order-update-form";
import { useState } from "react";
import { Button } from "@/components/button";

export const OrderCard = () => {
  const { order } = useStore();
  const [activeOrder, setActiveOrder] = useState("");
  const [activeLocation, setActiveLocation] = useState("");

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
            {order.tip ? tipEmoji[order.tip.toString()] : "No Tip Recorded"}
          </span>
        </div>
        <Sheet
          open={order.locationId === activeLocation}
          onOpenChange={(open) =>
            open ? setActiveLocation(order.locationId) : setActiveLocation("")
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
                  onUpdate={() => setActiveLocation("")}
                />
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
};
