import { Prisma } from "@prisma/client";

export type LocationsWithOrders = Prisma.LocationGetPayload<{
  include: {
    orders: true;
  };
}>;
