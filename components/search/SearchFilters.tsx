"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Filter, X, SlidersHorizontal, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const filterOptions = {
  propertyType: ["PG", "Hostel", "Co-Living"],
  gender: ["Male", "Female", "Unisex"],
  roomType: ["Single", "Double Sharing", "Triple Sharing", "Dorm"],
  amenities: ["WiFi", "AC", "Meals", "Laundry", "Gym", "Power Backup", "Hot Water"],
};

export interface ActiveFilters {
  propertyTypes: string[];
  genders: string[];
  roomTypes: string[];
  amenities: string[];
  maxRent: number;
  minRent: number;
  verifiedOnly: boolean;
  location: string;
}

const DEFAULT_FILTERS: ActiveFilters = {
  propertyTypes: [],
  genders: [],
  roomTypes: [],
  amenities: [],
  maxRent: 50000,
  minRent: 3000,
  verifiedOnly: false,
  location: "",
};

interface SearchFiltersProps {
  className?: string;
  onFilterChange: (filters: ActiveFilters) => void;
  initialLocation?: string;
}

export function SearchFilters({ className, onFilterChange, initialLocation = "" }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<ActiveFilters>({
    ...DEFAULT_FILTERS,
    location: initialLocation,
  });

  const update = useCallback(
    (patch: Partial<ActiveFilters>) => {
      setFilters((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  // Notify parent after React commits the new filter state.
  // Skip the initial mount to avoid double-initializing the parent.
  const skipInitial = useRef(true);
  useEffect(() => {
    if (skipInitial.current) {
      skipInitial.current = false;
      return;
    }
    onFilterChange(filters);
   
  }, [filters]);

  const toggleArray = (key: "propertyTypes" | "genders" | "roomTypes" | "amenities", value: string) => {
    const current = filters[key] as string[];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    update({ [key]: next });
  };

  const handleReset = () => {
    const reset = { ...DEFAULT_FILTERS, location: "" };
    setFilters(reset);
    onFilterChange(reset);
  };

  const activeCount =
    filters.propertyTypes.length +
    filters.genders.length +
    filters.roomTypes.length +
    filters.amenities.length +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.maxRent < 50000 ? 1 : 0) +
    (filters.location ? 1 : 0);

  return (
    <>
      {/* Mobile Filter Toggle */}
      <Button
        variant="outline"
        className="lg:hidden w-full flex items-center justify-center gap-2 mb-4 h-12 rounded-xl"
        onClick={() => setIsOpen(true)}
      >
        <Filter className="w-5 h-5" />
        <span>Show Filters</span>
        {activeCount > 0 && (
          <span className="ml-1 bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded-full">
            {activeCount}
          </span>
        )}
      </Button>

      {/* Overlay backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Filter Sidebar */}
      <div
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-[85%] max-w-sm bg-card border-r border-border p-6 shadow-2xl overflow-y-auto transition-transform duration-300",
          "lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:w-auto lg:max-w-none lg:border lg:rounded-2xl lg:shadow-sm lg:p-6 lg:z-auto lg:translate-x-0 lg:overflow-y-auto hide-scrollbar",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold flex items-center gap-2 text-foreground">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            Filters
            {activeCount > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
          </h2>
          <button
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground bg-muted rounded-full"
            onClick={() => setIsOpen(false)}
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">

          {/* Location */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Location</h3>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search city or area..."
                value={filters.location}
                onChange={(e) => update({ location: e.target.value })}
                className="pl-9 h-12 rounded-xl bg-muted/50 border-transparent focus-visible:bg-transparent"
              />
            </div>
          </div>

          <div className="h-px w-full bg-border" />

          {/* Price Range */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Monthly Rent</h3>
              <span className="text-sm font-bold text-primary">
                ₹{filters.minRent.toLocaleString()} – ₹{filters.maxRent.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="3000"
              max="50000"
              step="1000"
              value={filters.maxRent}
              onChange={(e) => update({ maxRent: parseInt(e.target.value) })}
              className="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
              aria-label="Maximum rent"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>₹3,000</span>
              <span>₹50,000</span>
            </div>
          </div>

          <div className="h-px w-full bg-border" />

          {/* Verified Only */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                id="verified-only"
                checked={filters.verifiedOnly}
                onCheckedChange={(checked) => update({ verifiedOnly: !!checked })}
                className="rounded border-muted-foreground data-[state=checked]:border-primary"
              />
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                Verified Properties Only
              </span>
            </label>
          </div>

          <div className="h-px w-full bg-border" />

          {/* Property Type */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Property Type</h3>
            <div className="flex flex-col gap-3">
              {filterOptions.propertyType.map((type) => (
                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox
                    id={`type-${type}`}
                    checked={filters.propertyTypes.includes(type)}
                    onCheckedChange={() => toggleArray("propertyTypes", type)}
                    className="rounded border-muted-foreground data-[state=checked]:border-primary"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-border" />

          {/* Gender */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Gender Preferred</h3>
            <div className="flex flex-wrap gap-2">
              {filterOptions.gender.map((gender) => {
                const isActive = filters.genders.includes(gender);
                return (
                  <button
                    key={gender}
                    onClick={() => toggleArray("genders", gender)}
                    aria-pressed={isActive}
                    className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border bg-card hover:border-foreground hover:bg-muted"
                    }`}
                  >
                    {gender}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px w-full bg-border" />

          {/* Room Type */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Room Type</h3>
            <div className="flex flex-col gap-3">
              {filterOptions.roomType.map((type) => (
                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox
                    id={`room-${type}`}
                    checked={filters.roomTypes.includes(type)}
                    onCheckedChange={() => toggleArray("roomTypes", type)}
                    className="rounded border-muted-foreground data-[state=checked]:border-primary"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-border" />

          {/* Amenities */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Amenities</h3>
            <div className="flex flex-col gap-3">
              {filterOptions.amenities.map((amenity) => (
                <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={filters.amenities.includes(amenity)}
                    onCheckedChange={() => toggleArray("amenities", amenity)}
                    className="rounded border-muted-foreground data-[state=checked]:border-primary"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {amenity}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={handleReset}>
            Reset All
          </Button>
          <Button className="flex-1 rounded-xl h-12 lg:hidden" onClick={() => setIsOpen(false)}>
            Apply ({activeCount})
          </Button>
        </div>
      </div>
    </>
  );
}
