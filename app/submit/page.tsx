import { OrderAddForm } from "@/domains/order/order-add-form";

export default function SubmitPage() {
  return (
    <div className="w-full space-y-8 bg-zinc-800/75 rounded-md p-4 py-8 border-2 border-zinc-950/25 drop-shadow-md">
      <h2 className="text-4xl drop-shadow-sm font-bold text-center text-zinc-200">
        Add Order
      </h2>
      <OrderAddForm />
    </div>
  );
}
