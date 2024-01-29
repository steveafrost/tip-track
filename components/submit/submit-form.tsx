"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "./submit.constants";
import { Button } from "../ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useTransition } from "react";
import { LucideLoader } from "lucide-react";
import { addOrder } from "./submit-actions";

export function SubmitForm() {
  const [isSubmitting, startTransition] = useTransition();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
      externalId: "",
      tip: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(() => {
      addOrder({
        address: values.address,
        externalId: values.externalId,
        tip: values.tip,
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
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter an address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tip"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tip Amount</FormLabel>
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
