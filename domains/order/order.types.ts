import { Prisma } from "@prisma/client";

export type OrdersWithLocation = Prisma.OrderGetPayload<{
  include: {
    location: true;
  };
}>;
