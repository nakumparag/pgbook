import { getStaffList, getAttendanceList } from "@/app/actions/business_staff";
import { getOwnerProperties } from "@/app/actions/business_properties";
import { StaffManagerClient } from "@/components/owner/StaffManagerClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ property?: string; date?: string }>;
}

export default async function OwnerStaffPage({ searchParams }: PageProps) {
  const { property: queryPropertyId, date } = await searchParams;
  const { properties } = await getOwnerProperties();
  const { staff } = await getStaffList(queryPropertyId);
  const { attendance } = await getAttendanceList(queryPropertyId, date);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-foreground">
          Staff & Attendance
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Wardens, cooks, security, and cleaners directory with daily attendance logs.
        </p>
      </div>

      <StaffManagerClient
        staffList={staff}
        attendanceList={attendance}
        properties={properties}
        selectedPropertyId={queryPropertyId}
      />
    </div>
  );
}

