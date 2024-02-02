import { Card, CardContent, CardHeader } from "@/components/card";
import { PieChart, PieChartData } from "@/components/pie-chart";
import { getOrders } from "@/domains/order/order-actions";
import { tipLabel } from "@/domains/tip/tip.constants";

export default async function ReportsPage() {
  const { orders } = await getOrders();

  const data = orders?.reduce((acc, order) => {
    const label = tipLabel[order.tip?.toString() ?? "0"];
    const existingGroup = acc.find((current) => current.name === label);

    if (!existingGroup) {
      return [...acc, { name: label, value: 1, sortOrder: order.tip ?? 0 }];
    }

    return [
      ...acc.filter((current) => current.name !== label),
      { ...existingGroup, value: existingGroup.value + 1 },
    ];
  }, [] as PieChartData);

  const sortedData = data?.sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="w-full space-y-8 bg-zinc-800/75 rounded-md p-4 py-8 border-2 border-zinc-950/25 drop-shadow-md">
      <h2 className="text-4xl drop-shadow-sm font-bold text-center ">
        Reports
      </h2>
      {!sortedData && (
        <p className="text-center text-2xl text-zinc-800">No data to display</p>
      )}
      {sortedData && (
        <>
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Tips by Type</h3>
            </CardHeader>
            <CardContent>
              <PieChart data={sortedData} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
