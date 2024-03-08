import { getOrdersWithLocation } from "@/domains/order/order-actions";
import { OrderCard } from "@/domains/order/order-card";
import { OrderSearch } from "@/domains/order/order-search";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function SearchPage() {
  const { orders } = await getOrdersWithLocation();
  const { userId } = auth();

  if (!userId) redirect("/");

  return (
    <div className="flex flex-col space-y-8 bg-zinc-800/75 rounded-md p-4 pt-8 pb-10 border-2 border-zinc-950/25 drop-shadow-md">
      <h2 className="text-4xl drop-shadow-sm font-bold text-center">Orders</h2>

      <OrderSearch orders={orders} />

      <OrderCard />
    </div>
  );
}
