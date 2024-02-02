import { PieChart, PieChartData } from "@/components/pie-chart";
import { getOrders } from "@/domains/order/order-actions";
import { tipLabels } from "@/domains/tip/tip.constants";

export default async function ReportsPage() {
  const { orders } = await getOrders();

  const data = orders?.reduce((acc, order) => {
    const label = tipLabels[order.tip?.toString() ?? "0"];
    const existingGroup = acc.find((current) => current.name === label);

    if (!existingGroup) {
      return [...acc, { name: label, value: 1 }];
    }

    return [
      ...acc.filter((current) => current.name !== label),
      { name: label, value: existingGroup.value + 1 },
    ];
  }, [] as PieChartData);

  return (
    <div className="w-full space-y-8 bg-zinc-50 rounded-md p-4 py-8 border-2 border-slate-700 drop-shadow-md">
      <h2 className="text-4xl drop-shadow-sm font-bold text-center text-zinc-800">
        Reports
      </h2>
      {!data && (
        <p className="text-center text-2xl text-zinc-800">No data to display</p>
      )}
      {data && <PieChart data={data} />}
    </div>
  );
}
