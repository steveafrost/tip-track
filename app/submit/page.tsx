import { OrderAddForm } from "@/domains/order/order-add-form";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Script from "next/script";

export default function SubmitPage() {
  const { userId } = auth();

  if (!userId) redirect("/");

  return (
    <div className="w-full space-y-8 bg-zinc-800/75 rounded-md p-4 py-8 border-2 border-zinc-950/25 drop-shadow-md">
      <h2 className="text-4xl drop-shadow-sm font-bold text-center text-zinc-200">
        Add Order
      </h2>
      <OrderAddForm />
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_KEY}&libraries=places`}
        strategy="lazyOnload"
      />
    </div>
  );
}
