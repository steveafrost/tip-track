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
import { useTransition } from "react";
import { LucideLoader } from "lucide-react";
import { addOrder } from "./order-actions";
import { orderAddFormSchema } from "./order.constants";

export function OrderAddForm() {
  const [isSubmitting, startTransition] = useTransition();
  const form = useForm<z.infer<typeof orderAddFormSchema>>({
    resolver: zodResolver(orderAddFormSchema),
    defaultValues: {
      address: "",
      orderId: "",
    },
  });

  function onSubmit(values: z.infer<typeof orderAddFormSchema>) {
    startTransition(() => {
      addOrder({
        address: values.address,
        externalId: values.orderId,
      });
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xl">Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter an address" {...field} />
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
              <FormLabel className="text-xl">Order ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter an order ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full text-xl font-bold text-zinc-900"
          disabled={isSubmitting}
          size="lg"
        >
          {!isSubmitting && <span>Submit</span>}
          {isSubmitting && <LucideLoader className="animate-spin" size={20} />}
        </Button>
      </form>
    </Form>
  );
}
