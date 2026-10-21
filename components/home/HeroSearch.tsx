"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Wallet, Home, Utensils } from "lucide-react";
import { GUJARAT_CITIES } from "@/lib/gujarat-cities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const POPULAR_SEARCHES: Array<{ label: string; params: Record<string, string> }> = [
  { label: "PG in Ahmedabad", params: { city: "ahmedabad" } },
  { label: "PG in Sola", params: { city: "ahmedabad", area: "sola" } },
  { label: "Girls PG in Ahmedabad", params: { city: "ahmedabad", gender: "girls" } },
  { label: "PG under ₹7,000", params: { budget: "under-7000" } },
  { label: "PG in Thaltej", params: { city: "ahmedabad", area: "thaltej" } },
  { label: "Boys PG in Surat", params: { city: "surat", gender: "boys" } },
  { label: "Co-Living Ahmedabad", params: { city: "ahmedabad", gender: "unisex" } },
];

export function HeroSearch() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [roomType, setRoomType] = useState("");
  const [food, setFood] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (budget) params.append("budget", budget);
    if (roomType) params.append("roomType", roomType);
    if (food) params.append("food", food);
    router.push(params.size ? `/explore?${params.toString()}` : "/explore");
  };

  const handleChipClick = (search: (typeof POPULAR_SEARCHES)[number]) => {
    router.push(`/explore?${new URLSearchParams(search.params).toString()}`);
  };

  return (
    <div className="w-full">
      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className="bg-white dark:bg-card rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-border/50 overflow-hidden"
        role="search"
        aria-label="Search for PGs"
      >
        {/* Search Fields Row */}
        <div className="flex flex-col md:flex-row">

          {/* Location Field */}
          <div className="flex-1 flex items-center gap-3 px-6 py-4 md:py-6 hover:bg-muted/30 transition-colors group border-b md:border-b-0 md:border-r border-border/50">
            <MapPin className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
            <div className="flex flex-col flex-1 min-w-0">
              <label htmlFor="location-input" className="text-xs font-bold text-foreground mb-0.5 uppercase tracking-wide">
                Where?
              </label>
              <input
                id="location-input"
                type="text"
                placeholder="City or locality..."
                className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-label="Search location"
                list="gujarat-city-options"
              />
              <datalist id="gujarat-city-options">
                {GUJARAT_CITIES.map((city) => <option key={city} value={city} />)}
              </datalist>
            </div>
          </div>

          {/* Budget Field */}
          <div className="shrink-0 md:w-40 border-b md:border-b-0 md:border-r border-border/50">
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger
                className="w-full h-full border-none bg-transparent shadow-none focus:ring-0 rounded-none px-6 py-4 md:py-6 hover:bg-muted/30 transition-colors gap-3"
                aria-label="Select budget"
              >
                <Wallet className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                <div className="flex flex-col items-start text-left flex-1">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wide">Budget</span>
                  <SelectValue placeholder="Any budget" className="text-sm text-muted-foreground" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="under-5000">Under ₹5,000</SelectItem>
                <SelectItem value="5000-7000">₹5,000 – ₹7,000</SelectItem>
                <SelectItem value="7000-10000">₹7,000 – ₹10,000</SelectItem>
                <SelectItem value="10000-15000">₹10,000 – ₹15,000</SelectItem>
                <SelectItem value="above-15000">Above ₹15,000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Room Type Field */}
          <div className="shrink-0 md:w-44 border-b md:border-b-0 md:border-r border-border/50">
            <Select value={roomType} onValueChange={setRoomType}>
              <SelectTrigger
                className="w-full h-full border-none bg-transparent shadow-none focus:ring-0 rounded-none px-6 py-4 md:py-6 hover:bg-muted/30 transition-colors gap-3"
                aria-label="Select room type"
              >
                <Home className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                <div className="flex flex-col items-start text-left flex-1">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wide">Room Type</span>
                  <SelectValue placeholder="Any sharing" className="text-sm text-muted-foreground" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="personal">Personal Room</SelectItem>
                <SelectItem value="2-sharing">2 Sharing</SelectItem>
                <SelectItem value="3-sharing">3 Sharing</SelectItem>
                <SelectItem value="4-sharing">4 Sharing</SelectItem>
                <SelectItem value="5-sharing">5 Sharing</SelectItem>
                <SelectItem value="6-sharing">6 Sharing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Food Field */}
          <div className="shrink-0 md:w-36 border-b md:border-b-0 md:border-r border-border/50">
            <Select value={food} onValueChange={setFood}>
              <SelectTrigger
                className="w-full h-full border-none bg-transparent shadow-none focus:ring-0 rounded-none px-6 py-4 md:py-6 hover:bg-muted/30 transition-colors gap-3"
                aria-label="Select food preference"
              >
                <Utensils className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                <div className="flex flex-col items-start text-left flex-1">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wide">Food</span>
                  <SelectValue placeholder="Any" className="text-sm text-muted-foreground" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="included">Food Included</SelectItem>
                <SelectItem value="available">Food Available</SelectItem>
                <SelectItem value="none">No Food</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className="p-3 md:p-4 flex items-center">
            <button
              type="submit"
              className="w-full md:w-16 h-14 md:h-16 flex items-center justify-center gap-2 gradient-primary text-white font-bold rounded-[16px] hover:opacity-90 transition-all active:scale-95 shadow-lg px-6 md:px-0"
              aria-label="Search PGs"
            >
              <Search className="w-6 h-6" aria-hidden="true" />
              <span className="md:hidden">Search PGs</span>
            </button>
          </div>
        </div>
      </form>

      {/* Popular Searches */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-white/70 text-xs font-semibold uppercase tracking-wide shrink-0">
          Popular:
        </span>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SEARCHES.slice(0, 5).map((search) => (
            <button
                  key={search.label}
              type="button"
              onClick={() => handleChipClick(search)}
              className="popular-chip text-foreground dark:text-foreground"
            >
              <Search className="w-3 h-3 text-primary" aria-hidden="true" />
              {search.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
