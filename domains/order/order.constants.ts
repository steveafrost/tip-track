import { z } from "zod";

export const orderUpdateFormSchema = z.object({
  tip: z.string(),
});

export const orderAddFormSchema = z.object({
  address: z.string().min(2, { message: "Please choose location from list" }),
  latitude: z.number().refine((value) => value >= -90 && value <= 90, {
    message: "Latitude must be between -90 and 90 degrees",
  }),

  longitude: z.number().refine((value) => value >= -180 && value <= 180, {
    message: "Longitude must be between -180 and 180 degrees",
  }),
  orderId: z
    .string()
    .min(2, { message: "Order ID must contain at least 2 characters" }),
});

export type LocationLookup = {
  address: string;
  latitude: number;
  longitude: number;
};
