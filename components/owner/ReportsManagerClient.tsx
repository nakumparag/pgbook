"use client";

import { useState } from "react";
import { Download, FileText, BarChart3, TrendingUp, CheckCircle2, ShieldCheck, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { exportTenantsCSV, exportPaymentsCSV } from "@/app/actions/business_reports";
import { formatCurrency } from "@/lib/utils";
import { SimpleProperty } from "@/components/shared/PropertySelector";

interface ReportsManagerClientProps {
  properties: SimpleProperty[];
  selectedPropertyId?: string | null;
  reportSummary: {
    totalRevenue: number;
    totalCollected: number;
    totalPending: number;
    totalExpenses: number;
    netProfit: number;
    propertyStats: Array<{
      id: string;
      name: string;
      totalBeds: number;
      occupiedBeds: number;
      occupancyPercentage: number;
      revenue: number;
      expenses: number;
      profit: number;
    }>;
  };
}

export function ReportsManagerClient({
  properties,
  selectedPropertyId,
  reportSummary,
}: ReportsManagerClientProps) {
  const [downloadingTenants, setDownloadingTenants] = useState(false);
  const [downloadingPayments, setDownloadingPayments] = useState(false);

  const handleDownloadTenants = async () => {
    setDownloadingTenants(true);
    const { csv } = await exportTenantsCSV(selectedPropertyId || undefined);
    setDownloadingTenants(false);
    if (csv) {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tenants-report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    } else {
      alert("No tenant records found to export.");
    }
  };

  const handleDownloadPayments = async () => {
    setDownloadingPayments(true);
    const { csv } = await exportPaymentsCSV(selectedPropertyId || undefined);
    setDownloadingPayments(false);
    if (csv) {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payments-audit-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    } else {
      alert("No payment transactions found to export.");
    }
  };

  return (
    <div className="space-y-6">
      {/* P&L Statement Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-extrabold text-xl text-foreground">
              Profit & Loss Summary
            </h2>
            <p className="text-xs text-muted-foreground">Consolidated operational cash flow and collections</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="rounded-xl text-xs font-semibold gap-1.5 h-9"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Report
            </Button>
          </div>
        </div>

        {/* Financial Numbers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Billed Run-Rate</span>
            <p className="text-xl font-extrabold text-foreground font-heading">{formatCurrency(reportSummary.totalRevenue)}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Verified Collections</span>
            <p className="text-xl font-extrabold text-emerald-600 font-heading">{formatCurrency(reportSummary.totalCollected)}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Operating Costs</span>
            <p className="text-xl font-extrabold text-rose-600 font-heading">{formatCurrency(reportSummary.totalExpenses)}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Net Operating Profit</span>
            <p className={`text-xl font-extrabold font-heading ${reportSummary.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {formatCurrency(reportSummary.netProfit)}
            </p>
          </div>
        </div>

        {/* Property Wise Breakdown Table */}
        <div className="space-y-3 pt-2">
          <h3 className="font-bold text-sm text-foreground">Property-Wise Profitability</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 uppercase font-semibold text-muted-foreground bg-muted/20">
                <tr>
                  <th className="py-2.5 px-3">Property</th>
                  <th className="py-2.5 px-3">Occupancy</th>
                  <th className="py-2.5 px-3">Revenue</th>
                  <th className="py-2.5 px-3">Expenses</th>
                  <th className="py-2.5 px-3">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {reportSummary.propertyStats.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 px-3 font-bold text-foreground">{p.name}</td>
                    <td className="py-3 px-3">
                      {p.occupiedBeds} / {p.totalBeds} ({p.occupancyPercentage}%)
                    </td>
                    <td className="py-3 px-3 font-semibold text-emerald-600">{formatCurrency(p.revenue)}</td>
                    <td className="py-3 px-3 font-semibold text-rose-600">{formatCurrency(p.expenses)}</td>
                    <td className={`py-3 px-3 font-bold ${p.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {formatCurrency(p.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CSV Exports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Resident Tenant Directory CSV
            </h4>
            <p className="text-xs text-muted-foreground">Complete export with KYC phone, room, bed, rent, deposit, and status.</p>
          </div>
          <Button
            onClick={handleDownloadTenants}
            disabled={downloadingTenants}
            size="sm"
            className="rounded-xl font-bold gap-1.5 text-xs h-9 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            {downloadingTenants ? "Exporting..." : "Download"}
          </Button>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-600" />
              Payment Transactions Audit CSV
            </h4>
            <p className="text-xs text-muted-foreground">Verified receipt ledger with transaction references, dates, and modes.</p>
          </div>
          <Button
            onClick={handleDownloadPayments}
            disabled={downloadingPayments}
            size="sm"
            variant="outline"
            className="rounded-xl font-bold gap-1.5 text-xs h-9 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            {downloadingPayments ? "Exporting..." : "Download"}
          </Button>
        </div>
      </div>
    </div>
  );
}

