import { getLocations } from "@/domains/location/location-actions";
import { LocationCard } from "@/domains/location/location-card";
import { LocationSearch } from "@/domains/location/location-search";

export default async function Search() {
  const { locations } = await getLocations();

  return (
    <div className="w-full space-y-8 bg-zinc-50 rounded-md p-4 py-8 border-2 border-slate-700 drop-shadow-md">
      <h2 className="text-4xl drop-shadow-sm font-bold text-center text-zinc-800">
        Locations
      </h2>
      <LocationSearch locations={locations} />
      {!locations && (
        <div>
          <p>No locations found.</p>
        </div>
      )}
      {locations && <LocationCard />}
    </div>
  );
}
