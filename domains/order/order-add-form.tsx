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
import { tipLabel } from "../tip/tip.constants";

const initialTipOptions = [
  { value: "", label: "Add Later" },
  { value: "0", label: tipLabel[0] },
  { value: "1", label: tipLabel[1] },
  { value: "2", label: tipLabel[2] },
  { value: "3", label: tipLabel[3] },
  { value: "4", label: tipLabel[4] },
];

export const OrderAddForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof orderAddFormSchema>>({
    resolver: zodResolver(orderAddFormSchema),
    defaultValues: {
      address: "",
      latitude: 91,
      longitude: 181,
      orderId: "",
      tip: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof orderAddFormSchema>) => {
    setIsSubmitting(true);

    await addOrder({
      location: {
        address: values.address,
        latitude: values.latitude ?? 0,
        longitude: values.longitude ?? 0,
      },
      externalId: values.orderId,
      tip: values.tip ? parseInt(values.tip) : null,
    });

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

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
          name="tip"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Tip Amount</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {initialTipOptions.map((option) => {
                    const selected = (field.value ?? "") === option.value;

                    return (
                      <button
                        key={option.value || "later"}
                        type="button"
                        onClick={() => field.onChange(option.value)}
                        aria-pressed={selected}
                        className={`flex w-full items-center justify-between rounded-md border px-3 py-3 text-left text-sm font-semibold transition ${
                          selected
                            ? "border-emerald-600/45 bg-emerald-50 text-emerald-900"
                            : "border-zinc-200 bg-zinc-50 text-zinc-900 hover:border-zinc-300 hover:bg-white"
                        }`}
                      >
                        <span>{option.label}</span>
                        <span
                          className={`h-4 w-4 rounded-full border ${
                            selected
                              ? "border-emerald-700 bg-emerald-700 shadow-[inset_0_0_0_3px_white]"
                              : "border-zinc-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <p className="text-xs leading-5 text-zinc-500">
                Choose one now, or leave it for later and update the order after delivery.
              </p>
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
