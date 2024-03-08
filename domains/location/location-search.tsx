"use client";

import { Combobox } from "@/components/combobox";
import { useStore } from "@/store";
import { LocationsWithOrders } from "./location.types";
import { Option } from "@/types/all.types";

type LocationSearchProps = {
  locations?: LocationsWithOrders[];
};

export const LocationSearch = ({ locations = [] }: LocationSearchProps) => {
  const { setLocation } = useStore();

  const options = locations.map((location) => ({
    id: location.id,
    value: `${location.address} - ${location.orders
      .map((order) => order.externalId)
      .join(" | ")}`.toLowerCase(),
    label: location.address,
  })) as Option[];

  const handleOnSelect = (selectedLocation: Option) => {
    const matchingLocation = locations.find(
      (location) => location.id === selectedLocation.id
    );

    if (!matchingLocation) return;

    setLocation(matchingLocation);
  };

  return (
    <Combobox
      placeholder="Enter address"
      emptyText="No location found"
      options={options.slice(0, 5)}
      onSelect={handleOnSelect}
    />
  );
};
