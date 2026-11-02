import Link from "next/link";
import { ArrowUpRight, Check, type LucideIcon } from "lucide-react";

import { PhoneScreenshot } from "@/components/static-images";

type ScreenshotName = "add-order" | "locations" | "reports";

type GuideStep = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type RelatedGuide = {
  href: string;
  title: string;
  description: string;
};

type TipTrackGuidePageProps = {
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  intro: string;
  appStoreUrl: string;
  heroImage: ScreenshotName;
  heroAlt: string;
  steps: GuideStep[];
  manualLogTitle: string;
  manualLogParagraphs: string[];
  secondaryImage: ScreenshotName;
  secondaryAlt: string;
  relatedGuides: RelatedGuide[];
};

export function TipTrackGuidePage({
  path,
  title,
  description,
  eyebrow,
  intro,
  appStoreUrl,
  heroImage,
  heroAlt,
  steps,
  manualLogTitle,
  manualLogParagraphs,
  secondaryImage,
  secondaryAlt,
  relatedGuides,
}: TipTrackGuidePageProps) {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    mainEntityOfPage: `https://usetiptrack.com${path}`,
    author: {
      "@type": "Organization",
      name: "TipTrack",
    },
    publisher: {
      "@type": "Organization",
      name: "TipTrack",
      url: "https://usetiptrack.com",
    },
  };

  return (
    <main className="min-h-screen bg-[#f4ead1] text-[#132114]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
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
                {eyebrow}
              </p>
              <h1 className="mt-5 text-5xl font-black leading-[0.95] sm:text-7xl">{title}</h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#d8cba8] sm:text-xl">{intro}</p>
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
                image={heroImage}
                alt={heroAlt}
                className="h-auto w-full rounded-[1.35rem]"
                priority
              />
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#315020]">
              A simple manual routine
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map(({ icon: Icon, title: stepTitle, description: stepDescription }, index) => (
                <section
                  key={stepTitle}
                  className="rounded-md border border-[#c8b785] bg-[#eadfbe] p-7 shadow-[0_18px_48px_rgba(74,53,19,0.1)]"
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-7 w-7 text-[#2f7b35]" aria-hidden="true" />
                    <span className="font-mono text-xs font-black text-[#746240]">0{index + 1}</span>
                  </div>
                  <h2 className="mt-9 text-2xl font-black text-[#17351e]">{stepTitle}</h2>
                  <p className="mt-3 leading-7 text-[#4f594b]">{stepDescription}</p>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#17351e] px-5 py-20 text-[#fff8df] sm:px-8">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.44fr_1fr] lg:items-center">
            <div className="mx-auto w-full max-w-[14rem] -rotate-[3deg] rounded-[1.8rem] border-[8px] border-black bg-black shadow-[0_30px_70px_rgba(0,0,0,0.32)]">
              <PhoneScreenshot
                image={secondaryImage}
                alt={secondaryAlt}
                className="h-auto w-full rounded-[1.1rem]"
              />
            </div>
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#b8f26d]">
                A personal log, not an estimate
              </p>
              <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">{manualLogTitle}</h2>
              {manualLogParagraphs.map((paragraph) => (
                <p key={paragraph} className="mt-5 max-w-2xl text-lg leading-8 text-[#d8cba8]">
                  {paragraph}
                </p>
              ))}
              <p className="mt-6 flex max-w-2xl items-start gap-3 text-base leading-7 text-[#e8f6dc]">
                <Check className="mt-1 h-5 w-5 shrink-0 text-[#b8f26d]" aria-hidden="true" />
                TipTrack records the order IDs, addresses, and tip ranges you choose to save. It does not connect to delivery-platform accounts or calculate exact payouts, mileage, or earnings.
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#315020]">
              More iPhone delivery-log guides
            </p>
            <div className="mt-7 grid gap-5 md:grid-cols-3">
              {relatedGuides.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="group rounded-md border border-[#c8b785] bg-[#eadfbe] p-6 shadow-[0_18px_48px_rgba(74,53,19,0.1)] transition hover:-translate-y-1 hover:border-[#2f7b35]"
                >
                  <h2 className="text-xl font-black text-[#17351e] group-hover:text-[#2f7b35]">{guide.title}</h2>
                  <p className="mt-3 leading-7 text-[#4f594b]">{guide.description}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#17351e]">
                    Read the guide <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#050705] px-5 py-16 text-center text-[#fff8df] sm:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-4xl font-black leading-tight sm:text-5xl">Start with the next completed delivery.</h2>
            <p className="mt-5 text-lg leading-8 text-[#d8cba8]">
              Log the order while it is fresh, update the saved tip range later when needed, and keep the history you chose to record available on iPhone.
            </p>
            <a
              href={appStoreUrl}
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#f8f1dc] px-5 py-3 text-sm font-black text-[#11150f] transition hover:-translate-y-0.5 hover:bg-white"
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
