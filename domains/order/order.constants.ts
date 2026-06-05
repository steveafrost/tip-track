import { z } from "zod";

const orderLocationSchema = {
  address: z.string().min(2, { message: "Please choose location from list" }),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
};

export const orderUpdateFormSchema = z.object({
  ...orderLocationSchema,
  tip: z.string().min(1, { message: "Choose a tip amount" }),
});

export const orderAddFormSchema = z.object({
  ...orderLocationSchema,
  orderId: z
    .string()
    .min(2, { message: "Order ID must contain at least 2 characters" }),
  tip: z.string().optional(),
});

export type LocationLookup = {
  address: string;
  latitude: number;
  longitude: number;
};
