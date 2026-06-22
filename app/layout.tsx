import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Montserrat as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { AppChrome } from "@/components/app-chrome";

export const metadata: Metadata = {
  metadataBase: new URL("https://usetiptrack.com"),
  title: "TipTrack Delivery Log",
  description:
    "A delivery driver tip tracker for logging orders, addresses, tip patterns, and quick updates through Shortcuts and Siri.",
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TipTrack Delivery Log",
    description:
      "A delivery driver tip tracker for logging orders, addresses, tip patterns, and quick updates through Shortcuts and Siri.",
    url: "https://usetiptrack.com",
    siteName: "TipTrack",
    type: "website",
  },
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
      </body>
    </html>
  );

  return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
    <ClerkProvider>{document}</ClerkProvider>
  ) : (
    document
  );
}
