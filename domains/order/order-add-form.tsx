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
import { LocationLookup, orderAddFormSchema } from "./order.constants";
import { toast } from "sonner";
import { OrderAddressSearch } from "./order-address-search";

export const OrderAddForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof orderAddFormSchema>>({
    resolver: zodResolver(orderAddFormSchema),
    defaultValues: {
      address: "",
      latitude: 91,
      longitude: 181,

      orderId: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof orderAddFormSchema>) => {
    setIsSubmitting(true);

    await addOrder({
      location: {
        address: values.address,
        latitude: values.latitude,
        longitude: values.longitude,
      },
      externalId: values.orderId,
    });

    toast.success("Order added");
    form.reset();

    setIsSubmitting(false);
  };

  const handleAddressSelect = ({
    address,
    latitude,
    longitude,
  }: LocationLookup) => {
    form.setValue("address", address);
    form.setValue("latitude", latitude);
    form.setValue("longitude", longitude);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Address</FormLabel>
              <FormControl>
                <OrderAddressSearch
                  onChange={handleAddressSelect}
                  value={field.value}
                />
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
        <FormField
          control={form.control}
          name="latitude"
          render={({ field }) => (
            <FormItem hidden>
              <FormLabel className="text-base">Latitude</FormLabel>
              <FormControl>
                <Input placeholder="hidden" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="longitude"
          render={({ field }) => (
            <FormItem hidden>
              <FormLabel className="text-base">Longitude</FormLabel>
              <FormControl>
                <Input placeholder="hidden" {...field} />
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
