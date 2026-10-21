"use client";

import { useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, type InputProps } from "@/components/ui/input";

type PasswordInputProps = InputProps & {
  leadingIcon?: ReactNode;
  toggleClassName?: string;
};

export function PasswordInput({
  className,
  leadingIcon,
  toggleClassName,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      {leadingIcon && (
        <span
          aria-hidden="true"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          {leadingIcon}
        </span>
      )}
      <Input
        {...props}
        type={isVisible ? "text" : "password"}
        className={cn("pr-12", leadingIcon && "pl-11", className)}
      />
      <button
        type="button"
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((visible) => !visible)}
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          toggleClassName,
        )}
      >
        {isVisible ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
      </button>
    </div>
  );
}
