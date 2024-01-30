import { SubmitForm } from "@/domains/orders/add-order-form";

export default function Submit() {
  return (
    <div className="w-full space-y-16">
      <h2 className="text-4xl drop-shadow-md shadow-purple-500 font-bold text-center">
        Add Order
      </h2>
      <SubmitForm />
    </div>
  );
}
