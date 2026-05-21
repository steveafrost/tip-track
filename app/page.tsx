import Link from "next/link";
import {
  LogoImage,
  MarketingHeroImage,
  PhoneScreenshot,
} from "@/components/static-images";
import {
  ArrowRight,
  Apple,
  BarChart3,
  Check,
  Download,
  MapPin,
  NotebookPen,
  Route,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";

const appStoreUrl = "https://apps.apple.com/app/id6771138274";

const logRows = [
  ["6:34 PM", "#8337", "3217 Elmwood Ave", "$8.25", "Leave at door"],
  ["6:58 PM", "#8338", "8687 Pinecrest Dr", "$5.00", "Nice porch light"],
  ["7:18 PM", "#8342", "1504 Brookside Dr", "$12.50", "Cash tip"],
  ["7:45 PM", "#8345", "412 Riverview Ln", "$7.75", "Gate code needed"],
  ["8:12 PM", "#8349", "9800 Maplewood Ave", "$18.24", "Best tip tonight"],
];

const fieldNotes = [
  "Log every order before the shift blurs together.",
  "Track tips, addresses, and repeat neighborhoods.",
  "Keep private notes for the next time an address pops up.",
  "Use reports to spot which runs were actually worth it.",
];

const faqs = [
  {
    question: "How do the free orders work?",
    answer:
      "Your first 20 orders are free. After that, unlock the full app for $4.99 once.",
  },
  {
    question: "Is my data safe?",
    answer:
      "TipTrack is built for a private delivery log. Your routes, notes, and totals stay tied to your account.",
  },
  {
    question: "Can I use it on the web?",
    answer:
      "Yes. The web app is there when you are away from your phone or want a bigger screen.",
  },
  {
    question: "Will this become a subscription later?",
    answer:
      "No. TipTrack Pro is a one-time unlock. No monthly fees, no surprise renewal.",
  },
];

function AppStoreButton({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href={appStoreUrl}
      className="inline-flex min-h-12 items-center justify-center gap-3 whitespace-nowrap rounded-md border border-[#fff1c8]/45 bg-[#f8f1dc] px-5 py-3 text-sm font-black text-[#11150f] shadow-[0_18px_42px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#8bc34a]/35"
    >
      {compact ? (
        <Apple className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Download className="h-5 w-5" aria-hidden="true" />
      )}
      <span>{compact ? "Download" : "Download on the App Store"}</span>
    </a>
  );
}

function PhoneShot({
  image,
  alt,
  className = "",
}: {
  image: "add-order" | "locations" | "reports";
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-[2rem] border-[9px] border-[#070b08] bg-[#070b08] shadow-[0_34px_80px_rgba(0,0,0,0.42)] ${className}`}
    >
      <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-[#070b08]" />
      <PhoneScreenshot
        image={image}
        alt={alt}
        className="h-full w-full rounded-[1.35rem] object-cover"
        priority={image === "add-order"}
      />
    </div>
  );
}

function BrandStamp() {
  return (
    <Link
      href="/"
      className="inline-flex items-center"
      aria-label="TipTrack home"
    >
      <LogoImage className="rounded-md" priority />
    </Link>
  );
}

function TornEdge({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={`h-8 ${dark ? "bg-[#0b0d0a]" : "bg-[#f4ead1]"} [clip-path:polygon(0_35%,4%_54%,9%_30%,15%_56%,21%_38%,27%_62%,34%_36%,41%_58%,48%_33%,56%_61%,63%_36%,71%_57%,79%_39%,87%_61%,94%_36%,100%_52%,100%_100%,0_100%)]`}
    />
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4ead1] text-[#132114]">
      <section className="relative min-h-[790px] overflow-hidden bg-[#050705] text-[#fff8df]">
        <MarketingHeroImage />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.76)_38%,rgba(0,0,0,0.24)_72%,rgba(0,0,0,0.42)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,transparent_28%,rgba(0,0,0,0.78)_100%)]" />
        <div className="absolute left-0 top-0 h-full w-full opacity-[0.13] [background-image:linear-gradient(0deg,transparent_31px,rgba(168,255,93,0.24)_32px),linear-gradient(90deg,transparent_31px,rgba(168,255,93,0.14)_32px)] [background-size:33px_33px]" />

        <header className="relative z-20">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
            <BrandStamp />
            <div className="hidden items-center gap-8 font-mono text-xs font-black uppercase tracking-[0.18em] text-[#fff8df] md:flex">
              <a href="#sheet" className="hover:text-[#b8f26d]">
                Sheet
              </a>
              <a href="#log" className="hover:text-[#b8f26d]">
                Log
              </a>
              <a href="#pricing" className="hover:text-[#b8f26d]">
                Pricing
              </a>
              <Link
                href="/app"
                className="rounded-sm border border-[#b8f26d]/70 px-3 py-2 text-[#b8f26d] hover:bg-[#b8f26d] hover:text-[#101510]"
              >
                Open web app
              </Link>
            </div>
          </nav>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[0.78fr_0.45fr] lg:items-end lg:pt-16">
          <div className="min-w-0 max-w-[22rem] sm:max-w-3xl">
            <h1 className="max-w-full text-[3.2rem] font-black leading-[0.9] tracking-normal text-white sm:text-[6.5rem] lg:text-[8.2rem]">
              <span className="block">TipTrack</span>
              <span className="block">Shift</span>
              <span className="block">Log</span>
            </h1>
            <p className="mt-8 max-w-full font-mono text-2xl leading-tight text-[#fff1c8] sm:max-w-2xl sm:text-3xl">
              Know which deliveries are worth remembering.
            </p>
            <p className="mt-5 max-w-full text-lg leading-8 text-[#d8cba8] sm:max-w-xl">
              A private order log for the parts of a delivery shift that
              matter after the headlights, receipts, and addresses blur
              together.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <AppStoreButton />
              <Link
                href="/app"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#8bc34a]/80 bg-[#152416]/70 px-5 py-3 text-sm font-black text-[#e7ffd1] shadow-[0_18px_42px_rgba(0,0,0,0.22)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-[#8bc34a] hover:text-[#071007] focus:outline-none focus:ring-4 focus:ring-[#8bc34a]/35"
              >
                Open web app
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="relative hidden min-h-[400px] lg:block">
            <div className="absolute right-0 top-0 w-64 rotate-[4deg] border border-[#d6c28d] bg-[#ead9a8] p-5 font-mono text-[#24311f] shadow-[0_24px_70px_rgba(0,0,0,0.36)]">
              <div className="border-b border-[#7b6c4b]/30 pb-3 text-xs uppercase tracking-[0.2em]">
                Order #8342
              </div>
              <div className="mt-4 text-5xl font-black">$12.50</div>
              <div className="mt-2 text-sm">7:18 PM / 2.3 mi</div>
              <ul className="mt-5 space-y-2 text-sm">
                <li>[x] leave at door</li>
                <li>[x] cash tip</li>
                <li>[x] save address</li>
              </ul>
            </div>
            <div className="absolute bottom-2 right-24 rotate-[-5deg] border-2 border-[#8f2d22] bg-[#f2e4be] px-8 py-5 text-center font-mono text-[#315020] shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
              <div className="text-xs uppercase tracking-[0.2em] text-[#8f2d22]">
                Tonight&apos;s total
              </div>
              <div className="mt-2 text-5xl font-black">$156.78</div>
              <div className="mt-2 inline-block border border-[#8f2d22] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#8f2d22]">
                Worth it
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20">
          <TornEdge />
        </div>
      </section>

      <section
        id="sheet"
        className="relative overflow-hidden bg-[#f4ead1] px-5 py-20 sm:px-8"
      >
        <div className="absolute inset-0 opacity-[0.2] [background-image:linear-gradient(115deg,transparent_0%,transparent_48%,rgba(17,78,38,0.22)_49%,transparent_50%)] [background-size:150px_150px]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.55fr_0.9fr_0.65fr] lg:items-center">
          <div className="rotate-[-4deg] border border-[#c8b785] bg-[#eadfbe] p-6 font-mono shadow-[0_26px_70px_rgba(74,53,19,0.15)]">
            <div className="h-64 border border-[#9bb678]/50 bg-[linear-gradient(135deg,rgba(20,105,47,0.1)_25%,transparent_25%),linear-gradient(225deg,rgba(20,105,47,0.08)_25%,transparent_25%)] bg-[length:42px_42px] p-5">
              <Route className="h-20 w-20 text-[#2f7b35]" aria-hidden="true" />
              <p className="mt-14 max-w-40 text-sm leading-6 text-[#26331f]">
                Good tips live on this side of town.
              </p>
            </div>
            <div className="mt-5 text-xs uppercase tracking-[0.22em] text-[#315020]">
              42.3314 N
              <br />
              83.0458 W
              <br />
              Detroit, MI
            </div>
          </div>

          <div>
            <h2 className="font-mono text-4xl font-black uppercase leading-tight tracking-[0.08em] text-[#17351e] sm:text-5xl">
              Your working shift, on paper.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#4f594b]">
              TipTrack keeps the notebook feeling but removes the guessing. Log
              the order, remember the address, and let the totals tell you where
              the night actually paid off.
            </p>
            <div className="mt-8 space-y-3">
              {fieldNotes.map((note) => (
                <div key={note} className="flex gap-3 font-mono text-sm">
                  <Check
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#2f7b35]"
                    aria-hidden="true"
                  />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto min-h-[980px] w-full max-w-[18rem] sm:min-h-[520px] sm:max-w-[28rem] lg:mx-0 lg:max-w-none">
            <PhoneShot
              image="add-order"
              alt="TipTrack add order screen."
              className="absolute left-1/2 top-0 h-[500px] w-[232px] -translate-x-1/2 rotate-[-3deg] sm:-translate-x-[84%] lg:left-0 lg:translate-x-0"
            />
            <PhoneShot
              image="locations"
              alt="TipTrack saved locations screen."
              className="absolute left-1/2 top-[500px] h-[470px] w-[218px] -translate-x-1/2 rotate-[4deg] sm:top-14 sm:-translate-x-[16%] lg:left-auto lg:right-0 lg:translate-x-0"
            />
          </div>
        </div>
      </section>

      <section id="log" className="bg-[#0b0d0a] px-5 py-16 text-[#f5ead0] sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#f5ead0]/20 pb-5 font-mono uppercase tracking-[0.16em]">
            <h2 className="text-2xl font-black">Today&apos;s delivery log</h2>
            <span className="text-sm text-[#b8f26d]">18 orders / May 18, 2025</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse font-mono text-sm">
              <thead>
                <tr className="border-b border-[#f5ead0]/18 text-left text-[#8bc34a]">
                  {["Time", "Order", "Address", "Tip", "Notes"].map((head) => (
                    <th key={head} className="px-4 py-4 font-black uppercase tracking-[0.16em]">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logRows.map((row) => (
                  <tr
                    key={row[1]}
                    className={`border-b border-[#f5ead0]/12 ${row[1] === "#8342" ? "bg-[#244b1f]/42 text-[#b8f26d]" : ""}`}
                  >
                    {row.map((cell) => (
                      <td key={cell} className="px-4 py-5">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-end gap-5">
            <div className="font-mono text-2xl text-[#f5ead0]">Keep going.</div>
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="relative overflow-hidden bg-[#f4ead1] px-5 py-20 sm:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.65fr_0.7fr_0.45fr] lg:items-center">
          <div className="relative rotate-[-3deg] border border-[#c7b37b] bg-[#ead9a8] p-8 font-mono shadow-[0_26px_80px_rgba(74,53,19,0.18)]">
            <div className="absolute -left-2 top-0 h-full w-4 bg-[radial-gradient(circle,#f4ead1_4px,transparent_5px)] [background-size:16px_18px]" />
            <div className="text-sm uppercase tracking-[0.28em] text-[#746240]">
              First 20 orders
            </div>
            <div className="mt-3 text-7xl font-black uppercase leading-none">
              Free
            </div>
            <div className="mt-5 border-t border-dashed border-[#746240]/55 pt-5 text-sm">
              Then a one-time unlock.
            </div>
            <div className="mt-4 text-7xl font-black text-[#315020]">$4.99</div>
            <div className="mt-5 inline-block rotate-[-2deg] border-2 border-[#8f2d22] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-[#8f2d22]">
              One-time unlock
            </div>
          </div>

          <div>
            <h2 className="font-mono text-4xl font-black uppercase leading-tight tracking-[0.08em] text-[#17351e]">
              Unlock the full log
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#4f594b]">
              After 20 orders, keep unlimited logging, full reports, and saved
              address history with a single purchase. No subscription rhythm
              hiding inside a simple app.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Unlimited orders",
                "Location history",
                "Shift and weekly reports",
                "Works on iPhone and web",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 font-mono text-sm">
                  <Check className="h-5 w-5 text-[#2f7b35]" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <PhoneShot
            image="reports"
            alt="TipTrack reports screen showing weekly totals."
            className="mx-auto h-[500px] w-[232px] rotate-[3deg]"
          />
        </div>
      </section>

      <section id="faq" className="bg-[#f4ead1] px-5 pb-20 sm:px-8">
        <div className="mx-auto max-w-7xl border-t border-[#1b2a1c]/25 pt-12">
          <h2 className="font-mono text-3xl font-black uppercase tracking-[0.1em]">
            FAQ
          </h2>
          <div className="mt-8 grid gap-8 md:grid-cols-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="border-l border-[#1b2a1c]/30 pl-5">
                <h3 className="font-mono text-sm font-black uppercase leading-6">
                  {faq.question}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#4f594b]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative bg-[#0b0d0a] px-5 py-10 text-[#f5ead0] sm:px-8">
        <TornEdge dark />
        <div className="mx-auto mt-6 grid max-w-7xl gap-10 md:grid-cols-[0.9fr_0.6fr_0.8fr] md:items-end">
          <div>
            <BrandStamp />
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#b9ad8f]">
              Track today. Remember tomorrow. Earn more.
            </p>
          </div>
          <div className="grid gap-2 font-mono text-xs uppercase tracking-[0.16em] text-[#b9ad8f]">
            <a href="#sheet" className="hover:text-[#b8f26d]">
              Sheet
            </a>
            <a href="#log" className="hover:text-[#b8f26d]">
              Log
            </a>
            <a href="#pricing" className="hover:text-[#b8f26d]">
              Pricing
            </a>
            <Link href="/app" className="hover:text-[#b8f26d]">
              Open web app
            </Link>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Link
              href="/app"
              className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-[#8bc34a]/60 px-5 py-3 text-sm font-black text-[#e7ffd1] transition hover:bg-[#8bc34a] hover:text-[#071007]"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Open web app
            </Link>
            <AppStoreButton compact />
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl items-center justify-between border-t border-[#f5ead0]/15 pt-5 font-mono text-xs uppercase tracking-[0.14em] text-[#847b65]">
          <span>(c) 2026 TipTrack</span>
          <span className="hidden sm:inline-flex items-center gap-2">
            <Truck className="h-4 w-4" aria-hidden="true" />
            Built for drivers
          </span>
        </div>
      </footer>
    </main>
  );
}
