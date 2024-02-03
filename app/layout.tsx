import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Link from "next/link";
import { Montserrat as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { BadgeInfoIcon, WalletIcon } from "lucide-react";
import { Button } from "@/components/button";
import { Toaster } from "sonner";
import { Navigation } from "@/components/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/dialog";

export const metadata: Metadata = {
  title: "Tip Track",
  description: "Track Tips by Address",
  manifest: "/manifest.json",
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
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={cn(
            "flex flex-col h-[100dvh] bg-background font-sans antialiased bg-home bg-no-repeat bg-cover",
            fontSans.variable
          )}
        >
          <header className="flex justify-between px-3 py-5 items-center">
            <Button
              size={"logo"}
              variant={"logo"}
              className="flex space-x-2 items-center"
              asChild
            >
              <Link href="/">
                <WalletIcon
                  size={50}
                  className="stroke-zinc-800 drop-shadow-md"
                />
                <h2 className="text-4xl text-transparent font-bold text-zinc-800 drop-shadow-md">
                  Tip Track
                </h2>
              </Link>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <BadgeInfoIcon
                  size={40}
                  className="stroke-zinc-800 drop-shadow-md mr-2"
                />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader className="text-3xl font-semibold">
                  Help
                </DialogHeader>
                <div className="flex flex-col space-y-4 items-start justify-start ">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Track Orders</h3>
                    <p>
                      As orders are accepted, add the order to the app to keep
                      track of the order as well as the location. If a location
                      has multiple orders, all will be listed on the lookup
                      page.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Record Tips</h3>
                    <p>
                      Keep track of your earnings accurately with our built-in
                      tip recording. Enter your tips after every shift to
                      provide a comprehensive summary of your daily, weekly, or
                      monthly earnings.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">View Average Tips</h3>
                    <p>
                      Using the lookup page, you can view the average tips for a
                      specific location.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </header>
          <main className="flex-1 flex flex-col px-4">{children}</main>
          <Navigation />
          <Toaster position="top-center" richColors={true} />
        </body>
      </html>
    </ClerkProvider>
  );
}
