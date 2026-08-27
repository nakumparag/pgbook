"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const categories = [
  { id: "rooms", name: "Rooms", icon: "bed" },
  { id: "mansions", name: "Mansions", icon: "castle" },
  { id: "trending", name: "Trending", icon: "local_fire_department" },
  { id: "pools", name: "Amazing pools", icon: "pool" },
  { id: "apartments", name: "Apartments", icon: "apartment" },
  { id: "countryside", name: "Countryside", icon: "park" },
  { id: "beachfront", name: "Beachfront", icon: "beach_access" },
  { id: "cabins", name: "Cabins", icon: "cabin" },
  { id: "luxe", name: "Luxe", icon: "diamond" },
  { id: "new", name: "New", icon: "new_releases" },
  { id: "top_cities", name: "Top cities", icon: "location_city" },
  { id: "design", name: "Design", icon: "architecture" },
];

export function CategoryBar() {
  const [active, setActive] = useState("rooms");

  return (
    <div className="sticky top-20 z-40 bg-background border-b border-border shadow-[0_4px_6px_-6px_rgba(0,0,0,0.1)]">
      <div className="container flex items-center h-19.5">
        
        {/* Scrollable Categories List */}
        <div className="flex-1 overflow-x-auto no-scrollbar py-2">
          <div className="flex gap-8 items-center min-w-max">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 min-w-14 pb-3 border-b-2 transition-all hover:text-foreground",
                  active === cat.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border"
                )}
              >
                <span style={{ 
                  fontFamily: "'Material Symbols Rounded'", 
                  fontSize: "24px", 
                  lineHeight: 1, 
                  fontVariationSettings: active === cat.id ? "'FILL' 1" : "'FILL' 0" 
                }}>
                  {cat.icon}
                </span>
                <span className="text-xs font-medium whitespace-nowrap">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters Button (Right aligned) */}
        <div className="hidden md:flex pl-4 shrink-0">
          <button className="flex items-center gap-2 border border-border rounded-xl px-4 py-2 hover:border-foreground transition-colors">
            <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: "16px", lineHeight: 1 }}>tune</span>
            <span className="text-sm font-semibold">Filters</span>
          </button>
        </div>
        
      </div>
    </div>
  );
}
