import { Card, CardHeader, CardTitle, CardContent } from "@/components/card";
import { Combobox } from "@/components/combobox";
import { getLocations } from "@/domains/location/location-actions";
import { OrdersList } from "@/domains/order/order-list";
import { getOrdersAverageTip } from "@/domains/order/order.utils";

export default async function Search() {
  const { locations } = await getLocations();

  const locationOptions = locations?.map((location) => ({
    value: `${location.address} - ${location.orders.join("|")}`.toLowerCase(),
    label: location.address,
  }));

  const location = locations?.[0];

  return (
    <div className="w-full space-y-10">
      <h2 className="text-4xl drop-shadow-sm font-bold text-center">
        Locations
      </h2>
      <Combobox options={locationOptions ?? []} />
      {!locations && (
        <div>
          <p>No locations found.</p>
        </div>
      )}
      {location && (
        <Card key={location.id}>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">
              Average Tip: {getOrdersAverageTip(location.orders)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h4 className="underline mb-2 text-lg">Previous Tips</h4>
            <OrdersList orders={location.orders} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
