import * as z from "zod";

export const tipAmount = {
  none: "none",
  low: "low",
  medium: "medium",
  high: "high",
} as const;

export const formSchema = z.object({
  address: z.string().min(2).max(50),
  tipAmount: z.nativeEnum(tipAmount),
});
