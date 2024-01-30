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
import { orderEditFormSchema } from "./orders.constants";

export function SubmitForm() {
  const [isSubmitting, startTransition] = useTransition();
  const form = useForm<z.infer<typeof orderEditFormSchema>>({
    resolver: zodResolver(orderEditFormSchema),
    defaultValues: {
      address: "",
      orderId: "",
    },
  });

  function onSubmit(values: z.infer<typeof orderEditFormSchema>) {
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
          className="w-full font-bold"
          disabled={isSubmitting}
        >
          {!isSubmitting && <span>Submit</span>}
          {isSubmitting && <LucideLoader className="animate-spin" size={20} />}
        </Button>
      </form>
    </Form>
  );
}

{
  /* <FormField
          control={form.control}
          name="tip"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-xl">Tip Amount</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={"1"} />
                    </FormControl>
                    <FormLabel className="font-normal">None</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={"2"} />
                    </FormControl>
                    <FormLabel className="font-normal">Less than $5</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={"3"} />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Between $5 and $10
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={"4"} />
                    </FormControl>
                    <FormLabel className="font-normal">More than $10</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */
}
