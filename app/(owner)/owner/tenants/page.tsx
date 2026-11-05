import { getTenants } from "@/app/actions/business_tenants";
import { getOwnerProperties } from "@/app/actions/business_properties";
import { TenantManagerClient } from "@/components/owner/TenantManagerClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ property?: string; action?: string }>;
}

export default async function OwnerTenantsPage({ searchParams }: PageProps) {
  const { property: queryPropertyId, action } = await searchParams;
  const { tenants } = await getTenants({ propertyId: queryPropertyId });
  const { properties } = await getOwnerProperties();

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-foreground">
          Tenant Management
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Complete resident lifecycle: onboarding with atomic bed allocation, KYC details, and checkout settlement.
        </p>
      </div>

      <TenantManagerClient
        tenants={tenants}
        properties={properties}
        selectedPropertyId={queryPropertyId}
        defaultOpenNew={action === "new"}
      />
    </div>
  );
}

