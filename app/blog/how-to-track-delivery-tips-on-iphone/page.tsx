import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, Clock3, MapPin, Mic } from "lucide-react";

import { PhoneScreenshot } from "@/components/static-images";

const appStoreUrl =
  "https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=organic-iphone-guide";

export const metadata: Metadata = {
  title: "How to Track Delivery Tips on iPhone",
  description:
    "A simple iPhone workflow for logging delivery orders, updating delayed tips, and checking the history you saved for repeat addresses.",
  alternates: {
    canonical: "/blog/how-to-track-delivery-tips-on-iphone",
  },
  openGraph: {
    title: "How to Track Delivery Tips on iPhone",
    description:
      "A simple iPhone workflow for logging delivery orders, updating delayed tips, and checking repeat-address history.",
    url: "https://usetiptrack.com/blog/how-to-track-delivery-tips-on-iphone",
  },
};

const steps = [
  {
    icon: MapPin,
    title: "Save the delivery while it is fresh",
    description:
      "After the delivery, save the order ID and address. Record the tip range you know now, or leave it for later.",
  },
  {
    icon: Clock3,
    title: "Update a delayed tip later",
    description:
      "When a tip is reported after the delivery, find the saved order by its number or address and update the tip range.",
  },
  {
    icon: Check,
    title: "Use your own recorded history",
    description:
      "When an address appears again, check the location history you saved there. It is a personal log, not a prediction.",
  },
  {
    icon: Mic,
    title: "Keep logging quick on iPhone",
    description:
      "TipTrack supports Shortcuts and Siri actions for logging an order or updating a tip without digging through screens.",
  },
];

export default function DeliveryTipsOnIphonePage() {
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

      <article>
        <section className="bg-[#050705] px-5 pb-20 pt-14 text-[#fff8df] sm:px-8 sm:pb-28 sm:pt-20">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_0.42fr] lg:items-center">
            <div className="max-w-3xl">
              <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#b8f26d]">
                A practical iPhone workflow
              </p>
              <h1 className="mt-5 text-5xl font-black leading-[0.95] sm:text-7xl">
                How to keep a delivery tip history on iPhone.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#d8cba8] sm:text-xl">
                The useful part is not another estimate. It is being able to find
                the completed delivery, the address, and the tip history you saved
                when you need them later.
              </p>
              <a
                href={appStoreUrl}
                className="mt-9 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#f8f1dc] px-5 py-3 text-sm font-black text-[#11150f] shadow-[0_18px_42px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Download TipTrack for iPhone
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
            <div className="mx-auto w-full max-w-[16rem] rotate-[3deg] rounded-[2rem] border-[9px] border-black bg-black shadow-[0_34px_80px_rgba(0,0,0,0.42)]">
              <PhoneScreenshot
                image="add-order"
                alt="TipTrack iPhone add-order screen with an address and order ID field."
                className="h-auto w-full rounded-[1.35rem]"
                priority
              />
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#315020]">
              Four steps after a delivery
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {steps.map(({ icon: Icon, title, description }, index) => (
                <section
                  key={title}
                  className="rounded-md border border-[#c8b785] bg-[#eadfbe] p-7 shadow-[0_18px_48px_rgba(74,53,19,0.1)]"
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-7 w-7 text-[#2f7b35]" aria-hidden="true" />
                    <span className="font-mono text-xs font-black text-[#746240]">0{index + 1}</span>
                  </div>
                  <h2 className="mt-9 text-2xl font-black text-[#17351e]">{title}</h2>
                  <p className="mt-3 max-w-xl leading-7 text-[#4f594b]">{description}</p>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#17351e] px-5 py-20 text-[#fff8df] sm:px-8">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.44fr_1fr] lg:items-center">
            <div className="mx-auto w-full max-w-[14rem] -rotate-[3deg] rounded-[1.8rem] border-[8px] border-black bg-black shadow-[0_30px_70px_rgba(0,0,0,0.32)]">
              <PhoneScreenshot
                image="locations"
                alt="TipTrack iPhone location-history screen with saved delivery addresses."
                className="h-auto w-full rounded-[1.1rem]"
              />
            </div>
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#b8f26d]">
                A manual log, on purpose
              </p>
              <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
                Use the history you recorded. Do not pretend it knows the future.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d8cba8]">
                TipTrack stores the order IDs, addresses, and tip ranges you choose
                to log. It does not connect to delivery-platform accounts, predict
                tips, or calculate exact earnings or mileage.
              </p>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d8cba8]">
                The first 20 orders are free. TipTrack Pro is a one-time $4.99
                unlock for unlimited order logging, saved location history, and
                tip-pattern reports.
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-3xl rounded-md border border-[#c8b785] bg-[#eadfbe] p-8 sm:p-12">
            <h2 className="text-3xl font-black text-[#17351e]">Start with the next completed delivery.</h2>
            <p className="mt-4 text-lg leading-8 text-[#4f594b]">
              A simple routine—save the order, update a later tip, and look up a
              repeat address—turns scattered shift details into a history you can
              actually use on iPhone.
            </p>
            <a
              href={appStoreUrl}
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#17351e] px-5 py-3 text-sm font-black text-[#fff8df] transition hover:-translate-y-0.5 hover:bg-[#2f7b35]"
            >
              Get TipTrack on the App Store
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </section>
      </article>
    </main>
  );
}
