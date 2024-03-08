"use client";

import {
  LucidePackagePlus,
  LucidePackageSearch,
  LucideBarChart2,
  LucideWarehouse,
} from "lucide-react";
import { Button } from "./button";
import { usePathname } from "next/navigation";
import Link from "next/link";

export const Navigation = () => {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 flex flex-row space-x-1 justify-around bg-zinc-800/60 px-4 py-2 pb-safe border-t-4 border-t-zinc-900/50">
      <Button
        variant="icon"
        size={"icon"}
        type="button"
        asChild
        data-active={pathname.includes("submit")}
      >
        <Link href="/submit">
          <LucidePackagePlus size={36} />
        </Link>
      </Button>
      <Button
        variant="icon"
        size={"icon"}
        type="button"
        asChild
        data-active={pathname.includes("search/orders")}
      >
        <Link href="/search/orders">
          <LucidePackageSearch size={36} />
        </Link>
      </Button>
      <Button
        variant="icon"
        size={"icon"}
        type="button"
        asChild
        data-active={pathname.includes("search/locations")}
      >
        <Link href="/search/locations">
          <LucideWarehouse size={36} />
        </Link>
      </Button>
      <Button
        variant="icon"
        size={"icon"}
        type="button"
        asChild
        data-active={pathname.includes("reports")}
      >
        <Link href="/reports">
          <LucideBarChart2 size={36} />
        </Link>
      </Button>
    </nav>
  );
};
