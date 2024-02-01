import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Montserrat as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import {
  LucideBarChart2,
  LucidePackagePlus,
  LucidePackageSearch,
  WalletIcon,
} from "lucide-react";
import { Button } from "@/components/button";

export const metadata: Metadata = {
  title: "Tip Track",
  description: "Track Tips by Address",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#00852a",
  userScalable: false,
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
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
  return (
    <html lang="en">
      <body
        className={cn(
          "flex flex-col h-[100dvh] bg-background font-sans antialiased bg-home",
          fontSans.variable
        )}
      >
        <Button
          size={"logo"}
          variant={"logo"}
          className="px-3 flex space-x-2 items-center my-4"
          asChild
        >
          <Link href="/">
            <WalletIcon size={50} className="fill-white stroke-slate-700" />
            <h2 className="text-4xl text-transparent font-bold text-white text-real-stroke">
              Tip Track
            </h2>
          </Link>
        </Button>
        <main className="flex-1 flex flex-col px-4">{children}</main>
        <nav className="sticky bottom-0 flex flex-row space-x-4 justify-around bg-primary px-4 py-2 border-t-2 border-t-zinc-200">
          <Button variant="icon" size={"icon"} type="button" asChild>
            <Link href="/submit">
              <LucidePackagePlus size={36} />
            </Link>
          </Button>
          <Button variant="icon" size={"icon"} type="button" asChild>
            <Link href="/search">
              <LucidePackageSearch size={36} />
            </Link>
          </Button>
          <Button variant="icon" size={"icon"} type="button" asChild>
            <Link href="/reports">
              <LucideBarChart2 size={36} />
            </Link>
          </Button>
        </nav>
      </body>
    </html>
  );
}
