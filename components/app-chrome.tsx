"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeInfoIcon, WalletIcon } from "lucide-react";

import { Button } from "@/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/dialog";
import { Navigation } from "@/components/navigation";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/submit") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-background bg-home bg-cover bg-no-repeat">
      <header className="flex items-center justify-between px-3 py-5">
        <Button
          size="logo"
          variant="logo"
          className="flex items-center space-x-2"
          asChild
        >
          <Link href="/">
            <WalletIcon
              size={50}
              className="stroke-zinc-800 drop-shadow-md"
            />
            <h2 className="text-4xl font-bold text-zinc-800 drop-shadow-md">
              Tip Track
            </h2>
          </Link>
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <button aria-label="Help" type="button">
              <BadgeInfoIcon
                size={40}
                className="mr-2 stroke-zinc-800 drop-shadow-md"
              />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className="text-3xl font-semibold">
              Help
            </DialogHeader>
            <div className="flex flex-col items-start justify-start space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Track Orders</h3>
                <p>
                  As orders are accepted, add the order to keep track of the
                  order and the location. If a location has multiple orders, all
                  will be listed on the lookup page.
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Record Tips</h3>
                <p>
                  Enter tips after every delivery or shift to build a practical
                  history of order outcomes.
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">View Average Tips</h3>
                <p>
                  Use location lookup to review saved orders and average tips
                  for repeat delivery addresses.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>
      <main className="flex flex-1 flex-col px-4">{children}</main>
      <Navigation />
    </div>
  );
}
