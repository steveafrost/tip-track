import { Order } from "@prisma/client";
import { tipEmoji } from "../tip/tip.constants";

export const getOrdersAverageTip = (orders: Order[]) => {
  if (!orders) return "0";

  const totalTips = orders.reduce((acc, order) => acc + (order.tip ?? 0), 0);
  const averageTip = Math.ceil(totalTips / orders.length);

  return tipEmoji[averageTip.toString()];
};
