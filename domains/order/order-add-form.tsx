"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../../components/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../../components/form";
import { Input } from "../../components/input";
import { useState } from "react";
import { LucideLoader } from "lucide-react";
import { addOrder } from "./order-actions";
import { orderAddFormSchema } from "./order.constants";
import { toast } from "sonner";
import { OrderAddressSearch } from "./order-address-search";

export const OrderAddForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof orderAddFormSchema>>({
    resolver: zodResolver(orderAddFormSchema),
    defaultValues: {
      location: {
        address: "",
        latitude: 0,
        longitude: 0,
      },
      orderId: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof orderAddFormSchema>) => {
    setIsSubmitting(true);

    await addOrder({
      location: values.location,
      externalId: values.orderId,
    });

    toast.success("Order added");
    form.reset();

    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Address</FormLabel>
              <FormControl>
                <OrderAddressSearch {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="orderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Order ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter an order ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full text-xl font-bold"
          disabled={isSubmitting}
          size="lg"
        >
          {!isSubmitting && <span>Submit</span>}
          {isSubmitting && <LucideLoader className="animate-spin" size={20} />}
        </Button>
      </form>
    </Form>
  );
};
