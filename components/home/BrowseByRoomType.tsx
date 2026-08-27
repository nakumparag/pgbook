"use client";

import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";

const ROOM_TYPES = [
  {
    type: "Personal Room",
    sharing: "1",
    param: "personal",
    icon: "🛏️",
    description: "Entire room to yourself",
    startingRent: "₹8,000",
  },
  {
    type: "2 Sharing",
    sharing: "2",
    param: "2-sharing",
    icon: "🛌",
    description: "Share with 1 roommate",
    startingRent: "₹6,000",
  },
  {
    type: "3 Sharing",
    sharing: "3",
    param: "3-sharing",
    icon: "🛏",
    description: "Share with 2 roommates",
    startingRent: "₹5,000",
  },
  {
    type: "4 Sharing",
    sharing: "4",
    param: "4-sharing",
    icon: "🏠",
    description: "Share with 3 roommates",
    startingRent: "₹4,000",
  },
  {
    type: "5 Sharing",
    sharing: "5",
    param: "5-sharing",
    icon: "🏡",
    description: "Share with 4 roommates",
    startingRent: "₹3,500",
  },
  {
    type: "6 Sharing",
    sharing: "6",
    param: "6-sharing",
    icon: "🏘️",
    description: "Most economical option",
    startingRent: "₹3,000",
  },
];

export function BrowseByRoomType() {
  return (
    <section className="section-padding bg-section-alt" aria-labelledby="roomtype-heading">
      <div className="container-custom">

        <div className="text-center mb-10">
          <span className="section-label" aria-hidden="true">Room Options</span>
          <h2 id="roomtype-heading" className="section-heading">
            Browse by Room Type
          </h2>
          <p className="section-subtext max-w-lg mx-auto">
            Choose how you want to share your space — or keep it all to yourself
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {ROOM_TYPES.map((room) => (
            <Link
              key={room.type}
              href={`/explore?roomType=${room.param}`}
              className="group flex flex-col items-center text-center p-5 bg-card rounded-2xl border border-border/50 card-hover shadow-sm"
              aria-label={`Browse ${room.type} PGs`}
            >
              {/* Icon */}
              <span className="text-3xl mb-3" aria-hidden="true">{room.icon}</span>

              {/* Sharing visual */}
              <div className="flex items-center gap-0.5 mb-3" aria-hidden="true">
                {Array.from({ length: parseInt(room.sharing) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center"
                    style={{ marginLeft: i > 0 ? "-4px" : 0 }}
                  >
                    <Users className="w-2.5 h-2.5 text-primary" />
                  </div>
                ))}
              </div>

              <h3 className="font-bold text-sm text-foreground mb-1 group-hover:text-primary transition-colors">
                {room.type}
              </h3>
              <p className="text-xs text-muted-foreground mb-2">{room.description}</p>
              <p className="text-xs font-semibold text-primary mt-auto">
                From {room.startingRent}
              </p>
              <div className="flex items-center gap-1 text-xs font-semibold text-primary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Browse <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
