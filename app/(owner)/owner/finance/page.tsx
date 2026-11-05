import { getInvoices, getPayments, getExpenses, getUtilityBills } from "@/app/actions/business_finances";
import { getTenants } from "@/app/actions/business_tenants";
import { getOwnerProperties } from "@/app/actions/business_properties";
import { FinanceManagerClient } from "@/components/owner/FinanceManagerClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ property?: string }>;
}

export default async function OwnerFinancePage({ searchParams }: PageProps) {
  const { property: queryPropertyId } = await searchParams;
  const { properties } = await getOwnerProperties();
  const { invoices } = await getInvoices({ propertyId: queryPropertyId });
  const { payments } = await getPayments({ propertyId: queryPropertyId });
  const { expenses } = await getExpenses({ propertyId: queryPropertyId });
  const { utilityBills } = await getUtilityBills(queryPropertyId);
  const { tenants } = await getTenants({ propertyId: queryPropertyId, status: "ACTIVE" });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-foreground">
          Financial Management
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Automated rent invoices, payment receipts, operational expenses, utility bills, and net cash flow.
        </p>
      </div>

      <FinanceManagerClient
        properties={properties}
        invoices={invoices}
        payments={payments}
        expenses={expenses}
        utilityBills={utilityBills}
        tenants={tenants}
        selectedPropertyId={queryPropertyId}
      />
    </div>
  );
}

