"use client";

import { useState } from "react";
import { Plus, Users, Wrench, Bell, LogIn, LogOut, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  recordVisitorEntry,
  recordVisitorExit,
  createMaintenanceRequest,
  updateMaintenanceStatus,
  createNotice,
  deleteNotice,
} from "@/app/actions/business_operations";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SimpleProperty } from "@/components/shared/PropertySelector";

interface OperationsManagerClientProps {
  visitors: any[];
  maintenanceRequests: any[];
  notices: any[];
  properties: SimpleProperty[];
  tenants: any[];
  selectedPropertyId?: string | null;
}

export function OperationsManagerClient({
  visitors,
  maintenanceRequests,
  notices,
  properties,
  tenants,
  selectedPropertyId,
}: OperationsManagerClientProps) {
  const [activeTab, setActiveTab] = useState("visitors");

  // 1. Visitor Entry Modal
  const [visitorModalOpen, setVisitorModalOpen] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [visitorTenantId, setVisitorTenantId] = useState(tenants[0]?.id || "");
  const [visitorPropertyId, setVisitorPropertyId] = useState(properties[0]?.id || "");
  const [visitorPurpose, setVisitorPurpose] = useState("Personal Visit");
  const [visitorLoading, setVisitorLoading] = useState(false);

  // 2. Maintenance Ticket Modal
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [compPropertyId, setCompPropertyId] = useState(properties[0]?.id || "");
  const [compTitle, setCompTitle] = useState("");
  const [compDesc, setCompDesc] = useState("");
  const [compCat, setCompCat] = useState<any>("PLUMBING");
  const [compPriority, setCompPriority] = useState<any>("MEDIUM");
  const [compLoading, setCompLoading] = useState(false);

  // 3. Notice Modal
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeTarget, setNoticeTarget] = useState<any>("ALL");
  const [noticePriority, setNoticePriority] = useState<any>("NORMAL");
  const [noticeLoading, setNoticeLoading] = useState(false);

  const handleVisitorEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setVisitorLoading(true);
    const res = await recordVisitorEntry({
      propertyId: visitorPropertyId,
      tenantId: visitorTenantId || undefined,
      visitorName,
      visitorPhone,
      purpose: visitorPurpose,
    });
    setVisitorLoading(false);
    if (res.success) {
      setVisitorModalOpen(false);
      setVisitorName("");
      setVisitorPhone("");
    } else {
      alert(res.error || "Failed to log visitor");
    }
  };

  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompLoading(true);
    const res = await createMaintenanceRequest({
      propertyId: compPropertyId,
      title: compTitle,
      description: compDesc,
      category: compCat,
      priority: compPriority,
    });
    setCompLoading(false);
    if (res.success) {
      setComplaintModalOpen(false);
      setCompTitle("");
      setCompDesc("");
    } else {
      alert(res.error || "Failed to create complaint");
    }
  };

  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNoticeLoading(true);
    const res = await createNotice({
      propertyId: selectedPropertyId && selectedPropertyId !== "all" ? selectedPropertyId : null,
      title: noticeTitle,
      content: noticeContent,
      targetRole: noticeTarget,
      priority: noticePriority,
    });
    setNoticeLoading(false);
    if (res.success) {
      setNoticeModalOpen(false);
      setNoticeTitle("");
      setNoticeContent("");
    } else {
      alert(res.error || "Failed to post notice");
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList className="bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="visitors" className="rounded-lg text-xs font-semibold">
              Visitors ({visitors.length})
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="rounded-lg text-xs font-semibold">
              Maintenance ({maintenanceRequests.length})
            </TabsTrigger>
            <TabsTrigger value="notices" className="rounded-lg text-xs font-semibold">
              Notice Board ({notices.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {activeTab === "visitors" && (
              <Button onClick={() => setVisitorModalOpen(true)} size="sm" className="rounded-xl text-xs font-bold gap-1.5 h-9">
                <LogIn className="w-3.5 h-3.5" />
                Log Visitor Entry
              </Button>
            )}
            {activeTab === "maintenance" && (
              <Button onClick={() => setComplaintModalOpen(true)} size="sm" className="rounded-xl text-xs font-bold gap-1.5 h-9">
                <Plus className="w-3.5 h-3.5" />
                New Maintenance Ticket
              </Button>
            )}
            {activeTab === "notices" && (
              <Button onClick={() => setNoticeModalOpen(true)} size="sm" className="rounded-xl text-xs font-bold gap-1.5 h-9">
                <Plus className="w-3.5 h-3.5" />
                Post Announcement
              </Button>
            )}
          </div>
        </div>

        {/* 1. VISITORS TAB */}
        <TabsContent value="visitors" className="space-y-4">
          {visitors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-60" />
              <p className="font-bold text-sm text-foreground">No visitor records logged today</p>
              <p className="text-xs text-muted-foreground mt-0.5">Maintain security gate records of guests and visitors.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border/60 text-xs font-semibold uppercase text-muted-foreground bg-muted/30">
                    <tr>
                      <th className="py-3 px-4">Visitor</th>
                      <th className="py-3 px-4">Resident Visiting</th>
                      <th className="py-3 px-4">Purpose</th>
                      <th className="py-3 px-4">In Time</th>
                      <th className="py-3 px-4">Out Time</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-xs">
                    {visitors.map((v) => (
                      <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-foreground">{v.visitor_name}</p>
                          <p className="text-muted-foreground">{v.visitor_phone}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-foreground">{v.tenants?.full_name || "Guest"}</p>
                          <p className="text-muted-foreground text-[11px]">{v.pgs?.name}</p>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">{v.purpose || "Visit"}</td>
                        <td className="py-3.5 px-4 text-muted-foreground">{formatDate(v.check_in_time)}</td>
                        <td className="py-3.5 px-4">
                          {v.check_out_time ? (
                            <span className="text-muted-foreground">{formatDate(v.check_out_time)}</span>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 bg-emerald-50">
                              Inside
                            </Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {!v.check_out_time && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                await recordVisitorExit(v.id);
                              }}
                              className="h-7 text-xs font-semibold rounded-lg"
                            >
                              Log Exit
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* 2. MAINTENANCE TAB */}
        <TabsContent value="maintenance" className="space-y-4">
          {maintenanceRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
              <Wrench className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-60" />
              <p className="font-bold text-sm text-foreground">Zero pending complaints</p>
              <p className="text-xs text-muted-foreground mt-0.5">All electrical, plumbing, and room issues are resolved!</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border/60 text-xs font-semibold uppercase text-muted-foreground bg-muted/30">
                    <tr>
                      <th className="py-3 px-4">Issue</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Property</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-xs">
                    {maintenanceRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-foreground">{req.title}</p>
                          <p className="text-muted-foreground line-clamp-1">{req.description}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="text-[10px] font-semibold">
                            {req.category}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">{req.pgs?.name}</td>
                        <td className="py-3.5 px-4">
                          <span className={`font-bold ${req.priority === "URGENT" ? "text-rose-600" : "text-foreground"}`}>
                            {req.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {req.status !== "RESOLVED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                await updateMaintenanceStatus({
                                  requestId: req.id,
                                  status: "RESOLVED",
                                  resolutionNotes: "Resolved by caretaker",
                                });
                              }}
                              className="h-7 text-xs font-semibold rounded-lg text-emerald-600 hover:bg-emerald-50"
                            >
                              Resolve
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* 3. NOTICES TAB */}
        <TabsContent value="notices" className="space-y-4">
          {notices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
              <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-60" />
              <p className="font-bold text-sm text-foreground">No active announcements</p>
              <p className="text-xs text-muted-foreground mt-0.5">Post water timings, festival holidays, or hostel rules.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notices.map((n) => (
                <div key={n.id} className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {n.target_role === "ALL" ? "All Residents" : n.target_role}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{formatDate(n.created_at)}</span>
                  </div>
                  <h4 className="font-bold text-base text-foreground font-heading">{n.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{n.content}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* VISITOR MODAL */}
      <Dialog open={visitorModalOpen} onOpenChange={setVisitorModalOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading font-extrabold text-lg">Log Visitor Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleVisitorEntry} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Property *</Label>
              <select
                value={visitorPropertyId}
                onChange={(e) => setVisitorPropertyId(e.target.value)}
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Visitor Name *</Label>
                <Input
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Visitor full name"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Visitor Phone *</Label>
                <Input
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  placeholder="10-digit phone"
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Resident Visiting</Label>
              <select
                value={visitorTenantId}
                onChange={(e) => setVisitorTenantId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-input bg-card text-sm font-medium"
              >
                <option value="">General Visitor / Delivery</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name} ({t.phone})
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" disabled={visitorLoading} className="w-full rounded-xl font-bold">
              {visitorLoading ? "Logging..." : "Confirm Visitor Check-In"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* COMPLAINT MODAL */}
      <Dialog open={complaintModalOpen} onOpenChange={setComplaintModalOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading font-extrabold text-lg">New Maintenance Ticket</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMaintenanceSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Issue Title *</Label>
              <Input
                value={compTitle}
                onChange={(e) => setCompTitle(e.target.value)}
                placeholder="e.g. Geyser tripping breaker in Room 204"
                required
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category *</Label>
                <select
                  value={compCat}
                  onChange={(e) => setCompCat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-card text-sm font-medium"
                >
                  <option value="PLUMBING">Plumbing</option>
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="FURNITURE">Furniture / Bed</option>
                  <option value="AC">AC / Cooling</option>
                  <option value="WIFI">WiFi & Internet</option>
                  <option value="CLEANING">Cleaning</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Priority *</Label>
                <select
                  value={compPriority}
                  onChange={(e) => setCompPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-card text-sm font-medium"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Detailed Description</Label>
              <Input
                value={compDesc}
                onChange={(e) => setCompDesc(e.target.value)}
                placeholder="Details of the issue..."
                className="rounded-xl"
              />
            </div>

            <Button type="submit" disabled={compLoading} className="w-full rounded-xl font-bold">
              {compLoading ? "Submitting..." : "Submit Maintenance Request"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* NOTICE MODAL */}
      <Dialog open={noticeModalOpen} onOpenChange={setNoticeModalOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading font-extrabold text-lg">Broadcast Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleNoticeSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Notice Title *</Label>
              <Input
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                placeholder="e.g. Tank cleaning on Sunday 10 AM"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Announcement Content *</Label>
              <Input
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                placeholder="Full notice message for residents..."
                required
                className="rounded-xl"
              />
            </div>

            <Button type="submit" disabled={noticeLoading} className="w-full rounded-xl font-bold">
              {noticeLoading ? "Publishing..." : "Broadcast Notice"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

