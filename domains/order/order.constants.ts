import { z } from "zod";

export const orderUpdateFormSchema = z.object({
  tip: z.string(),
});

export const orderAddFormSchema = z.object({
  address: z
    .string()
    .min(2, { message: "Address must contain at least 2 characters" }),
  orderId: z
    .string()
    .min(2, { message: "Order ID must contain at least 2 characters" }),
});
