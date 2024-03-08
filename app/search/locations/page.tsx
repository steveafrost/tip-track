import { getLocations } from "@/domains/location/location-actions";
import { LocationCard } from "@/domains/location/location-card";
import { LocationSearch } from "@/domains/location/location-search";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function SearchPage() {
  const { locations } = await getLocations();
  const { userId } = auth();

  if (!userId) redirect("/");

  return (
    <div className="flex flex-col space-y-8 bg-zinc-800/75 rounded-md p-4 pt-8 pb-10 border-2 border-zinc-950/25 drop-shadow-md">
      <h2 className="text-4xl drop-shadow-sm font-bold text-center">
        Locations
      </h2>

      <LocationSearch locations={locations} />

      <LocationCard />
    </div>
  );
}
