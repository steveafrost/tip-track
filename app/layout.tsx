import type { Metadata } from "next";
import Link from "next/link";
import { Montserrat as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import {
  LucideBadgeDollarSign,
  LucidePackagePlus,
  LucidePackageSearch,
  WalletIcon,
} from "lucide-react";
import { Button } from "@/components/button";

export const metadata: Metadata = {
  title: "Tip Track",
  description: "Track DoorDash Tips by Address",
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
        <div className="flex space-x-2 items-center p-4">
          <WalletIcon size={50} className="fill-white stroke-slate-700" />
          <h2 className="text-4xl text-transparent font-bold text-white text-real-stroke">
            Tip Track
          </h2>
        </div>
        <main className="flex-1 flex flex-col px-4">{children}</main>
        <nav className="flex flex-row space-x-4 justify-around bg-primary px-4 py-2 border-t-2 border-t-zinc-200">
          <Button variant="icon" size={"icon"} type="button" asChild>
            <Link href="/">
              <LucideBadgeDollarSign size={36} />
            </Link>
          </Button>
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
        </nav>
      </body>
    </html>
  );
}
