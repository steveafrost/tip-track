"use client";

import {
  ClerkLoaded,
  ClerkLoading,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { LogoImage } from "@/components/static-images";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type React from "react";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Edit3,
  HelpCircle,
  Infinity,
  Loader2,
  MapPin,
  PackagePlus,
  Receipt,
  Search,
  ShieldCheck,
  Sparkles,
  Unlock,
  X,
} from "lucide-react";
import Script from "next/script";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";

type TipOrder = {
  id: string;
  externalId: string;
  address: string;
  latitude: number;
  longitude: number;
  tip: number | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

type TipLocation = {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  orders: TipOrder[];
};

type StoreKitEntitlement = {
  isPro: boolean;
  productId: string;
  environment: string | null;
  purchasedAt: string | null;
  revokedAt: string | null;
};

type Tab = "add" | "orders" | "locations" | "reports";

const freeOrderLimit = 20;
const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

type LocationValue = {
  address: string;
  latitude: number;
  longitude: number;
};

const tipOptions = [
  { value: 0, label: "No Tip", short: "No Tip", color: "text-zinc-500 bg-zinc-500/10" },
  { value: 1, label: "Less Than $5", short: "< $5", color: "text-amber-700 bg-amber-500/12" },
  { value: 2, label: "Between $5 and $10", short: "$5-$10", color: "text-blue-700 bg-blue-500/12" },
  { value: 3, label: "More Than $10", short: "> $10", color: "text-emerald-700 bg-emerald-500/12" },
  { value: 4, label: "More Than $20", short: "> $20", color: "text-rose-700 bg-rose-500/12" },
];

const tabs = [
  { id: "add" as const, label: "Add", title: "Add Order", icon: PackagePlus },
  { id: "orders" as const, label: "Orders", title: "Orders", icon: Search },
  { id: "locations" as const, label: "Locations", title: "Locations", icon: Building2 },
  { id: "reports" as const, label: "Reports", title: "Reports", icon: BarChart3 },
];

function tipOption(value: number | null | undefined) {
  return tipOptions.find((option) => option.value === value) ?? tipOptions[0];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function averageTip(orders: TipOrder[]) {
  if (!orders.length) return 0;
  const total = orders.reduce((sum, order) => sum + (order.tip ?? 0), 0);
  return Math.round(total / orders.length);
}

export function WebApp() {
  if (!isClerkConfigured) {
    return (
      <SignInScreen
        isClerkConfigured={false}
        errorMessage={null}
        isLoading={false}
      />
    );
  }

  return <AuthenticatedWebApp />;
}

function AuthenticatedWebApp() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("add");
  const [orders, setOrders] = useState<TipOrder[]>([]);
  const [locations, setLocations] = useState<TipLocation[]>([]);
  const [entitlement, setEntitlement] = useState<StoreKitEntitlement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const selectedTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const isPro = entitlement?.isPro ?? false;
  const displayName =
    user?.fullName ??
    user?.primaryEmailAddress?.emailAddress ??
    user?.username ??
    "TipTrack Driver";

  async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    if (!isSignedIn) throw new Error("Sign in first.");

    const response = await fetch(path, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...init?.headers,
      },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "Something went wrong.");
    }

    return data as T;
  }

  const refreshData = useCallback(async () => {
    if (!isSignedIn) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [ordersResult, locationsResult, entitlementResult] = await Promise.all([
        fetch("/api/web/orders").then((response) => response.json()),
        fetch("/api/web/locations").then((response) => response.json()),
        fetch("/api/web/entitlements").then((response) => response.json()),
      ]);

      if (ordersResult.error) throw new Error(ordersResult.error);
      if (locationsResult.error) throw new Error(locationsResult.error);
      if (entitlementResult.error) throw new Error(entitlementResult.error);

      setOrders(ordersResult.orders ?? []);
      setLocations(locationsResult.locations ?? []);
      setEntitlement(entitlementResult.entitlement ?? null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not load your delivery log.");
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isSignedIn) {
      void refreshData();
    } else {
      setOrders([]);
      setLocations([]);
      setEntitlement(null);
      setActiveTab("add");
    }
  }, [refreshData, isSignedIn]);

  async function handleAddOrder(values: LocationValue & { orderId: string }) {
    await apiFetch<{ order: TipOrder }>("/api/web/orders", {
      method: "POST",
      body: JSON.stringify({
        externalId: values.orderId,
        location: {
          address: values.address,
          latitude: values.latitude,
          longitude: values.longitude,
        },
      }),
    });
    await refreshData();
  }

  async function handleUpdateOrder(order: TipOrder, tip: number, location?: LocationValue) {
    await apiFetch<{ order: TipOrder }>(
      `/api/web/orders/${encodeURIComponent(order.externalId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          tip,
          location: location
            ? {
                address: location.address,
                latitude: location.latitude,
                longitude: location.longitude,
              }
            : undefined,
        }),
      }
    );
    await refreshData();
  }

  if (!isLoaded) {
    return (
      <div className="app-background grid min-h-screen place-items-center px-4 text-zinc-950">
        <LoadingBar />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <SignInScreen
        isClerkConfigured={true}
        errorMessage={errorMessage}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="app-background min-h-screen text-zinc-950">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <IconTile icon={selectedTab.icon} />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold leading-tight">
              {selectedTab.title}
            </h1>
            <p className="truncate text-xs font-medium text-zinc-500">
              {displayName}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaywallOpen(true)}
              className={`grid h-9 w-9 place-items-center rounded-md ${
                isPro
                  ? "bg-emerald-600/10 text-emerald-700"
                  : "bg-zinc-100 text-zinc-800"
              }`}
              aria-label={isPro ? "TipTrack Pro active" : "TipTrack Pro"}
              title="First 20 orders free, then $4.99 once."
            >
              {isPro ? (
                <ShieldCheck className="h-5 w-5" />
              ) : (
                <Unlock className="h-5 w-5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-md bg-zinc-100 text-zinc-800"
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            <div
              className="grid h-9 w-9 place-items-center rounded-md bg-zinc-100 text-zinc-800"
              title="Manage account"
            >
              <UserButton afterSignOutUrl="/app" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-4">
        {errorMessage ? <Banner tone="error">{errorMessage}</Banner> : null}
        {isLoading ? <LoadingBar /> : null}

        {activeTab === "add" ? (
          <AddOrderPanel
            orders={orders}
            isPro={isPro}
            onShowPaywall={() => setPaywallOpen(true)}
            onAddOrder={handleAddOrder}
            onUpdateOrder={handleUpdateOrder}
          />
        ) : null}
        {activeTab === "orders" ? (
          <OrdersPanel orders={orders} onUpdateOrder={handleUpdateOrder} />
        ) : null}
        {activeTab === "locations" ? (
          <LocationsPanel
            locations={locations}
            onUpdateOrder={handleUpdateOrder}
          />
        ) : null}
        {activeTab === "reports" ? <ReportsPanel orders={orders} /> : null}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 pb-safe shadow-[0_-16px_40px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-4 px-3 py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-[0.7rem] font-semibold ${
                activeTab === tab.id
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-zinc-500"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {helpOpen ? <HelpDialog onClose={() => setHelpOpen(false)} /> : null}
      {paywallOpen ? (
        <PaywallDialog isPro={isPro} onClose={() => setPaywallOpen(false)} />
      ) : null}
    </div>
  );
}

function SignInScreen({
  isClerkConfigured,
  errorMessage,
  isLoading,
}: {
  isClerkConfigured: boolean;
  errorMessage: string | null;
  isLoading: boolean;
}) {
  return (
    <div className="app-background min-h-screen overflow-x-hidden px-4 py-10 text-zinc-950">
      <div
        className="mx-0 flex min-h-[calc(100vh-5rem)] w-full min-w-0 max-w-[21rem] flex-col justify-center gap-6 sm:mx-auto sm:max-w-md"
      >
        <div className="space-y-5">
          <LogoImage className="h-16 w-16 rounded-md" priority />
          <div className="min-w-0">
            <h1 className="text-5xl font-bold leading-none">Tip Track</h1>
            <p className="mt-3 max-w-full break-words text-base font-medium leading-7 text-zinc-500 sm:text-lg">
              A delivery log for orders, locations, and tip history.
            </p>
          </div>
        </div>

        <div className="app-card w-full min-w-0 space-y-4">
          {errorMessage ? <Banner tone="error">{errorMessage}</Banner> : null}
          {!isClerkConfigured ? (
            <Banner tone="error">
              Web sign-in is not configured.
            </Banner>
          ) : (
            <>
              <ClerkLoading>
                <PrimaryButton disabled>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading Sign In
                </PrimaryButton>
              </ClerkLoading>
              <ClerkLoaded>
                <SignInButton mode="modal">
                  <PrimaryButton type="button" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ChevronRight className="h-5 w-5" />}
                    {isLoading ? "Signing In" : "Sign In"}
                  </PrimaryButton>
                </SignInButton>
              </ClerkLoaded>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AddOrderPanel({
  orders,
  isPro,
  onShowPaywall,
  onAddOrder,
  onUpdateOrder,
}: {
  orders: TipOrder[];
  isPro: boolean;
  onShowPaywall: () => void;
  onAddOrder: (values: LocationValue & { orderId: string }) => Promise<void>;
  onUpdateOrder: (order: TipOrder, tip: number, location?: LocationValue) => Promise<void>;
}) {
  const [location, setLocation] = useState<LocationValue>({
    address: "",
    latitude: 0,
    longitude: 0,
  });
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isPro && orders.length >= freeOrderLimit) {
      onShowPaywall();
      return;
    }
    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      await onAddOrder({ ...location, orderId });
      setLocation({ address: "", latitude: 0, longitude: 0 });
      setOrderId("");
      setMessage("Order added.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not save order.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
      <div className="space-y-4">
      <DashboardSummary orders={orders} />
      <TrialCard isPro={isPro} orderCount={orders.length} onOpen={onShowPaywall} />

      <form onSubmit={handleSubmit} className="app-card space-y-4">
        <SectionHeader
          title="New delivery"
          subtitle="Log the order before the shift moves on."
        />
        <AddressLookupField value={location} onChange={setLocation} />
        <Field label="Order ID">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-zinc-500">
              #
            </span>
            <input
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              className="app-input pl-10"
              placeholder="Enter an order ID"
              autoCapitalize="characters"
            />
          </div>
        </Field>
        {error ? <Banner tone="error">{error}</Banner> : null}
        {message ? <Banner tone="success">{message}</Banner> : null}
        <PrimaryButton disabled={isSaving}>
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
          {isSaving ? "Saving" : "Save Order"}
        </PrimaryButton>
      </form>

      <RecentOrdersPreview orders={orders} onUpdateOrder={onUpdateOrder} />
    </div>
  );
}

function OrdersPanel({
  orders,
  onUpdateOrder,
}: {
  orders: TipOrder[];
  onUpdateOrder: (order: TipOrder, tip: number, location?: LocationValue) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<TipOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<TipOrder | null>(null);
  const matches = orders
    .filter((order) => order.externalId.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  useEffect(() => {
    if (!selectedOrder) return;
    setSelectedOrder(orders.find((order) => order.id === selectedOrder.id) ?? null);
  }, [orders, selectedOrder]);

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Find an order"
        subtitle="Search by the customer-facing order ID."
      />
      <SearchBox value={query} onChange={setQuery} placeholder="Enter Order ID" />
      {orders.length ? (
        <ResultsList emptyText="No orders found." isEmpty={!matches.length}>
          {matches.map((order, index) => (
            <ResultButton
              key={order.id}
              index={index}
              onClick={() => {
                setSelectedOrder(order);
                setQuery(order.externalId);
              }}
            >
              <IconTile icon={Receipt} tint="blue" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-zinc-900">
                  Order #{order.externalId}
                </h3>
                <p className="truncate text-xs text-zinc-500">{order.address}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-400" />
            </ResultButton>
          ))}
        </ResultsList>
      ) : (
        <EmptyPrompt text="No orders saved yet." />
      )}
      {selectedOrder ? (
        <OrderCard order={selectedOrder} onEdit={() => setEditingOrder(selectedOrder)} />
      ) : null}
      {editingOrder ? (
        <OrderEditor
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onUpdateOrder={onUpdateOrder}
        />
      ) : null}
    </div>
  );
}

function LocationsPanel({
  locations,
  onUpdateOrder,
}: {
  locations: TipLocation[];
  onUpdateOrder: (order: TipOrder, tip: number, location?: LocationValue) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<TipLocation | null>(null);
  const matches = locations
    .filter((location) => {
      const needle = query.toLowerCase();
      return (
        location.address.toLowerCase().includes(needle) ||
        location.orders.some((order) => order.externalId.toLowerCase().includes(needle))
      );
    })
    .slice(0, 5);

  useEffect(() => {
    if (!selectedLocation) return;
    setSelectedLocation(
      locations.find((location) => location.id === selectedLocation.id) ?? null
    );
  }, [locations, selectedLocation]);

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Location history"
        subtitle="Review repeat addresses and saved tip patterns."
      />
      <SearchBox value={query} onChange={setQuery} placeholder="Enter address" />
      {locations.length ? (
        <ResultsList emptyText="No location found." isEmpty={!matches.length}>
          {matches.map((location, index) => (
            <ResultButton
              key={location.id}
              index={index}
              onClick={() => {
                setSelectedLocation(location);
                setQuery(location.address);
              }}
            >
              <IconTile icon={Building2} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-zinc-900">
                  {location.address}
                </h3>
                <p className="truncate text-xs text-zinc-500">
                  {location.orders.map((order) => order.externalId).join(" | ")}
                </p>
              </div>
              <TipBadge tip={averageTip(location.orders)} compact />
            </ResultButton>
          ))}
        </ResultsList>
      ) : (
        <EmptyPrompt text="No locations saved yet." />
      )}
      {selectedLocation ? (
        <LocationCard location={selectedLocation} onUpdateOrder={onUpdateOrder} />
      ) : null}
    </div>
  );
}

function ReportsPanel({ orders }: { orders: TipOrder[] }) {
  const buckets = tipOptions.map((option) => ({
    ...option,
    count: orders.filter((order) => (order.tip ?? 0) === option.value).length,
  }));
  const maxCount = Math.max(...buckets.map((bucket) => bucket.count), 1);

  return (
    <div className="space-y-4">
      <DashboardSummary orders={orders} />
      {orders.length ? (
        <div className="app-card space-y-5">
          <SectionHeader
            title="Tips by type"
            subtitle="Distribution across saved orders."
          />
          <div className="space-y-4">
            {buckets.map((bucket) => (
              <div key={bucket.value} className="space-y-2">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>{bucket.label}</span>
                  <span>{bucket.count}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-emerald-600"
                    style={{ width: `${(bucket.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyPrompt text="No report data yet." />
      )}
    </div>
  );
}

function DashboardSummary({ orders }: { orders: TipOrder[] }) {
  const locationCount = new Set(orders.map((order) => order.address)).size;
  const tipsLogged = orders.filter((order) => order.tip !== null).length;
  const commonTip = useMemo(() => {
    if (!orders.length) return "$5-$10";
    const counts = tipOptions.map((option) => ({
      ...option,
      count: orders.filter((order) => (order.tip ?? 0) === option.value).length,
    }));
    return counts.sort((a, b) => b.count - a.count)[0]?.short ?? "$5-$10";
  }, [orders]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatTile icon={PackagePlus} label="Orders" value={orders.length.toString()} />
      <StatTile icon={Building2} label="Locations" value={locationCount.toString()} tint="blue" />
      <StatTile icon={Sparkles} label="Tips Logged" value={tipsLogged.toString()} tint="amber" />
      <StatTile icon={Receipt} label="Common Tip" value={commonTip} tint="rose" />
    </div>
  );
}

function TrialCard({
  isPro,
  orderCount,
  onOpen,
}: {
  isPro: boolean;
  orderCount: number;
  onOpen: () => void;
}) {
  const remaining = Math.max(freeOrderLimit - orderCount, 0);
  return (
    <div className="app-card flex items-center gap-3">
      <IconTile
        icon={isPro ? ShieldCheck : Unlock}
        tint={isPro ? "green" : "amber"}
      />
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold text-zinc-900">
          {isPro
            ? "TipTrack Pro"
            : `${remaining} free order${remaining === 1 ? "" : "s"} left`}
        </h2>
        <p className="text-xs leading-5 text-zinc-500">
          {isPro
            ? "Verified StoreKit unlock is active for this driver."
            : "Use the log first. Upgrade when it becomes part of your shift."}
        </p>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
          isPro
            ? "bg-emerald-600/10 text-emerald-700"
            : "bg-amber-500/12 text-zinc-900"
        }`}
      >
        {isPro ? "Active" : "Pro"}
      </button>
    </div>
  );
}

function AddressLookupField({
  value,
  onChange,
}: {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
}) {
  const {
    ready,
    suggestions: { data },
    setValue,
    clearSuggestions,
    init,
  } = usePlacesAutocomplete({
    initOnMount: false,
    debounce: 300,
  });

  function handleInput(nextAddress: string) {
    setValue(nextAddress);
    onChange({ address: nextAddress, latitude: 0, longitude: 0 });
  }

  async function handleSelect(description: string) {
    clearSuggestions();
    setValue(description, false);

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = getLatLng(results[0]);
      onChange({ address: description, latitude: lat, longitude: lng });
    } catch {
      onChange({ address: description, latitude: 0, longitude: 0 });
    }
  }

  return (
    <Field label="Address">
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-6 h-5 w-5 -translate-y-1/2 text-zinc-500" />
        <input
          value={value.address}
          onChange={(event) => handleInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") clearSuggestions();
          }}
          className="app-input pl-10"
          placeholder="Enter an address"
          autoComplete="off"
          aria-busy={googleMapsKey && !ready ? true : undefined}
        />
        {data.length ? (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-md border border-zinc-200 bg-white px-3 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
            {data.slice(0, 5).map((suggestion, index) => (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => void handleSelect(suggestion.description)}
                className={`block w-full py-3 text-left ${
                  index ? "border-t border-zinc-100" : ""
                }`}
              >
                <span className="block text-sm font-semibold text-zinc-900">
                  {suggestion.structured_formatting.main_text}
                </span>
                <span className="block text-xs text-zinc-500">
                  {suggestion.structured_formatting.secondary_text}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {googleMapsKey ? (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsKey}&libraries=places`}
          onReady={init}
        />
      ) : null}
    </Field>
  );
}

function RecentOrdersPreview({
  orders,
  onUpdateOrder,
}: {
  orders: TipOrder[];
  onUpdateOrder: (order: TipOrder, tip: number, location?: LocationValue) => Promise<void>;
}) {
  return (
    <div className="space-y-3">
      <SectionHeader title="Recent orders" subtitle="Latest saved delivery entries." />
      <OrderList
        orders={orders.slice(0, 4)}
        emptyText="No orders saved yet."
        onUpdateOrder={onUpdateOrder}
      />
    </div>
  );
}

function ResultsList({
  children,
  emptyText,
  isEmpty,
}: {
  children: React.ReactNode;
  emptyText: string;
  isEmpty: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      {isEmpty ? (
        <p className="p-4 text-sm text-zinc-500">{emptyText}</p>
      ) : (
        children
      )}
    </div>
  );
}

function ResultButton({
  children,
  index,
  onClick,
}: {
  children: React.ReactNode;
  index: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 p-4 text-left ${
        index ? "border-t border-zinc-100" : ""
      }`}
    >
      {children}
    </button>
  );
}

function OrderCard({ order, onEdit }: { order: TipOrder; onEdit: () => void }) {
  return (
    <button type="button" onClick={onEdit} className="app-card block w-full text-left">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-700">Order details</span>
          <Edit3 className="ml-auto h-4 w-4 text-emerald-700" />
        </div>
        <div className="flex items-start gap-3">
          <IconTile icon={Receipt} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-zinc-900">
              Order #{order.externalId}
            </h3>
            <p className="line-clamp-2 text-xs leading-5 text-zinc-500">{order.address}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TipBadge tip={order.tip} />
          <span className="ml-auto text-xs font-medium text-zinc-500">
            {formatDate(order.createdAt)}
          </span>
        </div>
      </div>
    </button>
  );
}

function OrderList({
  orders,
  emptyText,
  onUpdateOrder,
}: {
  orders: TipOrder[];
  emptyText: string;
  onUpdateOrder: (order: TipOrder, tip: number, location?: LocationValue) => Promise<void>;
}) {
  const [editingOrder, setEditingOrder] = useState<TipOrder | null>(null);

  if (!orders.length) return <EmptyPrompt text={emptyText} />;

  return (
    <>
      <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        {orders.map((order, index) => (
          <button
            key={order.id}
            type="button"
            onClick={() => setEditingOrder(order)}
            className={`flex w-full items-center gap-3 p-4 text-left ${
              index ? "border-t border-zinc-100" : ""
            }`}
          >
            <IconTile icon={Receipt} tint="blue" />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-zinc-900">
                Order #{order.externalId}
              </h3>
              <p className="truncate text-xs text-zinc-500">{order.address}</p>
            </div>
            <TipBadge tip={order.tip} compact />
          </button>
        ))}
      </div>
      {editingOrder ? (
        <OrderEditor
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onUpdateOrder={onUpdateOrder}
        />
      ) : null}
    </>
  );
}

function LocationCard({
  location,
  onUpdateOrder,
}: {
  location: TipLocation;
  onUpdateOrder: (order: TipOrder, tip: number, location?: LocationValue) => Promise<void>;
}) {
  const [editingOrder, setEditingOrder] = useState<TipOrder | null>(null);
  return (
    <div className="app-card space-y-4">
      <div className="flex items-start gap-3">
        <IconTile icon={Building2} />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-6 text-zinc-900">
            {location.address}
          </h3>
          <p className="text-sm text-zinc-500">
            {location.orders.length} saved order{location.orders.length === 1 ? "" : "s"}
          </p>
        </div>
        <TipBadge tip={averageTip(location.orders)} compact />
      </div>
      <div className="divide-y divide-zinc-100">
        {location.orders.map((order) => (
          <button
            key={order.id}
            type="button"
            onClick={() => setEditingOrder(order)}
            className="flex w-full items-center justify-between gap-3 py-3 text-left"
          >
            <div>
              <div className="text-sm font-semibold">Order #{order.externalId}</div>
              <div className="text-xs text-zinc-500">{formatDate(order.createdAt)}</div>
            </div>
            <TipBadge tip={order.tip} compact />
          </button>
        ))}
      </div>
      {editingOrder ? (
        <OrderEditor
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onUpdateOrder={onUpdateOrder}
          lockAddress
        />
      ) : null}
    </div>
  );
}

function OrderEditor({
  order,
  lockAddress = false,
  onClose,
  onUpdateOrder,
}: {
  order: TipOrder;
  lockAddress?: boolean;
  onClose: () => void;
  onUpdateOrder: (order: TipOrder, tip: number, location?: LocationValue) => Promise<void>;
}) {
  const [location, setLocation] = useState<LocationValue>({
    address: order.address,
    latitude: order.latitude,
    longitude: order.longitude,
  });
  const [selectedTip, setSelectedTip] = useState(order.tip ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      await onUpdateOrder(order, selectedTip, lockAddress ? undefined : location);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not update order.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="app-background w-full max-w-md overflow-hidden rounded-lg shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <button type="button" onClick={onClose} className="text-sm font-semibold text-zinc-500">
            Cancel
          </button>
          <h2 className="text-sm font-bold">
            {lockAddress ? `Order #${order.externalId}` : `Edit Order #${order.externalId}`}
          </h2>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="text-sm font-bold text-emerald-700"
          >
            {isSaving ? "Updating" : "Update"}
          </button>
        </div>
        <div className="space-y-4 p-4">
          {!lockAddress ? (
            <AddressLookupField value={location} onChange={setLocation} />
          ) : null}
          <div className="app-card space-y-3">
            <h3 className="text-sm font-semibold">Tip Amount</h3>
            <div className="divide-y divide-zinc-100">
              {tipOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedTip(option.value)}
                  className="flex w-full items-center justify-between gap-3 py-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <TipBadge tip={option.value} compact />
                    <span className="text-sm font-semibold text-zinc-900">
                      {option.label}
                    </span>
                  </div>
                  {selectedTip === option.value ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>
          {error ? <Banner tone="error">{error}</Banner> : null}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-zinc-950">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-zinc-500">{subtitle}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-zinc-800">{label}</span>
      {children}
    </label>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="app-input pl-10"
        placeholder={placeholder}
      />
    </div>
  );
}

function PrimaryButton({
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      {...props}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(4,120,87,0.18)] transition hover:bg-emerald-800 disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  tint = "green",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tint?: "green" | "blue" | "amber" | "rose";
}) {
  return (
    <div className="app-card space-y-3 p-3">
      <IconTile icon={Icon} tint={tint} />
      <div>
        <div className="text-xl font-bold text-zinc-950">{value}</div>
        <div className="text-xs font-medium text-zinc-500">{label}</div>
      </div>
    </div>
  );
}

function IconTile({
  icon: Icon,
  tint = "green",
  large = false,
}: {
  icon: React.ElementType;
  tint?: "green" | "blue" | "amber" | "rose";
  large?: boolean;
}) {
  const classes = {
    green: "bg-emerald-600/11 text-emerald-700 ring-emerald-600/18",
    blue: "bg-blue-600/11 text-blue-700 ring-blue-600/18",
    amber: "bg-amber-500/12 text-amber-700 ring-amber-500/20",
    rose: "bg-rose-600/11 text-rose-700 ring-rose-600/18",
  };
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-md ring-1 ${classes[tint]} ${
        large ? "h-12 w-12" : "h-9 w-9"
      }`}
    >
      <Icon className={large ? "h-6 w-6" : "h-5 w-5"} />
    </span>
  );
}

function TipBadge({ tip, compact = false }: { tip: number | null | undefined; compact?: boolean }) {
  const option = tipOption(tip);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${option.color}`}
    >
      <span>{compact ? option.short : option.label}</span>
    </span>
  );
}

function EmptyPrompt({ text }: { text: string }) {
  return (
    <div className="app-card flex items-center gap-3">
      <IconTile icon={Sparkles} />
      <p className="text-sm font-medium text-zinc-500">{text}</p>
    </div>
  );
}

function Banner({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: React.ReactNode;
}) {
  return (
    <div
      className={`min-w-0 overflow-hidden break-words rounded-md border px-3 py-2 text-sm font-medium leading-6 ${
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {children}
    </div>
  );
}

function LoadingBar() {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-500">
      <Loader2 className="h-4 w-4 animate-spin" />
      Syncing delivery log
    </div>
  );
}

function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="w-full max-w-md rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <h2 className="text-lg font-bold">Help</h2>
          <button type="button" onClick={onClose} className="font-semibold text-emerald-700">
            Done
          </button>
        </div>
        <div className="space-y-5 p-4">
          <HelpSection title="Track Orders" text="Add each order with its delivery address." />
          <HelpSection title="Record Tips" text="Update the tip after delivery or at the end of a shift." />
          <HelpSection title="Review Locations" text="Use saved locations to spot repeat addresses and average tip patterns." />
        </div>
      </div>
    </div>
  );
}

function PaywallDialog({
  isPro,
  onClose,
}: {
  isPro: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="app-background max-h-[92vh] w-full max-w-md overflow-y-auto rounded-lg shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur">
          <span className="w-12" />
          <h2 className="text-sm font-bold">TipTrack Pro</h2>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md bg-zinc-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-4">
          <div className="app-card space-y-4">
            <IconTile icon={ShieldCheck} large />
            <div>
              <h3 className="text-2xl font-bold text-zinc-950">
                {isPro ? "TipTrack Pro is active" : "Keep logging with Pro"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {isPro
                  ? "Your web dashboard is reading the verified App Store unlock synced from the iOS app."
                  : "Log your first 20 orders free, then upgrade when TipTrack is earning its place on your shift."}
              </p>
            </div>
          </div>

          <div className="app-card space-y-3">
            <PaywallFeature icon={Infinity} text="Unlimited order logging" />
            <PaywallFeature icon={Building2} text="Location history across repeat addresses" />
            <PaywallFeature icon={BarChart3} text="Tip pattern reports for every saved order" />
            <PaywallFeature icon={ShieldCheck} text="One-time unlock. No subscription." />
          </div>

          {isPro ? (
            <div className="rounded-md border border-emerald-600/20 bg-emerald-600/10 p-3 text-sm font-semibold text-zinc-900">
              Verified StoreKit entitlement active.
            </div>
          ) : (
            <a
              href="/#download"
              className="app-card flex items-center gap-3 p-3 no-underline"
              onClick={onClose}
            >
              <IconTile icon={Sparkles} tint="amber" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-zinc-900">TipTrack Pro Unlock</h3>
                <p className="text-xs leading-5 text-zinc-500">
                  Buy once in the iOS app. StoreKit verifies it, then this dashboard unlocks.
                </p>
              </div>
              <span className="text-sm font-bold text-zinc-900">$4.99</span>
            </a>
          )}

          <button
            type="button"
            onClick={onClose}
            className="min-h-12 w-full rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900"
          >
            Done
          </button>

          <p className="px-1 text-xs leading-5 text-zinc-500">
            Purchases are handled by native StoreKit in the iOS app. The web dashboard reads the server-verified StoreKit entitlement.
          </p>
        </div>
      </div>
    </div>
  );
}

function PaywallFeature({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-6 shrink-0 text-emerald-700" />
      <span className="text-sm font-semibold text-zinc-900">{text}</span>
    </div>
  );
}

function HelpSection({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-zinc-950">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-zinc-500">{text}</p>
    </div>
  );
}
