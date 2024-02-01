import { OrderAddForm } from "@/domains/order/order-add-form";

export default function Submit() {
  return (
    <div className="w-full space-y-8 bg-zinc-50 rounded-md p-4 py-8">
      <h2 className="text-4xl drop-shadow-sm font-bold text-center text-zinc-800">
        Add Order
      </h2>
      <OrderAddForm />
    </div>
  );
}
