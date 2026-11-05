import { getOwnerDashboardData } from "@/app/actions/business_analytics";
import { getOwnerProperties } from "@/app/actions/business_properties";
import { ReportsManagerClient } from "@/components/owner/ReportsManagerClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ property?: string }>;
}

export default async function OwnerReportsPage({ searchParams }: PageProps) {
  const { property: queryPropertyId } = await searchParams;
  const { properties } = await getOwnerProperties();
  const dashboardData = await getOwnerDashboardData(queryPropertyId);

  const kpis = dashboardData?.kpis || {
    monthlyRent: 0,
    rentCollected: 0,
    pendingRent: 0,
    totalExpenses: 0,
    netIncome: 0,
  };

  const propertyStats = (dashboardData?.propertyPerformance || []).map((p) => ({
    id: p.id,
    name: p.name,
    totalBeds: p.totalBeds,
    occupiedBeds: p.occupiedBeds,
    occupancyPercentage: p.occupancyPercentage,
    revenue: p.monthlyRent,
    expenses: p.expenses,
    profit: p.rentCollected - p.expenses,
  }));

  const reportSummary = {
    totalRevenue: kpis.monthlyRent,
    totalCollected: kpis.rentCollected,
    totalPending: kpis.pendingRent,
    totalExpenses: kpis.totalExpenses,
    netProfit: kpis.netIncome,
    propertyStats,
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-foreground">
          Financial Reports & Analytics
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Profit and loss statements, occupancy comparisons, and downloadable accounting audit logs.
        </p>
      </div>

      <ReportsManagerClient
        properties={properties}
        selectedPropertyId={queryPropertyId}
        reportSummary={reportSummary}
      />
    </div>
  );
}
