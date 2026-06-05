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
    <ul className="space-y-2">
      {orders.map((order) => (
        <li key={order.id}>
          <Sheet
            open={order.id === activeOrder}
            onOpenChange={(open) =>
              open ? setActiveOrder(order.id) : setActiveOrder("")
            }
          >
            <SheetTrigger asChild>
              <button className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-3 text-left transition hover:bg-zinc-50 active:bg-zinc-100">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-zinc-900">
                    {order.tip === null
                      ? "No Tip Recorded"
                      : tipLabel[order.tip.toString()]}
                  </span>
                  <span className="block text-sm text-zinc-400">
                    {format(order.createdAt, "MM-dd-yy")}
                  </span>
                </span>
                <LucidePencil className="h-4 w-4 shrink-0 text-zinc-400" />
              </button>
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
        </li>
      ))}
    </ul>
  );
};
