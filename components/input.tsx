import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full border-zinc-950/25 font-semibold border-2 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-800/75 hover:text-zinc-50 rounded-md hover:border-zinc-900 px-3 py-4 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
