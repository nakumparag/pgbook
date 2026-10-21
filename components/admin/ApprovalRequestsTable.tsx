"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, XCircle, Loader2 } from "lucide-react";
import { resolveApprovalRequest } from "@/app/actions/admin";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function ApprovalRequestsTable({ requests }: { requests: any[] }) {
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approveDialog, setApproveDialog] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleApprove = async () => {
    if (!approveDialog) return;
    setProcessing(approveDialog);
    setActionError(null);
    try {
      const result = await resolveApprovalRequest(approveDialog, true, "Approved by Admin");
      if (!result.success) setActionError(result.error || "Could not approve this request.");
    } finally {
      setProcessing(null);
      setApproveDialog(null);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog || !rejectReason.trim()) return;
    setProcessing(rejectDialog);
    setActionError(null);
    try {
      const result = await resolveApprovalRequest(rejectDialog, false, rejectReason);
      if (!result.success) setActionError(result.error || "Could not reject this request.");
    } finally {
      setProcessing(null);
      setRejectDialog(null);
      setRejectReason("");
    }
  };

  return (
    <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden mb-12">
      <div className="p-6 border-b border-border/50 bg-muted/20">
        <h2 className="text-2xl font-heading font-bold text-foreground">Pending Approval Requests</h2>
      </div>
      {actionError && <p role="alert" className="mx-6 mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{actionError}</p>}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">Owner & ID</th>
              <th className="px-6 py-4">PG Name & Location</th>
              <th className="px-6 py-4">Document</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {(requests || []).map((req: any) => (
              <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-foreground text-base">{req.profiles?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{req.ownerProfile?.id_type}: {req.ownerProfile?.id_number}</p>
                  <p className="text-xs text-muted-foreground">{req.profiles?.phone}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-foreground">{req.pgs?.name || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">{req.pgs?.cities?.name || (req.request_type === 'OWNER' ? "Owner Verification Only" : "N/A")}</p>
                  <span className="mt-1 inline-block text-[10px] uppercase font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">
                    {req.request_type} REQUEST
                  </span>
                </td>
                <td className="px-6 py-4">
                  {req.signedDocUrl ? (
                    <a href={req.signedDocUrl} target="_blank" rel="noreferrer" className="text-primary text-xs font-bold hover:underline">
                      View Document
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-xs">No Doc</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      className="bg-success text-white hover:bg-success/90 rounded-lg shadow-sm"
                      onClick={() => setApproveDialog(req.id)}
                      disabled={processing === req.id}
                    >
                      {processing === req.id ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-1.5" />} 
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="rounded-lg shadow-sm"
                      onClick={() => setRejectDialog(req.id)}
                      disabled={processing === req.id}
                    >
                      <XCircle className="w-4 h-4 mr-1.5" /> Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {(!requests || requests.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                  No pending approval requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-border md:hidden">
        {(requests || []).map((req: any) => (
          <article key={req.id} className="space-y-3 p-4">
            <div>
              <p className="font-bold text-foreground">{req.profiles?.full_name || "Unknown owner"}</p>
              <p className="text-sm text-muted-foreground">{req.profiles?.phone || "No phone number"}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3 text-sm">
              <p className="font-semibold text-foreground">{req.pgs?.name || "Owner verification"}</p>
              <p className="text-muted-foreground">{req.pgs?.cities?.name || "Owner verification only"}</p>
              <p className="mt-1 text-xs text-muted-foreground">{req.request_type} request{req.ownerProfile?.id_type ? ` · ${req.ownerProfile.id_type}` : ""}</p>
              {req.ownerProfile?.id_number && <p className="text-xs text-muted-foreground">ID: {req.ownerProfile.id_number}</p>}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              {req.signedDocUrl ? (
                <a href={req.signedDocUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-primary hover:underline">View document</a>
              ) : <span className="text-xs text-muted-foreground">No document</span>}
              <div className="flex gap-2">
                <Button size="sm" className="bg-success text-white" onClick={() => setApproveDialog(req.id)} disabled={processing === req.id}>Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => setRejectDialog(req.id)} disabled={processing === req.id}>Reject</Button>
              </div>
            </div>
          </article>
        ))}
        {(!requests || requests.length === 0) && <p className="p-6 text-center text-sm text-muted-foreground">No pending approval requests.</p>}
      </div>

      {/* Approve Dialog */}
      <Dialog open={!!approveDialog} onOpenChange={(open) => !open && setApproveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Verification?</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this verification request? This will allow the owner to proceed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setApproveDialog(null)}>Cancel</Button>
            <Button onClick={handleApprove} className="bg-success text-white hover:bg-success/90">
              Confirm Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={(open) => !open && setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this verification request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Rejection Reason *</label>
            <Input 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Government ID document is unclear."
              className="h-12"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>Cancel</Button>
            <Button onClick={handleReject} variant="destructive" disabled={!rejectReason.trim()}>
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
