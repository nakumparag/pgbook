import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { UserCheck, Clock, CheckCircle2, AlertCircle, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";

export default async function StaffPortalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/manager/login?next=/manager/staff-portal");
  }

  const todayStr = new Date().toISOString().split("T")[0];

  // Fetch staff record matching phone or email or user_id
  const { data: staffMember } = await supabase
    .from("staff")
    .select("*, pgs(name)")
    .or(`user_id.eq.${user.id},email.eq.${user.email || ""}`)
    .maybeSingle();

  // Fetch today's attendance
  let todayAttendance = null;
  if (staffMember) {
    const { data: att } = await supabase
      .from("attendance")
      .select("*")
      .eq("staff_id", staffMember.id)
      .eq("date", todayStr)
      .maybeSingle();
    todayAttendance = att;
  }

  // Fetch assigned maintenance tasks
  let tasks: any[] = [];
  if (staffMember) {
    const { data: taskData } = await supabase
      .from("maintenance_requests")
      .select("id, title, description, category, priority, status, created_at, pgs(name)")
      .eq("assigned_staff_id", staffMember.id)
      .order("created_at", { ascending: false });
    tasks = taskData || [];
  }

  return (
    <div className="min-h-screen bg-muted/20 text-foreground flex flex-col">
      <header className="sticky top-0 z-20 h-16 border-b border-border bg-background px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-heading font-black text-base text-foreground">Staff Workstation</h1>
            <p className="text-[10px] text-muted-foreground font-semibold">
              {staffMember ? `${staffMember.name} • ${staffMember.role}` : "Hostel Operations Desk"}
            </p>
          </div>
        </div>

        <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-semibold">
          <Link href="/manager">PG Manager Home</Link>
        </Button>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Attendance Punch Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today's Duty Status</span>
            <h2 className="text-xl font-extrabold font-heading text-foreground mt-0.5">{formatDate(todayStr)}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Duty Property: <strong>{staffMember?.pgs?.name || "Assigned PG"}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {todayAttendance ? (
              <div className="flex items-center gap-2">
                <StatusBadge status={todayAttendance.status} />
                <span className="text-xs text-muted-foreground font-medium">Logged</span>
              </div>
            ) : (
              <Badge variant="outline" className="text-xs font-semibold px-3 py-1 text-amber-600 border-amber-300 bg-amber-50">
                Not Marked Today
              </Badge>
            )}
          </div>
        </div>

        {/* Maintenance Tasks */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-foreground">Assigned Maintenance Tasks</h3>
              <p className="text-xs text-muted-foreground">Repairs, plumbing, and electrical tickets assigned to you</p>
            </div>
            <Badge variant="outline" className="text-xs font-semibold">{tasks.length} Assigned</Badge>
          </div>

          {tasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No tasks currently assigned to you.
            </div>
          ) : (
            <div className="divide-y divide-border/40 text-xs">
              {tasks.map((task) => (
                <div key={task.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <p className="font-bold text-foreground text-sm">{task.title}</p>
                    <p className="text-muted-foreground leading-relaxed">{task.description}</p>
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                      <span>{task.category}</span>
                      <span>•</span>
                      <span>Priority: <strong className="text-foreground">{task.priority}</strong></span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
