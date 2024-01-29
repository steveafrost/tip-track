import * as z from "zod";

export const formSchema = z.object({
  externalId: z
    .string()
    .min(2, { message: "External ID must contain at least 2 characters" }),
  address: z
    .string()
    .min(2, { message: "Address must contain at least 2 characters" }),
  tip: z.string(),
});
