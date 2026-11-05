"use client";

import { Building2, ChevronDown, Check } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface SimpleProperty {
  id: string;
  name: string;
  address?: string;
  city?: string;
}

interface PropertySelectorProps {
  properties: SimpleProperty[];
  selectedPropertyId?: string | null;
  allowAll?: boolean;
}

export function PropertySelector({
  properties,
  selectedPropertyId,
  allowAll = true,
}: PropertySelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentProperty = properties.find((p) => p.id === selectedPropertyId);
  const isAll = !selectedPropertyId || selectedPropertyId === "all";

  const handleSelect = (propertyId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!propertyId || propertyId === "all") {
      params.delete("property");
    } else {
      params.set("property", propertyId);
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    router.push(`${pathname}${query}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 px-3.5 rounded-xl border-border/80 bg-background hover:bg-muted/50 gap-2.5 font-medium text-sm text-foreground shadow-xs"
        >
          <div className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <span className="truncate max-w-[160px] sm:max-w-[200px] text-left">
            {isAll ? "All Properties (Consolidated)" : currentProperty?.name || "Select Property"}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto shrink-0 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 rounded-xl p-1.5 shadow-xl">
        <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1.5">
          Switch Property
        </DropdownMenuLabel>

        {allowAll && (
          <DropdownMenuItem
            onClick={() => handleSelect(null)}
            className="flex items-center justify-between rounded-lg px-2 py-2 text-sm cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-semibold text-foreground">All Properties</span>
            </div>
            {isAll && <Check className="w-4 h-4 text-primary" />}
          </DropdownMenuItem>
        )}

        {properties.length > 0 && allowAll && <DropdownMenuSeparator className="my-1" />}

        {properties.length === 0 ? (
          <div className="p-3 text-center text-xs text-muted-foreground">
            No properties registered yet.
          </div>
        ) : (
          properties.map((prop) => {
            const isSelected = selectedPropertyId === prop.id;
            return (
              <DropdownMenuItem
                key={prop.id}
                onClick={() => handleSelect(prop.id)}
                className="flex items-center justify-between rounded-lg px-2 py-2 text-sm cursor-pointer"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="font-medium text-foreground truncate">{prop.name}</span>
                  {prop.city && (
                    <span className="text-xs text-muted-foreground truncate">{prop.city}</span>
                  )}
                </div>
                {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

