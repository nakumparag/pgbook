"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType =
  | "OCCUPIED" | "VACANT" | "RESERVED" | "MAINTENANCE"
  | "ACTIVE" | "NOTICE" | "MOVED_OUT"
  | "PAID" | "PENDING" | "PARTIAL" | "OVERDUE" | "CANCELLED"
  | "OPEN" | "IN_PROGRESS" | "RESOLVED"
  | "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE"
  | "HELD" | "ADJUSTED" | "REFUNDED"
  | "APPROVED" | "REJECTED" | "DRAFT" | "SUSPENDED";

interface StatusBadgeProps {
  status: string | StatusType;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // Bed Status
  VACANT: { label: "Vacant", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" },
  OCCUPIED: { label: "Occupied", className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800" },
  RESERVED: { label: "Reserved", className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" },
  MAINTENANCE: { label: "Under Maintenance", className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800" },

  // Tenant Status
  ACTIVE: { label: "Active", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" },
  NOTICE: { label: "On Notice", className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" },
  MOVED_OUT: { label: "Checked Out", className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" },

  // Invoice / Payment Status
  PAID: { label: "Paid", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" },
  PENDING: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" },
  PARTIAL: { label: "Partially Paid", className: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800" },
  OVERDUE: { label: "Overdue", className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800" },
  CANCELLED: { label: "Cancelled", className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300" },

  // Maintenance & Operations
  OPEN: { label: "Open", className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300" },
  IN_PROGRESS: { label: "In Progress", className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300" },
  RESOLVED: { label: "Resolved", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300" },

  // Attendance
  PRESENT: { label: "Present", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ABSENT: { label: "Absent", className: "bg-rose-50 text-rose-700 border-rose-200" },
  HALF_DAY: { label: "Half Day", className: "bg-amber-50 text-amber-700 border-amber-200" },
  LEAVE: { label: "On Leave", className: "bg-slate-100 text-slate-700 border-slate-200" },

  // Deposit Status
  HELD: { label: "Held", className: "bg-blue-50 text-blue-700 border-blue-200" },
  ADJUSTED: { label: "Adjusted", className: "bg-amber-50 text-amber-700 border-amber-200" },
  REFUNDED: { label: "Refunded", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },

  // Verification & Listing
  APPROVED: { label: "Approved", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Rejected", className: "bg-rose-50 text-rose-700 border-rose-200" },
  DRAFT: { label: "Draft", className: "bg-slate-100 text-slate-700 border-slate-200" },
  SUSPENDED: { label: "Paused", className: "bg-amber-50 text-amber-700 border-amber-200" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const norm = (status || "").toUpperCase();
  const conf = statusConfig[norm] || {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full border", conf.className, className)}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 inline-block opacity-80" />
      {conf.label}
    </Badge>
  );
}

