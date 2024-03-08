import { z } from "zod";

const orderLocationSchema = {
  address: z.string().min(2, { message: "Please choose location from list" }),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
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
