"use client";

import { useState, useEffect } from "react";
import { Plus, CreditCard, Receipt, FileText, Wallet, AlertCircle, ArrowUpRight, Check, Trash2, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  recordPayment,
  generateInvoice,
  generateBulkMonthlyInvoices,
  createExpense,
  deleteExpense,
  createUtilityBill,
} from "@/app/actions/business_finances";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SimpleProperty } from "@/components/shared/PropertySelector";

interface FinanceManagerClientProps {
  properties: SimpleProperty[];
  invoices: any[];
  payments: any[];
  expenses: any[];
  utilityBills: any[];
  tenants: any[];
  selectedPropertyId?: string | null;
}

export function FinanceManagerClient({
  properties,
  invoices,
  payments,
  expenses,
  utilityBills,
  tenants,
  selectedPropertyId,
}: FinanceManagerClientProps) {
  const [activeTab, setActiveTab] = useState("invoices");

  // 1. Record Payment Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payTenantId, setPayTenantId] = useState(tenants[0]?.id || "");
  const [payPropertyId, setPayPropertyId] = useState(properties[0]?.id || "");
  const [payInvoiceId, setPayInvoiceId] = useState<string>("");
  const [payAmount, setPayAmount] = useState(7500);
  const [payMode, setPayMode] = useState<"CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE" | "ONLINE">("UPI");
  const [payRef, setPayRef] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payNotes, setPayNotes] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  // 2. Generate Invoice Modal State
  const [invModalOpen, setInvModalOpen] = useState(false);
  const [invTenantId, setInvTenantId] = useState(tenants[0]?.id || "");
  const [invMonthYear, setInvMonthYear] = useState("");
  const [invRent, setInvRent] = useState(7500);
  const [invUtility, setInvUtility] = useState(0);
  const [invDueDate, setInvDueDate] = useState("");
  const [invLoading, setInvLoading] = useState(false);

  // 3. Add Expense Modal State
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [expPropertyId, setExpPropertyId] = useState(properties[0]?.id || "");
  const [expCategory, setExpCategory] = useState("Maintenance");
  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState(1500);
  const [expDate, setExpDate] = useState("");

  useEffect(() => {
    const now = new Date();
    setInvMonthYear(`${now.toLocaleString("en-US", { month: "short" })} ${now.getFullYear()}`);
    const due = new Date();
    due.setDate(due.getDate() + 5);
    setInvDueDate(due.toISOString().split("T")[0]);
    setExpDate(now.toISOString().split("T")[0]);
  }, []);
  const [expVendor, setExpVendor] = useState("");
  const [expLoading, setExpLoading] = useState(false);

  // 4. Bulk Invoicing State
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayLoading(true);
    const res = await recordPayment({
      tenantId: payTenantId,
      propertyId: payPropertyId,
      invoiceId: payInvoiceId || null,
      amount: payAmount,
      paymentMode: payMode,
      transactionRef: payRef,
      paymentDate: payDate,
      notes: payNotes,
    });
    setPayLoading(false);
    if (res.success) {
      setPayModalOpen(false);
      setPayRef("");
      setPayNotes("");
    } else {
      alert(res.error || "Failed to record payment");
    }
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvLoading(true);
    const targetTenant = tenants.find((t) => t.id === invTenantId);
    const res = await generateInvoice({
      tenantId: invTenantId,
      propertyId: targetTenant?.pg_id || properties[0]?.id || "",
      monthYear: invMonthYear,
      rentAmount: invRent,
      utilityAmount: invUtility,
      dueDate: invDueDate,
    });
    setInvLoading(false);
    if (res.success) {
      setInvModalOpen(false);
    } else {
      alert(res.error || "Failed to generate invoice");
    }
  };

  const handleBulkInvoice = async () => {
    if (!confirm(`Generate monthly rent invoices for all active residents for ${invMonthYear}?`)) return;
    setBulkLoading(true);
    const res = await generateBulkMonthlyInvoices(
      selectedPropertyId || "all",
      invMonthYear,
      invDueDate
    );
    setBulkLoading(false);
    alert(res.message);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpLoading(true);
    const res = await createExpense({
      propertyId: expPropertyId,
      category: expCategory,
      title: expTitle,
      amount: expAmount,
      expenseDate: expDate,
      vendorName: expVendor,
    });
    setExpLoading(false);
    if (res.success) {
      setExpModalOpen(false);
      setExpTitle("");
      setExpVendor("");
    } else {
      alert(res.error || "Failed to save expense");
    }
  };

  // Calculations for summary banner
  const totalBilled = invoices.reduce((s, i) => s + (i.total_amount || 0), 0);
  const totalCollected = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = invoices.reduce((s, i) => s + (i.balance_due || 0), 0);
  const totalSpent = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const netProfit = totalCollected - totalSpent;

  return (
    <div className="space-y-6">
      {/* Financial Health Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Total Collected</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 font-heading">{formatCurrency(totalCollected)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Pending Balance</span>
          <p className="text-xl sm:text-2xl font-black text-rose-600 font-heading">{formatCurrency(totalPending)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Total Expenses</span>
          <p className="text-xl sm:text-2xl font-black text-foreground font-heading">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Net Cash Flow</span>
          <p className={`text-xl sm:text-2xl font-black font-heading ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {formatCurrency(netProfit)}
          </p>
        </div>
      </div>

      {/* Tabs & Action CTAs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList className="bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="invoices" className="rounded-lg text-xs font-semibold">
              Invoices ({invoices.length})
            </TabsTrigger>
            <TabsTrigger value="payments" className="rounded-lg text-xs font-semibold">
              Payments ({payments.length})
            </TabsTrigger>
            <TabsTrigger value="expenses" className="rounded-lg text-xs font-semibold">
              Expenses ({expenses.length})
            </TabsTrigger>
            <TabsTrigger value="utilities" className="rounded-lg text-xs font-semibold">
              Utilities ({utilityBills.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => setPayModalOpen(true)}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-semibold gap-1.5 h-9"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              Record Payment
            </Button>

            <Button
              onClick={() => setExpModalOpen(true)}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-semibold gap-1.5 h-9"
            >
              <Receipt className="w-3.5 h-3.5 text-rose-600" />
              Add Expense
            </Button>

            <Button
              onClick={() => setInvModalOpen(true)}
              size="sm"
              className="rounded-xl text-xs font-bold gap-1.5 h-9"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* 1. INVOICES TAB */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium">
              Monthly rent invoices generated for your residents.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBulkInvoice}
              disabled={bulkLoading}
              className="text-xs font-bold text-primary hover:bg-primary/10 rounded-lg"
            >
              {bulkLoading ? "Generating..." : "⚡ Bulk Invoice All Active Tenants"}
            </Button>
          </div>

          {invoices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-60" />
              <p className="font-bold text-sm text-foreground">No invoices generated yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">Click "Create Invoice" or run Bulk Invoicing.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border/60 text-xs font-semibold uppercase text-muted-foreground bg-muted/30">
                    <tr>
                      <th className="py-3 px-4">Invoice No</th>
                      <th className="py-3 px-4">Resident</th>
                      <th className="py-3 px-4">Cycle</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Paid</th>
                      <th className="py-3 px-4">Due</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs font-semibold text-foreground">
                          {inv.invoice_number}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-xs text-foreground">{inv.tenants?.full_name || "Resident"}</p>
                          <p className="text-[11px] text-muted-foreground">{inv.pgs?.name}</p>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground">
                          {inv.month_year}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-foreground text-xs">
                          {formatCurrency(inv.total_amount)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-600 text-xs">
                          {formatCurrency(inv.paid_amount || 0)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-rose-600 text-xs">
                          {formatCurrency(inv.balance_due || 0)}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={inv.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* 2. PAYMENTS TAB */}
        <TabsContent value="payments" className="space-y-4">
          {payments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
              <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-60" />
              <p className="font-bold text-sm text-foreground">No payments recorded yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">Click "Record Payment" to log tenant transactions.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border/60 text-xs font-semibold uppercase text-muted-foreground bg-muted/30">
                    <tr>
                      <th className="py-3 px-4">Receipt</th>
                      <th className="py-3 px-4">Resident</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Mode</th>
                      <th className="py-3 px-4">Ref ID</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs font-semibold text-primary">
                          {p.receipt_number}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-xs text-foreground">{p.tenants?.full_name || "Resident"}</p>
                          <p className="text-[11px] text-muted-foreground">{p.pgs?.name}</p>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-emerald-600 text-sm">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="text-[10px] font-semibold uppercase">
                            {p.payment_mode}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                          {p.transaction_ref || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground">
                          {formatDate(p.payment_date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* 3. EXPENSES TAB */}
        <TabsContent value="expenses" className="space-y-4">
          {expenses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
              <Receipt className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-60" />
              <p className="font-bold text-sm text-foreground">No operating expenses recorded</p>
              <p className="text-xs text-muted-foreground mt-0.5">Track repairs, staff salaries, and bills.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border/60 text-xs font-semibold uppercase text-muted-foreground bg-muted/30">
                    <tr>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Expense Title</th>
                      <th className="py-3 px-4">Property</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Vendor</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {expenses.map((e) => (
                      <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="text-[10px] font-semibold">
                            {e.category}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-xs text-foreground">
                          {e.title}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground">
                          {e.pgs?.name}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-rose-600 text-xs">
                          {formatCurrency(e.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground">
                          {e.vendor_name || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground">
                          {formatDate(e.expense_date)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              if (confirm("Delete this expense?")) {
                                await deleteExpense(e.id);
                              }
                            }}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* 4. UTILITIES TAB */}
        <TabsContent value="utilities" className="space-y-4">
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs text-center">
            <h4 className="font-bold text-base text-foreground">Utility Bills Automation</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Electricity, water, and WiFi bills can be tracked and automatically split or billed to residents.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL 1: RECORD PAYMENT */}
      <Dialog open={payModalOpen} onOpenChange={setPayModalOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading font-extrabold text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Record Rent Payment
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRecordPayment} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Resident *</Label>
              <select
                value={payTenantId}
                onChange={(e) => {
                  setPayTenantId(e.target.value);
                  const t = tenants.find((item) => item.id === e.target.value);
                  if (t) {
                    setPayPropertyId(t.pg_id);
                    setPayAmount(t.monthly_rent || 7500);
                  }
                }}
                required
                className="w-full px-3 py-2 rounded-xl border border-input bg-card text-sm font-medium"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name} ({t.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Amount Received (₹) *</Label>
                <Input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  min={1}
                  required
                  className="rounded-xl font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Payment Method *</Label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-card text-sm font-medium"
                >
                  <option value="UPI">UPI (GPay / PhonePe)</option>
                  <option value="CASH">Cash in Hand</option>
                  <option value="BANK_TRANSFER">Bank IMPS / NEFT</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Transaction / UPI Ref</Label>
                <Input
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. UPI-123456"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Payment Date *</Label>
                <Input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Notes (Optional)</Label>
              <Input
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="Received for this month"
                className="rounded-xl"
              />
            </div>

            <Button type="submit" disabled={payLoading} className="w-full rounded-xl font-bold">
              {payLoading ? "Generating Receipt..." : "Confirm & Record Payment"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: CREATE INVOICE */}
      <Dialog open={invModalOpen} onOpenChange={setInvModalOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading font-extrabold text-lg">Generate Rent Invoice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGenerateInvoice} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Resident *</Label>
              <select
                value={invTenantId}
                onChange={(e) => {
                  setInvTenantId(e.target.value);
                  const t = tenants.find((item) => item.id === e.target.value);
                  if (t) setInvRent(t.monthly_rent || 7500);
                }}
                required
                className="w-full px-3 py-2 rounded-xl border border-input bg-card text-sm font-medium"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name} ({t.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Billing Cycle *</Label>
                <Input
                  value={invMonthYear}
                  onChange={(e) => setInvMonthYear(e.target.value)}
                  placeholder="e.g. Nov 2026"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Base Rent (₹) *</Label>
                <Input
                  type="number"
                  value={invRent}
                  onChange={(e) => setInvRent(Number(e.target.value))}
                  min={500}
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Utilities / WiFi (₹)</Label>
                <Input
                  type="number"
                  value={invUtility}
                  onChange={(e) => setInvUtility(Number(e.target.value))}
                  min={0}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Due Date *</Label>
                <Input
                  type="date"
                  value={invDueDate}
                  onChange={(e) => setInvDueDate(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            <Button type="submit" disabled={invLoading} className="w-full rounded-xl font-bold">
              {invLoading ? "Creating Invoice..." : "Issue Rent Invoice"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: ADD EXPENSE */}
      <Dialog open={expModalOpen} onOpenChange={setExpModalOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading font-extrabold text-lg">Log Operating Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddExpense} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Property *</Label>
              <select
                value={expPropertyId}
                onChange={(e) => setExpPropertyId(e.target.value)}
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
                <Label className="text-xs font-semibold">Category *</Label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-card text-sm font-medium"
                >
                  <option value="Maintenance">Repairs & Maintenance</option>
                  <option value="Electricity">Electricity / Power</option>
                  <option value="Water">Water Supply</option>
                  <option value="Internet">WiFi & Internet</option>
                  <option value="Staff Salary">Staff Wages / Salary</option>
                  <option value="Groceries">Food & Groceries</option>
                  <option value="Cleaning">Housekeeping Supplies</option>
                  <option value="Other">Other Expenses</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Amount (₹) *</Label>
                <Input
                  type="number"
                  value={expAmount}
                  onChange={(e) => setExpAmount(Number(e.target.value))}
                  min={1}
                  required
                  className="rounded-xl font-bold text-rose-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Expense Title / Description *</Label>
              <Input
                value={expTitle}
                onChange={(e) => setExpTitle(e.target.value)}
                placeholder="e.g. Geyser plumbing repair"
                required
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Vendor / Payee</Label>
                <Input
                  value={expVendor}
                  onChange={(e) => setExpVendor(e.target.value)}
                  placeholder="e.g. Bharat Hardware"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Date *</Label>
                <Input
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            <Button type="submit" disabled={expLoading} className="w-full rounded-xl font-bold">
              {expLoading ? "Saving..." : "Save Expense"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

