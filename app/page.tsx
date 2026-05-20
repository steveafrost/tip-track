import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Download,
  LockKeyhole,
  MapPin,
  NotebookPen,
  Route,
  Search,
  ShieldCheck,
  Smartphone,
  WalletCards,
} from "lucide-react";

const appStoreUrl = "https://apps.apple.com/app/id6771138274";

const workflow = [
  {
    icon: NotebookPen,
    title: "Log the order",
    copy: "Save order ID, address, time, tip, and notes while the shift is still moving.",
  },
  {
    icon: BarChart3,
    title: "See what is working",
    copy: "Daily, weekly, and monthly reports show which runs are actually adding up.",
  },
  {
    icon: MapPin,
    title: "Spot repeat locations",
    copy: "Build a practical memory for addresses that tend to tip well, poorly, or unpredictably.",
  },
  {
    icon: ShieldCheck,
    title: "Decide with confidence",
    copy: "Keep the details private, simple, and ready before the next offer hits your screen.",
  },
];

const trustPoints = [
  {
    icon: LockKeyhole,
    title: "Private and secure",
    copy: "Your shift data stays yours.",
  },
  {
    icon: Smartphone,
    title: "Works everywhere",
    copy: "iPhone plus web access.",
  },
  {
    icon: Route,
    title: "Built for drivers",
    copy: "Fast capture, useful memory.",
  },
];

const ledgerRows = [
  ["5:18 PM", "A1234B56", "123 Oak St", "$12.75"],
  ["5:47 PM", "B9876C54", "456 Pine Ave", "$8.50"],
  ["6:22 PM", "C2468D13", "709 Maple Dr", "$15.00"],
  ["6:58 PM", "D1357E24", "321 Elm St", "$6.25"],
  ["7:32 PM", "E8642F31", "654 Cedar St", "$10.16"],
];

const faqs = [
  {
    question: "How does the free start work?",
    answer:
      "The first 20 orders are free so you can use TipTrack during real shifts before paying.",
  },
  {
    question: "What does the $4.99 unlock include?",
    answer:
      "Unlimited orders, full reports, saved location history, and continued use across iPhone and web.",
  },
  {
    question: "Is this a subscription?",
    answer:
      "No. TipTrack Pro is a one-time unlock. Pay once if it earns a spot in your workflow.",
  },
  {
    question: "Does TipTrack work on the web too?",
    answer:
      "Yes. The web app is available for quick access, and the native iPhone app is the main shift companion.",
  },
];

function AppStoreButton({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href={appStoreUrl}
      className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-[#0d1b14] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(4,14,9,0.22)] transition hover:-translate-y-0.5 hover:bg-black focus:outline-none focus:ring-4 focus:ring-[#f3b44f]/40"
    >
      <Download className="h-5 w-5" aria-hidden="true" />
      <span>{compact ? "App Store" : "Download on the App Store"}</span>
    </a>
  );
}

function PhoneShot({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-[2rem] border-[10px] border-[#101510] bg-[#101510] shadow-[0_34px_80px_rgba(0,0,0,0.36)] ${className}`}
    >
      <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-[#101510]" />
      <Image
        src={src}
        alt={alt}
        width={1284}
        height={2778}
        className="h-full w-full rounded-[1.35rem] object-cover"
        priority={src.includes("add-order")}
      />
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f5ee] text-[#102117]">
      <header className="relative z-30 border-b border-[#102117]/10 bg-[#fbfaf6]/92 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo-96.png"
              alt=""
              width={44}
              height={44}
              className="rounded-md"
              priority
            />
            <div className="leading-none">
              <div className="text-2xl font-black tracking-normal">
                Tip<span className="text-[#168237]">Track</span>
              </div>
              <div className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#546257]">
                Shift Ledger
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-semibold text-[#2f3b33] md:flex">
            <a href="#features" className="hover:text-[#147a34]">
              Features
            </a>
            <a href="#pricing" className="hover:text-[#147a34]">
              Pricing
            </a>
            <a href="#faq" className="hover:text-[#147a34]">
              FAQ
            </a>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href="/submit"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#147a34] bg-white px-4 text-sm font-semibold text-[#11672d] transition hover:bg-[#eaf5ed] focus:outline-none focus:ring-4 focus:ring-[#147a34]/15"
            >
              Open web app
            </Link>
            <AppStoreButton compact />
          </div>
        </nav>
      </header>

      <section className="relative h-[calc(100vh-120px)] min-h-[680px] max-h-[780px] overflow-hidden bg-[#121811] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(243,180,79,0.16),transparent_26%),linear-gradient(116deg,rgba(8,15,10,0.98)_0%,rgba(16,33,23,0.9)_48%,rgba(18,24,17,0.82)_100%)]" />
        <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(0deg,transparent_24px,rgba(255,255,255,0.18)_25px),linear-gradient(90deg,transparent_24px,rgba(255,255,255,0.12)_25px)] [background-size:26px_26px]" />
        <div className="absolute -left-16 top-20 h-[520px] w-[520px] rotate-[-8deg] rounded-md border border-[#f7f0df]/20 bg-[#ece4cf]/12 shadow-[0_30px_100px_rgba(0,0,0,0.24)]" />
        <div className="absolute left-8 top-28 hidden rotate-[-8deg] font-mono text-xs uppercase tracking-[0.2em] text-[#d4c7a6]/55 md:block">
          42.3314 N / 83.0458 W
        </div>
        <div className="absolute left-20 top-44 hidden h-24 w-40 rounded-full border border-dashed border-[#d4c7a6]/45 md:block" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-[linear-gradient(to_bottom,transparent,#f7f5ee)]" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 pb-10 pt-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:pb-12 lg:pt-14">
          <div className="max-w-2xl">
            <h1 className="text-[2.85rem] font-black leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
              TipTrack Shift Ledger
            </h1>
            <p className="mt-6 max-w-[20rem] text-2xl font-bold leading-tight text-[#f5eddd] sm:max-w-xl sm:text-3xl">
              Know which deliveries are worth remembering.
            </p>
            <p className="mt-5 max-w-[20rem] text-base leading-7 text-[#dfd8cb] sm:max-w-lg sm:text-lg">
              Log orders, addresses, tips, and quick notes so the best repeat
              locations stand out before the next shift starts.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <AppStoreButton />
              <Link
                href="/submit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/65 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:text-[#102117] focus:outline-none focus:ring-4 focus:ring-white/20"
              >
                Open web app
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-9 grid max-w-2xl gap-4 text-xs text-[#eee5d4] sm:grid-cols-3">
              {trustPoints.map((item) => (
                <div key={item.title} className="flex gap-3">
                  <item.icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#f3b44f]"
                    aria-hidden="true"
                  />
                  <div>
                    <div className="font-bold text-white">{item.title}</div>
                    <div className="mt-1 leading-5 text-[#d9d0bd]">
                      {item.copy}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[520px] lg:min-h-[610px]">
            <div className="absolute right-2 top-0 hidden w-52 rotate-[5deg] rounded-md bg-[#efe4ca] p-5 font-mono text-xs text-[#384336] shadow-[0_24px_50px_rgba(0,0,0,0.2)] md:block">
              <div className="mb-3 flex items-center justify-between border-b border-[#796b50]/30 pb-2">
                <span>TODAY</span>
                <span>MAY 18</span>
              </div>
              <div className="space-y-2">
                {ledgerRows.slice(0, 4).map(([time, order, , tip]) => (
                  <div key={order} className="grid grid-cols-[1fr_1.3fr_1fr] gap-2">
                    <span>{time}</span>
                    <span>{order}</span>
                    <span className="text-right font-bold">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
            <PhoneShot
              src="/images/marketing/reports.png"
              alt="TipTrack reports screen showing weekly tips and top locations."
              className="absolute left-0 top-14 hidden h-[470px] w-[218px] rotate-[-5deg] md:block"
            />
            <PhoneShot
              src="/images/marketing/add-order.png"
              alt="TipTrack add order form with order ID, address, tip amount, date, and notes fields."
              className="absolute left-1/2 top-0 h-[540px] w-[250px] -translate-x-1/2 md:h-[580px] md:w-[268px]"
            />
            <PhoneShot
              src="/images/marketing/locations.png"
              alt="TipTrack locations list showing saved addresses, order counts, and tip values."
              className="absolute right-0 top-20 hidden h-[470px] w-[218px] rotate-[5deg] md:block"
            />
          </div>
        </div>
      </section>

      <section
        id="features"
        className="relative overflow-hidden border-b border-[#102117]/10 bg-[#f7f5ee] px-5 py-20 sm:px-8"
      >
        <div className="absolute inset-0 opacity-[0.28] [background-image:linear-gradient(115deg,transparent_0%,transparent_47%,rgba(20,122,52,0.16)_48%,transparent_49%),linear-gradient(25deg,transparent_0%,transparent_56%,rgba(16,33,23,0.12)_57%,transparent_58%)] [background-size:190px_190px]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-4xl font-black leading-tight tracking-normal text-[#12321f] sm:text-5xl">
              Built for the middle of a shift
            </h2>
            <p className="mt-4 max-w-lg text-lg leading-8 text-[#5b655d]">
              Capture the order now. Decide later with a ledger that remembers
              what your memory should not have to.
            </p>

            <div className="mt-10 space-y-6">
              {workflow.map((item, index) => (
                <div key={item.title} className="grid grid-cols-[3rem_1fr] gap-4">
                  <div className="relative flex justify-center">
                    {index < workflow.length - 1 ? (
                      <div className="absolute bottom-[-1.5rem] top-12 border-l border-dashed border-[#147a34]/50" />
                    ) : null}
                    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#147a34] text-white shadow-[0_10px_30px_rgba(20,122,52,0.22)]">
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#102117]">
                      {index + 1}. {item.title}
                    </h3>
                    <p className="mt-1 max-w-md leading-7 text-[#5b655d]">
                      {item.copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-12 -top-8 h-36 w-36 rounded-full border border-dashed border-[#147a34]/35" />
            <div className="relative rotate-[-1deg] rounded-md border border-[#d0c3a6] bg-[#f1e6c9] p-5 shadow-[0_24px_55px_rgba(49,41,24,0.18)] sm:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#88785a]/35 pb-4 font-mono text-sm uppercase tracking-[0.16em] text-[#564f3e]">
                <span>Today</span>
                <span>May 18, 2025</span>
              </div>
              <div className="overflow-hidden rounded-md border border-[#8d7d61]/35 bg-[#fff9e9]/75">
                <div className="grid grid-cols-[0.9fr_1.1fr_1.6fr_0.9fr] border-b border-[#8d7d61]/30 bg-[#e5d7b7]/45 px-4 py-3 font-mono text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#514631]">
                  <span>Time</span>
                  <span>Order ID</span>
                  <span>Address</span>
                  <span className="text-right">Tip</span>
                </div>
                {ledgerRows.map(([time, order, address, tip]) => (
                  <div
                    key={order}
                    className="grid grid-cols-[0.9fr_1.1fr_1.6fr_0.9fr] border-b border-[#8d7d61]/20 px-4 py-4 font-mono text-xs text-[#2c342b] last:border-b-0 sm:text-sm"
                  >
                    <span>{time}</span>
                    <span>{order}</span>
                    <span>{address}</span>
                    <span className="text-right font-black text-[#147a34]">
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr]">
                <div className="rounded-md border border-[#147a34] bg-[#fff9e9]/65 p-5">
                  <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#69705f]">
                    Orders
                  </div>
                  <div className="mt-2 text-4xl font-black text-[#102117]">
                    5
                  </div>
                </div>
                <div className="rounded-md border border-[#147a34] bg-[#fff9e9]/65 p-5">
                  <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#69705f]">
                    Total tips
                  </div>
                  <div className="mt-2 text-4xl font-black text-[#147a34]">
                    $52.66
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 right-8 hidden rotate-[-7deg] rounded-md border-2 border-[#c5923b] px-5 py-3 font-mono text-sm font-black uppercase tracking-[0.12em] text-[#8f6220] opacity-80 sm:block">
              Log it. Learn it.
            </div>
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="bg-[#0f351d] px-5 py-14 text-white sm:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_0.25fr_0.9fr] lg:items-center">
          <div className="relative rounded-md border border-[#f1e6c9]/45 bg-[#f1e6c9] p-8 text-[#102117] shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
            <div className="absolute -left-2 top-0 h-full w-4 bg-[radial-gradient(circle,#0f351d_4px,transparent_5px)] [background-size:16px_18px]" />
            <div className="font-mono text-sm uppercase tracking-[0.22em] text-[#796c51]">
              No credit card first
            </div>
            <div className="mt-3 text-5xl font-black leading-none">
              First 20 orders free
            </div>
            <p className="mt-4 max-w-md text-[#5a604f]">
              Put TipTrack through a real dinner rush before deciding whether it
              belongs on your phone.
            </p>
          </div>

          <div className="hidden justify-center lg:flex">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/45 text-[#f3b44f]">
              <ArrowRight className="h-7 w-7" aria-hidden="true" />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-[0.7fr_1fr] sm:items-center">
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-[#f3b44f]">
                Unlock everything
              </div>
              <div className="mt-2 text-7xl font-black leading-none">$4.99</div>
              <div className="mt-3 text-[#dbe9d8]">
                One-time payment. Yours forever.
              </div>
            </div>
            <div className="space-y-4">
              {[
                "Unlimited orders",
                "All reports",
                "Location history",
                "Works on iPhone and web",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#f3b44f]" aria-hidden="true" />
                  <span className="font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-[#fbfaf6] px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.35fr_0.65fr]">
          <div>
            <h2 className="text-4xl font-black text-[#102117]">FAQ</h2>
            <p className="mt-4 leading-7 text-[#667066]">
              Short answers for the practical stuff before TipTrack shows up in
              the App Store.
            </p>
          </div>
          <div className="divide-y divide-[#102117]/14 border-y border-[#102117]/14">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black text-[#102117]">
                  {faq.question}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#102117]/18 text-[#147a34] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl leading-7 text-[#5b655d]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#102117]/10 bg-[#f7f5ee] px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <WalletCards className="h-8 w-8 text-[#147a34]" aria-hidden="true" />
              <div className="text-3xl font-black">
                Tip<span className="text-[#168237]">Track</span>
              </div>
            </div>
            <p className="mt-3 max-w-sm leading-7 text-[#5b655d]">
              Built for drivers. Backed by data. Keep more of what you earn.
            </p>
            <p className="mt-5 text-sm text-[#7d847b]">
              (c) 2026 TipTrack. All rights reserved.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#147a34] bg-white px-5 py-3 text-sm font-semibold text-[#11672d] transition hover:bg-[#eaf5ed] focus:outline-none focus:ring-4 focus:ring-[#147a34]/15"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Open web app
            </Link>
            <AppStoreButton />
          </div>
        </div>
      </footer>
    </main>
  );
}
