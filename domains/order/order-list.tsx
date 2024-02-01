import { format } from "date-fns";
import { OrderUpdateForm } from "./order-update-form";
import { Order } from "@prisma/client";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/sheet";
import { tipLabels } from "../tip/tip.constants";

type OrdersListProps = {
  orders: Order[];
};

export const OrdersList = ({ orders }: OrdersListProps) => {
  return (
    <ul className="pl-2">
      {orders.map((order) => (
        <Sheet key={order.id}>
          <SheetTrigger asChild>
            <li key={order.id} className="space-x-2">
              <span>
                {order.tip
                  ? tipLabels[order.tip.toString()]
                  : "No Tip Recorded"}
              </span>
              <span className="text-sm text-zinc-400">
                ({format(order.createdAt, "MM-dd-yy")})
              </span>
            </li>
          </SheetTrigger>
          <SheetContent side={"bottom"}>
            <SheetHeader>
              <SheetTitle>Tip for Order #{order.externalId}</SheetTitle>
              <SheetDescription>
                <OrderUpdateForm
                  externalId={order.externalId}
                  existingTip={order.tip}
                />
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </ul>
  );
};
