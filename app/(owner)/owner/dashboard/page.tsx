import { Suspense } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";
import {
  Building2,
  Layers,
  DoorOpen,
  BedDouble,
  UserCheck2,
  UserMinus,
  Clock,
  Users,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Percent,
  Plus,
  ArrowUpRight,
  CreditCard,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/shared/KPICard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RevenueExpensesChart, OccupancyDonutChart } from "@/components/owner/AnalyticsCharts";
import { getOwnerDashboardData } from "@/app/actions/business_analytics";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ property?: string }>;
}

export default async function OwnerDashboardPage({ searchParams }: PageProps) {
  const { property: selectedPropertyId } = await searchParams;
  const dashboardData = await getOwnerDashboardData(selectedPropertyId);

  if (!dashboardData) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-bold">Unable to load business dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">Please ensure you are logged in as an authorized owner.</p>
        <Button asChild className="mt-4 rounded-xl">
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  const { kpis, monthlyChart, propertyPerformance, recentPayments, pendingInvoices, properties } = dashboardData;
  const currentProperty = properties.find((p) => p.id === selectedPropertyId);
  const isConsolidated = !selectedPropertyId || selectedPropertyId === "all";

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-foreground">
              {isConsolidated ? "Business Overview" : currentProperty?.name}
            </h1>
            <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 rounded-full border-primary/30 text-primary bg-primary/5">
              {isConsolidated ? "Consolidated" : "Single Property"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time operational, occupancy, and financial metrics.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <Button asChild size="sm" variant="outline" className="rounded-xl font-semibold gap-1.5 h-9">
            <Link href="/owner/rooms">
              <BedDouble className="w-4 h-4 text-primary" />
              Manage Beds
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-xl font-semibold gap-1.5 h-9">
            <Link href="/owner/finance">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Record Payment
            </Link>
          </Button>
          <Button asChild size="sm" className="rounded-xl font-bold gap-1.5 h-9">
            <Link href="/owner/tenants?action=new">
              <Plus className="w-4 h-4" />
              Onboard Tenant
            </Link>
          </Button>
        </div>
      </div>

      {/* 16 KPI METRICS GRID */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Key Performance Indicators
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* 1. Total Properties */}
          <KPICard
            title="Total Properties"
            value={kpis.totalProperties}
            subtitle={isConsolidated ? "Across portfolio" : "Active property"}
            icon={Building2}
            variant="primary"
          />

          {/* 2. Total Floors */}
          <KPICard
            title="Total Floors"
            value={kpis.totalFloors}
            subtitle="Configured floors"
            icon={Layers}
            variant="default"
          />

          {/* 3. Total Rooms */}
          <KPICard
            title="Total Rooms"
            value={kpis.totalRooms}
            subtitle="Across all floors"
            icon={DoorOpen}
            variant="default"
          />

          {/* 4. Total Beds */}
          <KPICard
            title="Total Beds"
            value={kpis.totalBeds}
            subtitle="Capacity inventory"
            icon={BedDouble}
            variant="primary"
          />

          {/* 5. Occupied Beds */}
          <KPICard
            title="Occupied Beds"
            value={kpis.occupiedBeds}
            subtitle="Active residents"
            icon={UserCheck2}
            variant="primary"
          />

          {/* 6. Vacant Beds */}
          <KPICard
            title="Vacant Beds"
            value={kpis.vacantBeds}
            subtitle="Available for booking"
            icon={UserMinus}
            variant="success"
          />

          {/* 7. Reserved Beds */}
          <KPICard
            title="Reserved Beds"
            value={kpis.reservedBeds}
            subtitle="Holding advance"
            icon={Clock}
            variant="warning"
          />

          {/* 8. Occupancy % */}
          <KPICard
            title="Occupancy Rate"
            value={`${kpis.occupancyPercentage}%`}
            trend={{
              value: `${kpis.occupancyPercentage}%`,
              isPositive: kpis.occupancyPercentage >= 70,
              label: "utilization",
            }}
            icon={Percent}
            variant={kpis.occupancyPercentage >= 70 ? "success" : "warning"}
          />

          {/* 9. Total Tenants */}
          <KPICard
            title="Total Tenants"
            value={kpis.totalTenants}
            subtitle="All time onboarding"
            icon={Users}
            variant="default"
          />

          {/* 10. Active Tenants */}
          <KPICard
            title="Active Tenants"
            value={kpis.activeTenants}
            subtitle="Currently staying"
            icon={UserCheck2}
            variant="primary"
          />

          {/* 11. Monthly Rent Target */}
          <KPICard
            title="Monthly Rent"
            value={formatCurrency(kpis.monthlyRent)}
            subtitle="Target active run-rate"
            icon={Wallet}
            variant="primary"
          />

          {/* 12. Rent Collected */}
          <KPICard
            title="Rent Collected"
            value={formatCurrency(kpis.rentCollected)}
            subtitle="Received this cycle"
            icon={CheckCircle2}
            variant="success"
          />

          {/* 13. Pending Rent */}
          <KPICard
            title="Pending Rent"
            value={formatCurrency(kpis.pendingRent)}
            subtitle="Unpaid balances"
            icon={AlertCircle}
            variant={kpis.pendingRent > 0 ? "destructive" : "default"}
          />

          {/* 14. Operating Expenses */}
          <KPICard
            title="Total Expenses"
            value={formatCurrency(kpis.totalExpenses)}
            subtitle="Maintenance & bills"
            icon={Receipt}
            variant="destructive"
          />

          {/* 15. Security Deposits */}
          <KPICard
            title="Security Deposits"
            value={formatCurrency(kpis.securityDeposits)}
            subtitle="Held in escrow"
            icon={ShieldCheck}
            variant="warning"
          />

          {/* 16. Net Income */}
          <KPICard
            title="Net Income"
            value={formatCurrency(kpis.netIncome)}
            trend={{
              value: formatCurrency(kpis.netIncome),
              isPositive: kpis.netIncome >= 0,
              label: "cash flow",
            }}
            icon={TrendingUp}
            variant={kpis.netIncome >= 0 ? "success" : "destructive"}
          />
        </div>
      </div>

      {/* ANALYTICS CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Expenses Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-extrabold text-base text-foreground">
                Revenue vs Operating Expenses
              </h3>
              <p className="text-xs text-muted-foreground">Monthly rent collections compared with costs</p>
            </div>
            <Badge variant="outline" className="text-xs font-medium">Last 6 Months</Badge>
          </div>
          <RevenueExpensesChart data={monthlyChart} />
        </div>

        {/* Occupancy Donut Chart */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-extrabold text-base text-foreground">
              Bed Occupancy Distribution
            </h3>
            <p className="text-xs text-muted-foreground">Current capacity breakdown</p>
          </div>
          <OccupancyDonutChart
            occupied={kpis.occupiedBeds}
            vacant={kpis.vacantBeds}
            reserved={kpis.reservedBeds}
          />
        </div>
      </div>

      {/* PROPERTY-WISE PERFORMANCE TABLE */}
      {isConsolidated && propertyPerformance.length > 0 && (
        <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-extrabold text-base text-foreground">
                Property-Wise Performance
              </h3>
              <p className="text-xs text-muted-foreground">Compare occupancy and revenues across your properties</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs font-semibold gap-1">
              <Link href="/owner/properties">
                View All
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/60 text-xs font-semibold uppercase text-muted-foreground bg-muted/20">
                <tr>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Beds</th>
                  <th className="py-3 px-4">Occupancy</th>
                  <th className="py-3 px-4">Monthly Run-rate</th>
                  <th className="py-3 px-4">Collected</th>
                  <th className="py-3 px-4">Pending</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {propertyPerformance.map((prop) => (
                  <tr key={prop.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      {prop.name}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {prop.occupiedBeds} / {prop.totalBeds}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(100, prop.occupancyPercentage)}%` }}
                          />
                        </div>
                        <span className="font-bold text-xs">{prop.occupancyPercentage}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {formatCurrency(prop.monthlyRent)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600">
                      {formatCurrency(prop.rentCollected)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-rose-600">
                      {formatCurrency(prop.pendingRent)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button asChild variant="outline" size="sm" className="h-7 text-xs rounded-lg">
                        <Link href={`/owner/dashboard?property=${prop.id}`}>
                          Inspect
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECENT PAYMENTS & PENDING INVOICES DUAL PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-extrabold text-base text-foreground">
                Recent Collections
              </h3>
              <p className="text-xs text-muted-foreground">Latest rent transactions verified</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs font-semibold gap-1">
              <Link href="/owner/finance">
                All Transactions
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          {recentPayments.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground">
              No recent payments recorded. Click "Record Payment" to log collections.
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {recentPayments.map((p: any) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{p.tenants?.full_name || "Resident"}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.pgs?.name} • {formatDate(p.payment_date)} • {p.payment_mode}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-emerald-600">{formatCurrency(p.amount)}</p>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-emerald-300 text-emerald-700 bg-emerald-50">
                      Paid
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending & Overdue Invoices */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-extrabold text-base text-foreground">
                Pending Rent Invoices
              </h3>
              <p className="text-xs text-muted-foreground">Dues requiring attention</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs font-semibold gap-1">
              <Link href="/owner/finance">
                Manage Invoices
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          {pendingInvoices.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground">
              No pending rent dues found. All active tenants are up to date!
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {pendingInvoices.map((inv: any) => (
                <div key={inv.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{inv.tenants?.full_name || "Resident"}</p>
                    <p className="text-xs text-muted-foreground">
                      {inv.month_year} • Due {formatDate(inv.due_date)} • {inv.tenants?.phone}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-rose-600">{formatCurrency(inv.balance_due)}</p>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
