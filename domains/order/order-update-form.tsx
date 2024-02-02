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
import { LucideLoader } from "lucide-react";
import { updateOrder } from "./order-actions";
import { orderUpdateFormSchema } from "./order.constants";
import { RadioGroup, RadioGroupItem } from "@/components/radio-group";
import { tipLabel } from "../tip/tip.constants";

type OrderUpdateFormProps = {
  externalId: string;
  existingTip: number | null;
  onUpdate?: () => void;
};

export const OrderUpdateForm = ({
  externalId,
  existingTip,
  onUpdate,
}: OrderUpdateFormProps) => {
  const [isSubmitting, startTransition] = useTransition();
  const form = useForm<z.infer<typeof orderUpdateFormSchema>>({
    resolver: zodResolver(orderUpdateFormSchema),
    defaultValues: {
      tip: existingTip ? existingTip.toString() : "",
    },
  });

  function onSubmit(values: z.infer<typeof orderUpdateFormSchema>) {
    startTransition(() => {
      updateOrder({
        externalId,
        tip: parseInt(values.tip),
      });
    });

    onUpdate?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="tip"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="sr-only">Tip Amount</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={"0"} />
                    </FormControl>
                    <FormLabel className="font-normal text-base ml-2">
                      {tipLabel[0]}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={"1"} />
                    </FormControl>
                    <FormLabel className="font-normal ml-2 text-base">
                      {tipLabel[1]}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={"2"} />
                    </FormControl>
                    <FormLabel className="font-normal ml-2 text-base">
                      {tipLabel[2]}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={"3"} />
                    </FormControl>
                    <FormLabel className="font-normal ml-2 text-base">
                      {tipLabel[3]}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={"4"} />
                    </FormControl>
                    <FormLabel className="font-normal ml-2 text-base">
                      {tipLabel[4]}
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
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
