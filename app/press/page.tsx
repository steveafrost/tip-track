import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Download, Smartphone, Video } from "lucide-react";

import { LogoImage, PhoneScreenshot } from "@/components/static-images";

const appStoreUrl = "https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=press-kit";
const shareCardUrl = "/images/campaign/tiptrack-ios-share-card.png";
const videoUrl = "/videos/campaign/tiptrack-delayed-tip-video-01.mp4";

export const metadata: Metadata = {
  title: "TipTrack Press Kit",
  description:
    "Accurate product facts, approved visual assets, and App Store links for TipTrack, a native iPhone delivery-history app.",
  alternates: {
    canonical: "/press",
  },
  openGraph: {
    title: "TipTrack Press Kit",
    description:
      "Approved assets and accurate product facts for TipTrack on iPhone.",
    url: "https://usetiptrack.com/press",
  },
};

const productFacts = [
  "Native iPhone app for manually logging delivery order IDs, addresses, and tip ranges.",
  "Lets drivers update a saved tip range later when a delayed tip is reported.",
  "Lets drivers search saved orders and review the location history they personally recorded for repeat addresses.",
  "Supports logging and updating with Shortcuts and Siri actions.",
  "First 20 orders are free; TipTrack Pro is a one-time $4.99 unlock.",
];

const notClaims = [
  "No delivery-platform account connection or automatic import.",
  "No tip prediction or exact-earnings, payout, or mileage calculation.",
  "No promise of a financial or delivery outcome.",
];

export default function PressPage() {
  const pressSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "TipTrack Delivery Log",
    operatingSystem: "iOS",
    applicationCategory: "ProductivityApplication",
    downloadUrl: appStoreUrl,
    description:
      "A native iPhone app for manually recording delivery order IDs, addresses, and tip ranges, then updating delayed tips and reviewing saved location history.",
  };

  return (
    <main className="min-h-screen bg-[#f4ead1] text-[#132114]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pressSchema) }}
      />
      <header className="border-b border-[#17351e]/15 bg-[#050705] text-[#fff8df]">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-5 py-5 sm:px-8">
          <Link href="/" className="font-mono text-lg font-black tracking-[0.08em]">
            TIPTRACK
          </Link>
          <a
            href={appStoreUrl}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[#b8f26d]/70 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#b8f26d] transition hover:bg-[#b8f26d] hover:text-[#071007]"
          >
            View on the App Store
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </nav>
      </header>

      <section className="bg-[#050705] px-5 pb-20 pt-14 text-[#fff8df] sm:px-8 sm:pb-28 sm:pt-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_0.4fr] lg:items-center">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4">
              <LogoImage alt="TipTrack app icon" className="h-14 w-14 rounded-2xl" priority />
              <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#b8f26d]">
                Media and creator kit
              </p>
            </div>
            <h1 className="mt-7 text-5xl font-black leading-[0.95] sm:text-7xl">TipTrack press kit.</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#d8cba8] sm:text-xl">
              TipTrack is a native iPhone delivery-history app for keeping order IDs, repeat addresses, and tip ranges usable after a shift.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={appStoreUrl}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#f8f1dc] px-5 py-3 text-sm font-black text-[#11150f] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Open the App Store listing
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={shareCardUrl}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#b8f26d]/70 px-5 py-3 text-sm font-black text-[#e7ffd1] transition hover:bg-[#b8f26d] hover:text-[#071007]"
              >
                Download share image
                <Download className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[16rem] rotate-[3deg] rounded-[2rem] border-[9px] border-black bg-black shadow-[0_34px_80px_rgba(0,0,0,0.42)]">
            <PhoneScreenshot
              image="add-order"
              alt="TipTrack iPhone add-order screen with an address, order ID, and tip-range choices."
              className="h-auto w-full rounded-[1.35rem]"
              priority
            />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <section className="rounded-md border border-[#c8b785] bg-[#eadfbe] p-7 shadow-[0_18px_48px_rgba(74,53,19,0.1)] sm:p-9">
            <div className="flex items-center gap-3 text-[#2f7b35]">
              <Smartphone className="h-7 w-7" aria-hidden="true" />
              <p className="font-mono text-xs font-black uppercase tracking-[0.16em]">Accurate product facts</p>
            </div>
            <ul className="mt-7 space-y-4">
              {productFacts.map((fact) => (
                <li key={fact} className="flex gap-3 leading-7 text-[#344538]">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-[#2f7b35]" aria-hidden="true" />
                  {fact}
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-md border border-[#5d724d] bg-[#17351e] p-7 text-[#fff8df] shadow-[0_18px_48px_rgba(31,54,25,0.18)] sm:p-9">
            <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[#b8f26d]">Please do not claim</p>
            <ul className="mt-7 space-y-4">
              {notClaims.map((claim) => (
                <li key={claim} className="flex gap-3 leading-7 text-[#d8cba8]">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#b8f26d]" aria-hidden="true" />
                  {claim}
                </li>
              ))}
            </ul>
            <p className="mt-8 border-t border-white/15 pt-6 leading-7 text-[#d8cba8]">
              The concise product story: save the delivery, update a delayed tip later, and review the history you personally recorded for a repeat address.
            </p>
          </section>
        </div>
      </section>

      <section className="bg-[#17351e] px-5 py-20 text-[#fff8df] sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1fr] lg:items-center">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#b8f26d]">Approved visual material</p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Use real app screens and the supplied product assets.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d8cba8]">
              The share image, short video, and App Store listing all use current native TipTrack screens. Do not substitute dashboard mockups, delivery-platform logos, or made-up payout totals.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={shareCardUrl}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#f8f1dc] px-5 py-3 text-sm font-black text-[#11150f] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Share card PNG
                <Download className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={videoUrl}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#b8f26d]/70 px-5 py-3 text-sm font-black text-[#e7ffd1] transition hover:bg-[#b8f26d] hover:text-[#071007]"
              >
                Short video MP4
                <Video className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="overflow-hidden rounded-md border border-white/15 bg-black/20 p-3 shadow-[0_30px_70px_rgba(0,0,0,0.32)]">
            <Image
              src={shareCardUrl}
              alt="TipTrack iPhone delivery-tip-history share image."
              width={1200}
              height={630}
              className="h-auto w-full rounded-sm"
            />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl rounded-md border border-[#c8b785] bg-[#eadfbe] p-8 sm:p-12">
          <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#315020]">Primary links</p>
          <div className="mt-6 grid gap-4">
            <a href={appStoreUrl} className="font-black text-[#17351e] underline decoration-[#2f7b35] decoration-2 underline-offset-4">
              TipTrack Delivery Log on the App Store
            </a>
            <Link href="/delivery-tip-tracker" className="font-black text-[#17351e] underline decoration-[#2f7b35] decoration-2 underline-offset-4">
              Delivery tip tracker for iPhone
            </Link>
            <Link href="/blog/how-to-track-delivery-tips-on-iphone" className="font-black text-[#17351e] underline decoration-[#2f7b35] decoration-2 underline-offset-4">
              How to keep a delivery tip history on iPhone
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
