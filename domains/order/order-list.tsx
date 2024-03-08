"use client";

import { format } from "date-fns";
import { OrderUpdateForm } from "./order-update-form";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/sheet";
import { tipLabel } from "../tip/tip.constants";
import { useState } from "react";
import { Order } from "@prisma/client";
import { LucidePencil } from "lucide-react";
import { z } from "zod";
import { orderUpdateFormSchema } from "./order.constants";
import { useStore } from "@/store";

type OrdersListProps = {
  orders: Order[];
};

export const OrdersList = ({ orders }: OrdersListProps) => {
  const { location, setLocation } = useStore();
  const [activeOrder, setActiveOrder] = useState("");

  const handleOrderUpdate = (
    values: z.infer<typeof orderUpdateFormSchema>,
    externalId: string
  ) => {
    const updatedOrder = location.orders.find(
      (order) => order.externalId === externalId
    );

    if (!updatedOrder) {
      setActiveOrder("");

      return;
    }

    setLocation({
      ...location,
      orders: [
        ...location.orders.filter((order) => order.externalId !== externalId),
        { ...updatedOrder, tip: parseInt(values.tip) },
      ],
    });
    setActiveOrder("");
  };

  return (
    <ul className="pl-6 list-disc">
      {orders.map((order) => (
        <Sheet
          key={order.id}
          open={order.id === activeOrder}
          onOpenChange={(open) =>
            open ? setActiveOrder(order.id) : setActiveOrder("")
          }
        >
          <SheetTrigger asChild>
            <li key={order.id} className="list-item">
              <button className="flex space-x-2 items-center">
                <span>
                  {order.tip
                    ? tipLabel[order.tip.toString()]
                    : "No Tip Recorded"}
                </span>
                <span className="text-sm text-zinc-400">
                  ({format(order.createdAt, "MM-dd-yy")})
                </span>
                <LucidePencil className="text-zinc-400 w-4" />
              </button>
            </li>
          </SheetTrigger>
          <SheetContent side={"bottom"}>
            <SheetHeader>
              <SheetTitle>Tip for Order #{order.externalId}</SheetTitle>
              <SheetDescription asChild>
                <OrderUpdateForm
                  externalId={order.externalId}
                  existingTip={order.tip}
                  existingLocation={location}
                  onUpdate={handleOrderUpdate}
                  shouldAllowEditingLocation={false}
                />
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </ul>
  );
};
