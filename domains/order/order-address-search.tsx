import { Input } from "@/components/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@radix-ui/react-popover";
import { ChangeEvent } from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { LocationLookup } from "./order.constants";

type OrderAddressSearchProps = {
  onChange: (value: LocationLookup) => void;
};

export const OrderAddressSearch = ({ onChange }: OrderAddressSearchProps) => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {},
    debounce: 300,
  });

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleSelect =
    ({ description }: { description: string }) =>
    async () => {
      setValue(description, false);
      clearSuggestions();

      const results = await getGeocode({ address: description });
      const { lat, lng } = getLatLng(results[0]);

      onChange({
        address: description,
        latitude: lat,
        longitude: lng,
      });
    };

  const renderSuggestions = () =>
    data.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion;

      return (
        <li
          key={place_id}
          onClick={handleSelect(suggestion)}
          className="flex flex-col"
        >
          <span className="font-semibold">{main_text}</span>
          <span className="text-sm">{secondary_text}</span>
        </li>
      );
    });

  return (
    <Popover open={data.length > 0}>
      <PopoverAnchor asChild>
        <Input
          value={value}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              clearSuggestions();
            }
          }}
          onChange={handleInput}
          disabled={!ready}
          autoComplete="off"
          name="address"
          placeholder="Enter an address"
        />
      </PopoverAnchor>

      <PopoverContent
        className="w-[calc(100vw-68px)] bg-zinc-800 p-4"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <ul className="flex flex-col space-y-2">{renderSuggestions()}</ul>
      </PopoverContent>
    </Popover>
  );
};
