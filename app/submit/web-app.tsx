"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type React from "react";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Loader2,
  LogOut,
  MapPin,
  PackagePlus,
  Receipt,
  Search,
  ShieldCheck,
  Sparkles,
  Unlock,
} from "lucide-react";

type Session = {
  driverId: string;
  displayName: string;
};

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

type Tab = "add" | "orders" | "locations" | "reports";

const sessionKey = "tiptrack:web-session";
const freeOrderLimit = 20;

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
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("add");
  const [orders, setOrders] = useState<TipOrder[]>([]);
  const [locations, setLocations] = useState<TipLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const selectedTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  useEffect(() => {
    const savedSession = window.localStorage.getItem(sessionKey);
    if (savedSession) {
      setSession(JSON.parse(savedSession) as Session);
    }
  }, []);

  async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    if (!session) throw new Error("Sign in first.");

    const response = await fetch(path, {
      ...init,
      headers: {
        "content-type": "application/json",
        "x-tip-track-driver-id": session.driverId,
        ...init?.headers,
      },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "Something went wrong.");
    }

    return data as T;
  }

  const refreshData = useCallback(async (activeSession = session) => {
    if (!activeSession) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [ordersResult, locationsResult] = await Promise.all([
        fetch("/api/web/orders", {
          headers: { "x-tip-track-driver-id": activeSession.driverId },
        }).then((response) => response.json()),
        fetch("/api/web/locations", {
          headers: { "x-tip-track-driver-id": activeSession.driverId },
        }).then((response) => response.json()),
      ]);

      if (ordersResult.error) throw new Error(ordersResult.error);
      if (locationsResult.error) throw new Error(locationsResult.error);

      setOrders(ordersResult.orders ?? []);
      setLocations(locationsResult.locations ?? []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not load your shift ledger.");
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      void refreshData(session);
    }
  }, [refreshData, session]);

  async function handleSignIn(displayName: string) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/web/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error ?? "Could not sign in.");

      window.localStorage.setItem(sessionKey, JSON.stringify(data));
      setSession(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSignOut() {
    window.localStorage.removeItem(sessionKey);
    setSession(null);
    setOrders([]);
    setLocations([]);
    setActiveTab("add");
  }

  async function handleAddOrder(values: { address: string; orderId: string }) {
    await apiFetch<{ order: TipOrder }>("/api/web/orders", {
      method: "POST",
      body: JSON.stringify({
        externalId: values.orderId,
        location: {
          address: values.address,
          latitude: 0,
          longitude: 0,
        },
      }),
    });
    await refreshData();
  }

  async function handleUpdateOrder(order: TipOrder, tip: number, address?: string) {
    await apiFetch<{ order: TipOrder }>(
      `/api/web/orders/${encodeURIComponent(order.externalId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          tip,
          location: address
            ? {
                address,
                latitude: order.latitude,
                longitude: order.longitude,
              }
            : undefined,
        }),
      }
    );
    await refreshData();
  }

  if (!session) {
    return (
      <SignInScreen
        errorMessage={errorMessage}
        isLoading={isLoading}
        onSignIn={handleSignIn}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] text-zinc-950">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <IconTile icon={selectedTab.icon} />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold leading-tight">
              {selectedTab.title}
            </h1>
            <p className="truncate text-xs font-medium text-zinc-500">
              {session.displayName}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-md bg-zinc-100 text-zinc-800"
              aria-label="TipTrack Pro"
              title="First 20 orders free, then $4.99 once."
            >
              <Unlock className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-md bg-zinc-100 text-zinc-800"
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="grid h-9 w-9 place-items-center rounded-md bg-zinc-100 text-zinc-800"
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-4">
        {errorMessage ? <Banner tone="error">{errorMessage}</Banner> : null}
        {isLoading ? <LoadingBar /> : null}

        {activeTab === "add" ? (
          <AddOrderPanel
            orders={orders}
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
    </div>
  );
}

function SignInScreen({
  errorMessage,
  isLoading,
  onSignIn,
}: {
  errorMessage: string | null;
  isLoading: boolean;
  onSignIn: (displayName: string) => Promise<void>;
}) {
  const [name, setName] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSignIn(name);
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] px-4 py-10 text-zinc-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md min-w-0 flex-col justify-center gap-6">
        <div className="space-y-5">
          <IconTile icon={WalletIcon} large />
          <div>
            <h1 className="text-5xl font-bold leading-none">Tip Track</h1>
            <p className="mt-3 max-w-sm text-lg font-medium leading-7 text-zinc-500">
              A shift ledger for delivery orders, locations, and tip history.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="app-card w-full min-w-0 space-y-4">
          <Field label="Driver Name">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="app-input"
              placeholder="Enter your name"
              autoCapitalize="words"
            />
          </Field>
          {errorMessage ? <Banner tone="error">{errorMessage}</Banner> : null}
          <PrimaryButton disabled={isLoading}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ChevronRight className="h-5 w-5" />}
            {isLoading ? "Signing In" : "Sign In"}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}

function AddOrderPanel({
  orders,
  onAddOrder,
  onUpdateOrder,
}: {
  orders: TipOrder[];
  onAddOrder: (values: { address: string; orderId: string }) => Promise<void>;
  onUpdateOrder: (order: TipOrder, tip: number, address?: string) => Promise<void>;
}) {
  const [address, setAddress] = useState("");
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      await onAddOrder({ address, orderId });
      setAddress("");
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
      <TrialCard orderCount={orders.length} />

      <form onSubmit={handleSubmit} className="app-card space-y-4">
        <SectionHeader
          title="New delivery"
          subtitle="Log the order before the shift moves on."
        />
        <Field label="Address">
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="app-input pl-10"
              placeholder="Enter an address"
            />
          </div>
        </Field>
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
  onUpdateOrder: (order: TipOrder, tip: number, address?: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const matches = orders.filter((order) =>
    order.externalId.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Find an order"
        subtitle="Search by the customer-facing order ID."
      />
      <SearchBox value={query} onChange={setQuery} placeholder="Enter Order ID" />
      <OrderList
        orders={matches}
        emptyText={orders.length ? "No orders found." : "No orders saved yet."}
        onUpdateOrder={onUpdateOrder}
      />
    </div>
  );
}

function LocationsPanel({
  locations,
  onUpdateOrder,
}: {
  locations: TipLocation[];
  onUpdateOrder: (order: TipOrder, tip: number, address?: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const matches = locations.filter((location) => {
    const needle = query.toLowerCase();
    return (
      location.address.toLowerCase().includes(needle) ||
      location.orders.some((order) => order.externalId.toLowerCase().includes(needle))
    );
  });

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Location history"
        subtitle="Review repeat addresses and saved tip patterns."
      />
      <SearchBox value={query} onChange={setQuery} placeholder="Enter address" />
      {matches.length ? (
        <div className="space-y-3">
          {matches.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              onUpdateOrder={onUpdateOrder}
            />
          ))}
        </div>
      ) : (
        <EmptyPrompt text={locations.length ? "No location found." : "No locations saved yet."} />
      )}
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

function TrialCard({ orderCount }: { orderCount: number }) {
  const remaining = Math.max(freeOrderLimit - orderCount, 0);
  return (
    <div className="app-card flex items-center gap-3">
      <IconTile icon={remaining ? Unlock : ShieldCheck} tint={remaining ? "amber" : "green"} />
      <div>
        <h2 className="text-sm font-semibold text-zinc-900">
          {remaining ? `${remaining} free orders remaining` : "TipTrack Pro unlock"}
        </h2>
        <p className="text-xs leading-5 text-zinc-500">
          First 20 orders free, then a one-time $4.99 unlock. No subscription.
        </p>
      </div>
    </div>
  );
}

function RecentOrdersPreview({
  orders,
  onUpdateOrder,
}: {
  orders: TipOrder[];
  onUpdateOrder: (order: TipOrder, tip: number, address?: string) => Promise<void>;
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

function OrderList({
  orders,
  emptyText,
  onUpdateOrder,
}: {
  orders: TipOrder[];
  emptyText: string;
  onUpdateOrder: (order: TipOrder, tip: number, address?: string) => Promise<void>;
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
  onUpdateOrder: (order: TipOrder, tip: number, address?: string) => Promise<void>;
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
  onUpdateOrder: (order: TipOrder, tip: number, address?: string) => Promise<void>;
}) {
  const [address, setAddress] = useState(order.address);
  const [selectedTip, setSelectedTip] = useState(order.tip ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      await onUpdateOrder(order, selectedTip, lockAddress ? undefined : address);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not update order.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="w-full max-w-md rounded-lg bg-[#fafaf8] shadow-2xl">
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
            <Field label="Address">
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className="app-input"
              />
            </Field>
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
                  <TipBadge tip={option.value} />
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
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
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
      className={`rounded-md border px-3 py-2 text-sm font-medium ${
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
      Syncing shift ledger
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

function HelpSection({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-zinc-950">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-zinc-500">{text}</p>
    </div>
  );
}

function WalletIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h13" />
      <path d="M18 12h4v4h-4a2 2 0 0 1 0-4Z" />
    </svg>
  );
}
