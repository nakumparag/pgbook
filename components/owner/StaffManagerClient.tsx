"use client";

import { useState } from "react";
import { Plus, UserCheck, Calendar, Phone, Mail, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { createStaffMember, recordAttendance } from "@/app/actions/business_staff";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SimpleProperty } from "@/components/shared/PropertySelector";

interface StaffManagerClientProps {
  staffList: any[];
  attendanceList: any[];
  properties: SimpleProperty[];
  selectedPropertyId?: string | null;
}

export function StaffManagerClient({
  staffList,
  attendanceList,
  properties,
  selectedPropertyId,
}: StaffManagerClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Add Staff Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [targetPropId, setTargetPropId] = useState(
    selectedPropertyId && selectedPropertyId !== "all" ? selectedPropertyId : properties[0]?.id || ""
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<any>("WARDEN");
  const [salary, setSalary] = useState(15000);
  const [addLoading, setAddLoading] = useState(false);

  // Quick Attendance Logging
  const [markingId, setMarkingId] = useState<string | null>(null);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    const res = await createStaffMember({
      propertyId: targetPropId,
      name,
      phone,
      email: email.trim() || undefined,
      role,
      salary,
    });
    setAddLoading(false);
    if (res.success) {
      setAddModalOpen(false);
      setName("");
      setPhone("");
      setEmail("");
    } else {
      alert(res.error || "Failed to add staff");
    }
  };

  const handleMarkAttendance = async (staffId: string, status: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE") => {
    setMarkingId(staffId);
    const staff = staffList.find((s) => s.id === staffId);
    await recordAttendance({
      propertyId: staff?.pg_id || properties[0]?.id || "",
      staffId,
      date: selectedDate,
      status,
    });
    setMarkingId(null);
  };

  const attendanceMap = (attendanceList || []).reduce((acc: any, att: any) => {
    acc[att.staff_id] = att.status;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Top Controls: Date Picker & Add Staff Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Label className="text-xs font-semibold">Attendance Date:</Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-44 rounded-xl text-xs h-9 bg-card"
          />
        </div>

        <Button onClick={() => setAddModalOpen(true)} className="rounded-xl font-bold gap-2 text-xs h-9">
          <Plus className="w-4 h-4" />
          Add Staff Member
        </Button>
      </div>

      {/* Staff Table with Daily Attendance Controls */}
      {staffList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
          <UserCheck className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-60" />
          <p className="font-bold text-sm text-foreground">No staff members enrolled yet</p>
          <p className="text-xs text-muted-foreground mt-0.5">Add wardens, cooks, security guards, and cleaners.</p>
          <Button onClick={() => setAddModalOpen(true)} className="mt-4 rounded-xl font-bold gap-2">
            <Plus className="w-4 h-4" />
            Add First Staff
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/60 text-xs font-semibold uppercase text-muted-foreground bg-muted/30">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Salary</th>
                  <th className="py-3 px-4 text-center">Status ({formatDate(selectedDate)})</th>
                  <th className="py-3 px-4 text-right">Mark Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {staffList.map((s) => {
                  const currentStatus = attendanceMap[s.id] || "PENDING";
                  return (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-xs text-foreground">{s.name}</p>
                        <p className="text-[11px] text-muted-foreground">{s.phone}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="text-[10px] font-semibold uppercase">
                          {s.role}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {s.pgs?.name || "Assigned PG"}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-xs text-foreground">
                        {formatCurrency(s.salary)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {currentStatus === "PENDING" ? (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Unmarked
                          </Badge>
                        ) : (
                          <StatusBadge status={currentStatus} />
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant={currentStatus === "PRESENT" ? "default" : "outline"}
                            onClick={() => handleMarkAttendance(s.id, "PRESENT")}
                            disabled={markingId === s.id}
                            className="h-7 px-2 text-[10px] rounded-lg font-bold"
                          >
                            P
                          </Button>
                          <Button
                            size="sm"
                            variant={currentStatus === "HALF_DAY" ? "default" : "outline"}
                            onClick={() => handleMarkAttendance(s.id, "HALF_DAY")}
                            disabled={markingId === s.id}
                            className="h-7 px-2 text-[10px] rounded-lg font-bold"
                          >
                            HD
                          </Button>
                          <Button
                            size="sm"
                            variant={currentStatus === "ABSENT" ? "destructive" : "outline"}
                            onClick={() => handleMarkAttendance(s.id, "ABSENT")}
                            disabled={markingId === s.id}
                            className="h-7 px-2 text-[10px] rounded-lg font-bold text-rose-600 hover:bg-rose-50"
                          >
                            A
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading font-extrabold text-lg">Add Staff Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddStaff} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assign to PG Property *</Label>
              <select
                value={targetPropId}
                onChange={(e) => setTargetPropId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-input bg-card text-sm font-medium"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Full Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Patel"
                required
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Mobile Phone *</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit number"
                  maxLength={10}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Role *</Label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-card text-sm font-medium"
                >
                  <option value="WARDEN">Warden / Caretaker</option>
                  <option value="COOK">Cook / Chef</option>
                  <option value="CLEANER">Housekeeping / Cleaner</option>
                  <option value="SECURITY">Security Guard</option>
                  <option value="MAINTENANCE">Electrician / Plumber</option>
                  <option value="MANAGER">Property Manager</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Monthly Salary (₹)</Label>
                <Input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  min={0}
                  className="rounded-xl font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Email (Optional)</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="rounded-xl"
                />
              </div>
            </div>

            <Button type="submit" disabled={addLoading} className="w-full rounded-xl font-bold">
              {addLoading ? "Saving..." : "Save Staff Member"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

