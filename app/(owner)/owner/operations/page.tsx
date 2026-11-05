import { getVisitors, getMaintenanceRequests, getNotices } from "@/app/actions/business_operations";
import { getOwnerProperties } from "@/app/actions/business_properties";
import { getTenants } from "@/app/actions/business_tenants";
import { OperationsManagerClient } from "@/components/owner/OperationsManagerClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ property?: string }>;
}

export default async function OwnerOperationsPage({ searchParams }: PageProps) {
  const { property: queryPropertyId } = await searchParams;
  const { properties } = await getOwnerProperties();
  const { visitors } = await getVisitors(queryPropertyId);
  const { requests } = await getMaintenanceRequests({ propertyId: queryPropertyId });
  const { notices } = await getNotices(queryPropertyId);
  const { tenants } = await getTenants({ propertyId: queryPropertyId, status: "ACTIVE" });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-foreground">
          Daily Operations
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Visitor entry/exit registers, maintenance & repair tickets, and resident broadcast notices.
        </p>
      </div>

      <OperationsManagerClient
        visitors={visitors}
        maintenanceRequests={requests}
        notices={notices}
        properties={properties}
        tenants={tenants}
        selectedPropertyId={queryPropertyId}
      />
    </div>
  );
}
