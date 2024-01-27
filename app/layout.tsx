import type { Metadata } from "next";
import Link from "next/link";
import { Montserrat as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import {
  LucideBadgeDollarSign,
  LucidePackagePlus,
  LucidePackageSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Tip Track",
  description: "Track DoorDash Tips by Address",
};

export const fontSans = FontSans({
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
          "flex flex-col min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <main className="flex-1 flex flex-col items-center justify-between px-4 py-8">
          {children}
        </main>
        <nav className="flex flex-row space-x-4 justify-around bg-primary px-4 py-2 border-t-4 border-t-zinc-700/90">
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
