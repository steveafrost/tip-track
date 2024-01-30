import { Card, CardHeader, CardTitle, CardContent } from "@/components/card";
import { Combobox } from "@/components/combobox";
import { getLocations } from "@/domains/location/location-actions";
import { format } from "date-fns";

export default async function Search() {
  const { locations } = await getLocations();

  return (
    <div className="w-full">
      <h2 className="text-xl">Search Previous Locations</h2>
      <Combobox
        options={[
          {
            value: "next.js",
            label: "Next.js",
          },
          {
            value: "sveltekit",
            label: "SvelteKit",
          },
          {
            value: "nuxt.js",
            label: "Nuxt.js",
          },
          {
            value: "remix",
            label: "Remix",
          },
          {
            value: "astro",
            label: "Astro",
          },
        ]}
      />
      {!locations && (
        <div>
          <p>No locations found.</p>
        </div>
      )}
      {locations &&
        locations.map((location) => (
          <Card key={location.id}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">{location.address}</CardTitle>
            </CardHeader>
            <CardContent>
              <h4 className="underline mb-2">Previous Tips</h4>
              <ul className="pl-2 list-inside">
                {location.orders.map((order) => (
                  <li key={order.id} className="space-x-2">
                    <span className="text-sm">{order.tip}</span>
                    <span className="text-xs text-zinc-400">
                      ({format(order.createdAt, "MMMM dd, yyyy")})
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
