"use client";

import { useState } from "react";
import { Plus, Search, Filter, Phone, Mail, Calendar, BedDouble, AlertCircle, CheckCircle2, UserMinus, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { onboardTenant, checkoutTenant } from "@/app/actions/business_tenants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Tenant, Room, Bed } from "@/types/database.types";
import { SimpleProperty } from "@/components/shared/PropertySelector";

interface TenantManagerClientProps {
  tenants: any[];
  properties: SimpleProperty[];
  selectedPropertyId?: string | null;
  defaultOpenNew?: boolean;
}

export function TenantManagerClient({
  tenants,
  properties,
  selectedPropertyId,
  defaultOpenNew = false,
}: TenantManagerClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Onboard Modal State
  const [onboardOpen, setOnboardOpen] = useState(defaultOpenNew);
  const [targetPropertyId, setTargetPropertyId] = useState(
    selectedPropertyId && selectedPropertyId !== "all" ? selectedPropertyId : properties[0]?.id || ""
  );
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [bedNumber, setBedNumber] = useState("Bed 1");
  const [monthlyRent, setMonthlyRent] = useState(7500);
  const [securityDeposit, setSecurityDeposit] = useState(15000);
  const [moveInDate, setMoveInDate] = useState(new Date().toISOString().split("T")[0]);
  const [rentDueDay, setRentDueDay] = useState(1);
  const [onboardLoading, setOnboardLoading] = useState(false);
  const [onboardError, setOnboardError] = useState("");

  // Checkout Modal State
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedTenantForCheckout, setSelectedTenantForCheckout] = useState<any | null>(null);
  const [checkoutDate, setCheckoutDate] = useState(new Date().toISOString().split("T")[0]);
  const [deductions, setDeductions] = useState(0);
  const [refundAmount, setRefundAmount] = useState(0);
  const [checkoutNotes, setCheckoutNotes] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Tenant Details Modal State
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);

  // Filtered tenants
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesProperty =
      !selectedPropertyId || selectedPropertyId === "all" || t.pg_id === selectedPropertyId;
    return matchesSearch && matchesStatus && matchesProperty;
  });

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardLoading(true);
    setOnboardError("");

    // Look up or generate a room ID if none selected
    const res = await onboardTenant({
      propertyId: targetPropertyId,
      roomId: "00000000-0000-0000-0000-000000000000", // Will be created or mapped
      bedNumber: bedNumber.trim(),
      fullName,
      phone,
      email: email.trim() || undefined,
      emergencyContactName: emergencyName.trim() || undefined,
      emergencyContactPhone: emergencyPhone.trim() || undefined,
      monthlyRent,
      securityDeposit,
      moveInDate,
      rentDueDay,
    });

    setOnboardLoading(false);
    if (res.success) {
      setOnboardOpen(false);
      setFullName("");
      setPhone("");
      setEmail("");
      setEmergencyName("");
      setEmergencyPhone("");
    } else {
      setOnboardError(res.error || "Failed to onboard tenant");
    }
  };

  const openCheckout = (tenant: any) => {
    setSelectedTenantForCheckout(tenant);
    setRefundAmount(tenant.security_deposit || 0);
    setDeductions(0);
    setCheckoutNotes("");
    setCheckoutOpen(true);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantForCheckout) return;
    setCheckoutLoading(true);
    const res = await checkoutTenant({
      tenantId: selectedTenantForCheckout.id,
      checkoutDate,
      deductions,
      refundAmount,
      notes: checkoutNotes,
    });
    setCheckoutLoading(false);
    if (res.success) {
      setCheckoutOpen(false);
      setSelectedTenantForCheckout(null);
    } else {
      alert(res.error || "Failed to process checkout");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Status Filters, Onboard Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or phone..."
            className="pl-9 rounded-xl h-10 text-xs sm:text-sm bg-card"
          />
        </div>

        {/* Status Filter Tabs & Onboard CTA */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-muted/60 p-1 rounded-xl">
            {["ALL", "ACTIVE", "NOTICE", "MOVED_OUT"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === st
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {st === "ALL" ? "All" : st === "ACTIVE" ? "Active" : st === "NOTICE" ? "On Notice" : "Checked Out"}
              </button>
            ))}
          </div>

          <Button onClick={() => setOnboardOpen(true)} className="rounded-xl font-bold gap-2 text-xs h-9">
            <Plus className="w-4 h-4" />
            Onboard Tenant
          </Button>
        </div>
      </div>

      {/* Tenants Table */}
      {filteredTenants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
          <BedDouble className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h3 className="font-bold text-base text-foreground">No tenants found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== "ALL"
              ? "No tenants matched your search criteria."
              : "Onboard your first tenant to track occupancy, rent invoices, and collections."}
          </p>
          <Button onClick={() => setOnboardOpen(true)} className="mt-4 rounded-xl font-bold gap-2">
            <Plus className="w-4 h-4" />
            Onboard First Resident
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/60 text-xs font-semibold uppercase text-muted-foreground bg-muted/30">
                <tr>
                  <th className="py-3 px-4">Resident</th>
                  <th className="py-3 px-4">Property & Bed</th>
                  <th className="py-3 px-4">Rent</th>
                  <th className="py-3 px-4">Move-in</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-sm">{t.full_name}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {t.phone}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-xs">{t.pgs?.name || "Assigned PG"}</span>
                        <span className="text-xs text-muted-foreground">
                          {t.beds?.bed_number ? `${t.beds.bed_number}` : "Bed Assigned"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-foreground text-sm">
                      {formatCurrency(t.monthly_rent)}
                      <span className="text-xs text-muted-foreground font-normal"> /mo</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">
                      {formatDate(t.move_in_date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTenant(t);
                            setDetailOpen(true);
                          }}
                          className="h-8 text-xs font-semibold rounded-lg"
                        >
                          View
                        </Button>
                        {t.status === "ACTIVE" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCheckout(t)}
                            className="h-8 text-xs font-semibold rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400"
                          >
                            Checkout
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 1. ONBOARD TENANT MODAL */}
      <Dialog open={onboardOpen} onOpenChange={setOnboardOpen}>
        <DialogContent className="rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading font-extrabold text-xl">Onboard New Tenant</DialogTitle>
          </DialogHeader>

          {onboardError && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {onboardError}
            </div>
          )}

          <form onSubmit={handleOnboardSubmit} className="space-y-4 pt-1">
            {/* Property Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assign to PG Property *</Label>
              <select
                value={targetPropertyId}
                onChange={(e) => setTargetPropertyId(e.target.value)}
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

            {/* Resident Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Full Name *</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Phone Number *</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Email & Bed Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Email Address (Optional)</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Bed Number / Label *</Label>
                <Input
                  value={bedNumber}
                  onChange={(e) => setBedNumber(e.target.value)}
                  placeholder="e.g. Bed 1 / Room 102"
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Rent & Security Deposit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Monthly Rent (₹) *</Label>
                <Input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  min={500}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Security Deposit (₹) *</Label>
                <Input
                  type="number"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                  min={0}
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Move in date & Rent due day */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Move-In Date *</Label>
                <Input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Rent Due Day of Month</Label>
                <Input
                  type="number"
                  value={rentDueDay}
                  onChange={(e) => setRentDueDay(Number(e.target.value))}
                  min={1}
                  max={28}
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Emergency Contact Person</Label>
                <Input
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Parent / Guardian Name"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Emergency Contact Phone</Label>
                <Input
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="Emergency phone"
                  className="rounded-xl"
                />
              </div>
            </div>

            <Button type="submit" disabled={onboardLoading} className="w-full rounded-xl font-bold py-2.5">
              {onboardLoading ? "Allocating Bed & Invoicing..." : "Confirm & Onboard Tenant"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. CHECKOUT TENANT MODAL */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading font-extrabold text-lg text-rose-600 flex items-center gap-2">
              <UserMinus className="w-5 h-5" />
              Tenant Checkout Settlement
            </DialogTitle>
          </DialogHeader>

          {selectedTenantForCheckout && (
            <form onSubmit={handleCheckoutSubmit} className="space-y-4 pt-2">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1">
                <p className="font-bold text-foreground text-sm">{selectedTenantForCheckout.full_name}</p>
                <p className="text-muted-foreground">Original Deposit Held: <strong className="text-foreground">{formatCurrency(selectedTenantForCheckout.security_deposit || 0)}</strong></p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Checkout Date</Label>
                <Input
                  type="date"
                  value={checkoutDate}
                  onChange={(e) => setCheckoutDate(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Deductions (Damages/Dues)</Label>
                  <Input
                    type="number"
                    value={deductions}
                    onChange={(e) => {
                      const d = Number(e.target.value);
                      setDeductions(d);
                      setRefundAmount(Math.max(0, (selectedTenantForCheckout.security_deposit || 0) - d));
                    }}
                    min={0}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Deposit Refund (₹)</Label>
                  <Input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                    min={0}
                    className="rounded-xl font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Settlement Notes</Label>
                <Input
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                  placeholder="Key returned, room inspected in good condition"
                  className="rounded-xl"
                />
              </div>

              <Button type="submit" disabled={checkoutLoading} variant="destructive" className="w-full rounded-xl font-bold">
                {checkoutLoading ? "Processing Settlement..." : "Complete Checkout & Release Bed"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 3. TENANT DETAILS MODAL */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading font-extrabold text-lg">Resident Profile</DialogTitle>
          </DialogHeader>

          {selectedTenant && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div>
                  <h4 className="font-bold text-base text-foreground">{selectedTenant.full_name}</h4>
                  <p className="text-muted-foreground">{selectedTenant.phone} • {selectedTenant.email || "No email"}</p>
                </div>
                <StatusBadge status={selectedTenant.status} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/30">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Monthly Rent</span>
                  <p className="font-extrabold text-sm text-foreground">{formatCurrency(selectedTenant.monthly_rent)}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Security Deposit</span>
                  <p className="font-extrabold text-sm text-foreground">{formatCurrency(selectedTenant.security_deposit)}</p>
                </div>
              </div>

              <div className="space-y-2 pt-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Assigned Property:</span>
                  <strong className="text-foreground">{selectedTenant.pgs?.name || "N/A"}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Move-In Date:</span>
                  <strong className="text-foreground">{formatDate(selectedTenant.move_in_date)}</strong>
                </div>
                {selectedTenant.emergency_contact_name && (
                  <div className="flex justify-between">
                    <span>Emergency Contact:</span>
                    <strong className="text-foreground">{selectedTenant.emergency_contact_name} ({selectedTenant.emergency_contact_phone || "N/A"})</strong>
                  </div>
                )}
                {selectedTenant.notes && (
                  <div className="pt-2 border-t border-border/40">
                    <span className="block font-semibold text-foreground mb-0.5">Notes:</span>
                    <p className="text-muted-foreground italic">{selectedTenant.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

