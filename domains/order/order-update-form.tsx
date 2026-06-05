"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/form";
import { useTransition } from "react";
import { CheckCircle2, LucideLoader } from "lucide-react";
import { updateOrder } from "./order-actions";
import { LocationLookup, orderUpdateFormSchema } from "./order.constants";
import { tipLabel } from "../tip/tip.constants";
import { Location } from "@prisma/client";
import { OrderAddressSearch } from "./order-address-search";
import { Input } from "@/components/input";

const tipChoices = [
  { value: "0", label: tipLabel[0] },
  { value: "1", label: tipLabel[1] },
  { value: "2", label: tipLabel[2] },
  { value: "3", label: tipLabel[3] },
  { value: "4", label: tipLabel[4] },
];

type OrderUpdateFormProps = {
  externalId: string;
  existingTip: number | null;
  existingLocation: Location;
  onUpdate?: (
    values: z.infer<typeof orderUpdateFormSchema>,
    externalId: string
  ) => void;
  shouldAllowEditingLocation: boolean;
};

export const OrderUpdateForm = ({
  externalId,
  existingLocation,
  existingTip,
  onUpdate,
  shouldAllowEditingLocation,
}: OrderUpdateFormProps) => {
  const [isSubmitting, startTransition] = useTransition();
  const form = useForm<z.infer<typeof orderUpdateFormSchema>>({
    resolver: zodResolver(orderUpdateFormSchema),
    defaultValues: {
      address: existingLocation ? existingLocation.address : "",
      tip: existingTip === null ? "" : existingTip.toString(),
    },
  });

  function onSubmit(values: z.infer<typeof orderUpdateFormSchema>) {
    startTransition(() => {
      updateOrder({
        externalId,
        location: {
          address: values.address,
          latitude: values.latitude ?? 0,
          longitude: values.longitude ?? 0,
        },
        tip: parseInt(values.tip),
      });
    });

    onUpdate?.(values, externalId);
  }

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {shouldAllowEditingLocation && (
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="text-left">
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
        )}
        <FormField
          control={form.control}
          name="tip"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="sr-only">Tip Amount</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {tipChoices.map((choice) => {
                    const selected = field.value === choice.value;

                    return (
                      <button
                        key={choice.value}
                        type="button"
                        onClick={() => field.onChange(choice.value)}
                        aria-pressed={selected}
                        className={`flex w-full items-center justify-between rounded-md border px-3 py-3 text-left text-sm font-semibold transition ${
                          selected
                            ? "border-emerald-600/45 bg-emerald-50 text-emerald-900"
                            : "border-zinc-200 bg-zinc-50 text-zinc-900 hover:border-zinc-300 hover:bg-white"
                        }`}
                      >
                        <span>{choice.label}</span>
                        <CheckCircle2
                          className={`h-5 w-5 ${
                            selected ? "text-emerald-700" : "text-zinc-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
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
          className="w-full text-lg font-bold"
          disabled={isSubmitting}
          size="lg"
        >
          {!isSubmitting && <span>Update</span>}
          {isSubmitting && <LucideLoader className="animate-spin" size={20} />}
        </Button>
      </form>
    </Form>
  );
};
