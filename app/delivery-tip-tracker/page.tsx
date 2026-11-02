import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, Clock3, MapPin, Mic, Search } from "lucide-react";

import { PhoneScreenshot } from "@/components/static-images";

const appStoreUrl =
  "https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=organic-delivery-tip-tracker";

export const metadata: Metadata = {
  title: "Delivery Tip Tracker for iPhone",
  description:
    "Save delivery order IDs, address history, and tip ranges in one iPhone log. Update delayed tips and check repeat locations with TipTrack.",
  alternates: {
    canonical: "/delivery-tip-tracker",
  },
  openGraph: {
    title: "Delivery Tip Tracker for iPhone",
    description:
      "Save delivery order IDs, address history, and tip ranges in one iPhone log. Update delayed tips and check repeat locations with TipTrack.",
    url: "https://usetiptrack.com/delivery-tip-tracker",
  },
};

const steps = [
  {
    icon: MapPin,
    title: "Save the completed delivery",
    description:
      "Add the order ID and address as soon as the delivery is done, then choose a tip range or leave it for later.",
  },
  {
    icon: Clock3,
    title: "Update the tip when it arrives",
    description:
      "Search by order number or address and update the saved tip range when a delayed tip is reported.",
  },
  {
    icon: Search,
    title: "Check repeat addresses",
    description:
      "Look up a saved location to review the tip ranges already recorded there before another delivery decision.",
  },
];

const tipRanges = ["No Tip", "Less Than $5", "Between $5 and $10", "More Than $10", "More Than $20"];

export default function DeliveryTipTrackerPage() {
  return (
    <main className="min-h-screen bg-[#f4ead1] text-[#132114]">
      <header className="border-b border-[#17351e]/15 bg-[#050705] text-[#fff8df]">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-5 py-5 sm:px-8">
          <Link href="/" className="font-mono text-lg font-black tracking-[0.08em]">
            TIPTRACK
          </Link>
          <a
            href={appStoreUrl}
            className="inline-flex items-center gap-2 rounded-md border border-[#b8f26d]/70 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#b8f26d] transition hover:bg-[#b8f26d] hover:text-[#071007]"
          >
            Get the iPhone app
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </nav>
      </header>

      <section className="relative overflow-hidden bg-[#050705] px-5 pb-20 pt-14 text-[#fff8df] sm:px-8 sm:pb-28 sm:pt-20">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(0deg,transparent_31px,rgba(168,255,93,0.24)_32px),linear-gradient(90deg,transparent_31px,rgba(168,255,93,0.14)_32px)] [background-size:33px_33px]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_0.48fr] lg:items-center">
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#b8f26d]">
              TipTrack for iPhone
            </p>
            <h1 className="mt-5 text-5xl font-black leading-[0.95] sm:text-7xl">
              Keep a delivery tip history you can use.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#d8cba8] sm:text-xl">
              TipTrack is a manual delivery log for the details that vanish by
              the end of a shift: order IDs, saved addresses, and tip ranges.
              Update a delayed tip later, then review the history at repeat
              locations.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={appStoreUrl}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#f8f1dc] px-5 py-3 text-sm font-black text-[#11150f] shadow-[0_18px_42px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Download on the App Store
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#8bc34a]/80 px-5 py-3 text-sm font-black text-[#e7ffd1] transition hover:bg-[#8bc34a] hover:text-[#071007]"
              >
                See how TipTrack works
              </Link>
            </div>
            <p className="mt-4 font-mono text-xs text-[#b9ad8f]">
              First 20 orders are free. TipTrack Pro is a one-time $4.99 unlock.
            </p>
          </div>

          <div className="mx-auto w-full max-w-[16rem] rotate-[3deg] rounded-[2rem] border-[9px] border-black bg-black shadow-[0_34px_80px_rgba(0,0,0,0.42)]">
            <PhoneScreenshot
              image="reports"
              alt="TipTrack iPhone reports screen showing saved-order counts and tip-range distribution."
              className="h-auto w-full rounded-[1.35rem]"
              priority
            />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#315020]">
            Three steps, one usable history
          </p>
          <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-[#17351e] sm:text-5xl">
            Built for the moment after a delivery—not another spreadsheet to keep up with.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, description }, index) => (
              <article
                key={title}
                className="rounded-md border border-[#c8b785] bg-[#eadfbe] p-6 shadow-[0_18px_48px_rgba(74,53,19,0.1)]"
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-7 w-7 text-[#2f7b35]" aria-hidden="true" />
                  <span className="font-mono text-xs font-black text-[#746240]">0{index + 1}</span>
                </div>
                <h3 className="mt-10 text-xl font-black text-[#17351e]">{title}</h3>
                <p className="mt-3 leading-7 text-[#4f594b]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#17351e] px-5 py-20 text-[#fff8df] sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.62fr_0.9fr] lg:items-center">
          <div className="mx-auto w-full max-w-[14rem] -rotate-[3deg] rounded-[1.8rem] border-[8px] border-black bg-black shadow-[0_30px_70px_rgba(0,0,0,0.32)]">
            <PhoneScreenshot
              image="add-order"
              alt="TipTrack iPhone add order screen with address, order ID, and tip-range choices."
              className="h-auto w-full rounded-[1.1rem]"
            />
          </div>
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#b8f26d]">
              Honest about the data
            </p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              TipTrack records ranges, not made-up precision.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d8cba8]">
              The app is designed for quick, consistent history. Choose the tip
              range you know now, or come back when the platform reports a
              delayed tip.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {tipRanges.map((range) => (
                <div key={range} className="flex items-center gap-3 font-mono text-sm">
                  <Check className="h-5 w-5 shrink-0 text-[#b8f26d]" aria-hidden="true" />
                  {range}
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-3 rounded-md border border-[#b8f26d]/30 bg-black/20 p-4 text-sm leading-6 text-[#d8cba8]">
              <Mic className="h-6 w-6 shrink-0 text-[#b8f26d]" aria-hidden="true" />
              Log an order or update a tip with TipTrack&apos;s Shortcuts and Siri actions.
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#315020]">FAQ</p>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <details className="rounded-md border border-[#c8b785] bg-[#eadfbe] p-6">
              <summary className="cursor-pointer font-black text-[#17351e]">
                Does TipTrack connect to delivery-platform accounts?
              </summary>
              <p className="mt-4 leading-7 text-[#4f594b]">
                No. TipTrack is a manual delivery log: you choose what to save,
                including the order ID, address, and tip range.
              </p>
            </details>
            <details className="rounded-md border border-[#c8b785] bg-[#eadfbe] p-6">
              <summary className="cursor-pointer font-black text-[#17351e]">
                Can I update a tip after the delivery?
              </summary>
              <p className="mt-4 leading-7 text-[#4f594b]">
                Yes. Find a saved order by order number or delivery address and
                update its tip range when the tip is reported.
              </p>
            </details>
            <details className="rounded-md border border-[#c8b785] bg-[#eadfbe] p-6">
              <summary className="cursor-pointer font-black text-[#17351e]">
                Does it track exact payouts and earnings?
              </summary>
              <p className="mt-4 leading-7 text-[#4f594b]">
                Not today. TipTrack records tip ranges and location history; it
                does not calculate exact payouts, mileage, or earnings.
              </p>
            </details>
            <details className="rounded-md border border-[#c8b785] bg-[#eadfbe] p-6">
              <summary className="cursor-pointer font-black text-[#17351e]">
                What does TipTrack Pro cost?
              </summary>
              <p className="mt-4 leading-7 text-[#4f594b]">
                The first 20 orders are free. TipTrack Pro is a one-time $4.99
                unlock for unlimited order logging, location history, and
                tip-pattern reports.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="bg-[#050705] px-5 py-16 text-center text-[#fff8df] sm:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-black leading-tight sm:text-5xl">
            Start a delivery history before the next shift blurs together.
          </h2>
          <a
            href={appStoreUrl}
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#f8f1dc] px-5 py-3 text-sm font-black text-[#11150f] transition hover:-translate-y-0.5 hover:bg-white"
          >
            Download TipTrack for iPhone
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
}
