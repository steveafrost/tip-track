import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { Montserrat as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { AppChrome } from "@/components/app-chrome";

const siteUrl = "https://usetiptrack.com";
const shareImage = "/images/campaign/tiptrack-ios-share-card.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TipTrack: Delivery Tip Tracker for iPhone",
    template: "%s | TipTrack",
  },
  description:
    "Track delivery orders and tip ranges by address. Update delayed tips, review repeat locations, and log faster with Shortcuts and Siri.",
  applicationName: "TipTrack",
  keywords: [
    "delivery tip tracker",
    "delivery driver log",
    "tip history",
    "address history",
    "iPhone delivery app",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TipTrack",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TipTrack: Delivery Tip Tracker for iPhone",
    description:
      "Track delivery orders and tip ranges by address. Update delayed tips, review repeat locations, and log faster with Shortcuts and Siri.",
    url: siteUrl,
    siteName: "TipTrack",
    type: "website",
    images: [
      {
        url: shareImage,
        width: 1200,
        height: 630,
        alt: "TipTrack on iPhone: delivery order history, repeat addresses, and delayed-tip updates.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TipTrack: Delivery Tip Tracker for iPhone",
    description:
      "Track delivery orders and tip ranges by address, with quick updates through Shortcuts and Siri.",
    images: [shareImage],
  },
  category: "Productivity",
};

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  themeColor: "#00852a",
  userScalable: false,
  viewportFit: "cover",
  width: "device-width",
};

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const document = (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-white font-sans antialiased",
          fontSans.variable
        )}
      >
        <AppChrome>{children}</AppChrome>
        <Toaster position="top-center" richColors={true} />
        <Analytics />
      </body>
    </html>
  );

  return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
    <ClerkProvider afterSignOutUrl="/app">{document}</ClerkProvider>
  ) : (
    document
  );
}
