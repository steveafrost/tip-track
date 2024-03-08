import { z } from "zod";

const orderLocationSchema = {
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
};

export const orderUpdateFormSchema = z.object({
  ...orderLocationSchema,
  tip: z.string(),
});

export const orderAddFormSchema = z.object({
  ...orderLocationSchema,
  orderId: z
    .string()
    .min(2, { message: "Order ID must contain at least 2 characters" }),
});

export type LocationLookup = {
  address: string;
  latitude: number;
  longitude: number;
};
