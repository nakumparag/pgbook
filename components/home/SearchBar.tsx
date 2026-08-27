"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explore?city=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form 
      onSubmit={handleSearch}
      className={cn(
        "flex flex-col sm:flex-row items-center w-full max-w-2xl bg-card border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-3xl sm:rounded-full p-2 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] focus-within:ring-2 focus-within:ring-primary/20",
        className
      )}
    >
      <div className="flex-1 flex items-center gap-3 px-6 py-2 w-full h-12">
        <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: "22px", lineHeight: 1, fontVariationSettings: "'FILL' 1", color: "var(--text-muted)" }}>location_on</span>
        <input
          type="text"
          placeholder="Search by your nearby location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent border-none outline-none placeholder:text-muted-foreground font-medium text-[15px] p-0 focus:ring-0 h-full"
        />
      </div>
      
      <button 
        type="submit" 
        className="w-full sm:w-auto bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-2xl sm:rounded-full h-12 px-8 flex items-center justify-center gap-2 transition-colors mt-2 sm:mt-0 font-semibold shrink-0"
      >
        <span>Search</span>
      </button>
    </form>
  );
}
