import { Card, CardHeader, CardTitle, CardContent } from "@/components/card";
import { getLocations } from "@/domains/location/location-actions";
import { format } from "date-fns";

export default async function Locations() {
  const { locations } = await getLocations();

  console.log(locations);

  const locationOptions = locations?.map((location) => ({
    value: `${location.address} - ${location.orders
      .map((order) => order.externalId)
      .join(", ")}`,
    label: location.address,
  }));

  return (
    <div className="w-full space-y-16">
      <h2 className="text-4xl drop-shadow-sm font-bold text-center">
        All Locations
      </h2>
      {!locations && (
        <div>
          <p>No locations found.</p>
        </div>
      )}
      {locations &&
        locations.map((location) => (
          <Card key={location.id}>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">{location.address}</CardTitle>
            </CardHeader>
            <CardContent>
              <h4 className="underline mb-2 text-lg">Previous Tips</h4>
              <ul className="pl-2 list-inside">
                {location.orders.map((order) => (
                  <li key={order.id} className="space-x-2">
                    <span>{order.tip ? order.tip : "No Tip Recorded"}</span>
                    <span className="text-sm text-zinc-400">
                      ({format(order.createdAt, "MM-dd-yy")})
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
