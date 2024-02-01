import { OrderAddForm } from "@/domains/order/order-add-form";

export default function Submit() {
  return (
    <div className="w-full space-y-16">
      <h2 className="text-4xl drop-shadow-sm font-bold text-center">
        Add Order
      </h2>
      <OrderAddForm />
    </div>
  );
}
