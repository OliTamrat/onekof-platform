'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  Receipt,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Loader2,
  Crown,
  Shield,
  Zap,
  Star,
  Calendar,
  Users,
  FolderKanban,
  HardDrive,
  ExternalLink,
  Landmark,
  Ban,
  Settings as SettingsIcon,
  Download,
  Printer,
  FileText,
  X,
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast-provider';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

interface Subscription {
  id: string;
  plan: string;
  interval: string;
  status: string;
  provider: string;
  providerSubId: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt: string | null;
  cancelAtPeriodEnd: boolean;
  amount: number;
  currency: string;
  createdAt: string;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  providerMethod: string | null;
  providerPayId: string | null;
  invoiceUrl: string | null;
  receiptUrl: string | null;
  description: string | null;
  createdAt: string;
}

interface OrgBilling {
  id: string;
  name: string;
  plan: string;
  status: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  billingEmail: string | null;
  maxMembers: number;
  maxProjects: number;
  maxStorage: number;
}

const PLAN_ICONS: Record<string, typeof Star> = {
  FREE: Star,
  STARTER: Zap,
  PROFESSIONAL: Shield,
  ENTERPRISE: Crown,
};

const PLAN_COLORS: Record<string, string> = {
  FREE: 'bg-gray-500/10 text-gray-500',
  STARTER: 'bg-blue-500/10 text-blue-500',
  PROFESSIONAL: 'bg-purple-500/10 text-purple-500',
  ENTERPRISE: 'bg-amber-500/10 text-amber-500',
};

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  ACTIVE: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Active' },
  TRIALING: { icon: Clock, color: 'text-blue-500', label: 'Trial' },
  PAST_DUE: { icon: AlertCircle, color: 'text-amber-500', label: 'Past Due' },
  CANCELED: { icon: XCircle, color: 'text-red-500', label: 'Canceled' },
  EXPIRED: { icon: XCircle, color: 'text-gray-400', label: 'Expired' },
  SUCCEEDED: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Paid' },
  PENDING: { icon: Clock, color: 'text-amber-500', label: 'Pending' },
  FAILED: { icon: XCircle, color: 'text-red-500', label: 'Failed' },
  REFUNDED: { icon: Ban, color: 'text-gray-400', label: 'Refunded' },
};

function useOrgId() {
  const [orgId, setOrgId] = useState<string | null>(null);
  useEffect(() => {
    fetch('/api/organizations')
      .then((r) => r.json())
      .then((data) => {
        const orgs = data.organizations || data;
        if (orgs?.length > 0) setOrgId(orgs[0].id);
      })
      .catch(() => {});
  }, []);
  return orgId;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatAmount(amount: number, currency: string) {
  const value = (amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 });
  return currency === 'ETB' ? `${value} ETB` : `$${value} ${currency}`;
}

export default function BillingSettingsPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const orgId = useOrgId();
  const success = searchParams.get('success');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);

  const { data, isLoading } = useQuery<{
    organization: OrgBilling;
    subscription: Subscription | null;
    payments: Payment[];
  }>({
    queryKey: ['billing', orgId],
    queryFn: async () => {
      const res = await fetch(`/api/billing/subscriptions?organizationId=${orgId}`);
      if (!res.ok) throw new Error('Failed to load billing');
      return res.json();
    },
    enabled: !!orgId,
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/billing/subscriptions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Cancel failed');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Subscription will cancel at the end of the billing period');
      setShowCancelConfirm(false);
      queryClient.invalidateQueries({ queryKey: ['billing'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to cancel subscription');
    },
  });

  const org = data?.organization;
  const sub = data?.subscription;
  const payments = data?.payments || [];
  const PlanIcon = PLAN_ICONS[org?.plan || 'FREE'] || Star;

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        {/* Header — matches members/settings page pattern */}
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                <CreditCard className="h-5 w-5 text-primary-500" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Billing & Subscription
                </h1>
                <p className="text-xs text-gray-600 dark:text-white/70">
                  Manage your plan, payment history, and billing details
                </p>
              </div>
            </div>
            <Link href="/pricing">
              <Button size="sm" className="gap-1.5">
                <ArrowUpRight className="h-3.5 w-3.5" />
                {sub ? 'Change Plan' : 'Upgrade'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-3 md:px-6 py-4 md:py-6 space-y-4">
            {/* Success banner */}
            {success && (
              <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-500">Payment successful</p>
                  <p className="text-xs text-emerald-500/70">
                    Your subscription has been activated. Thank you for choosing Onekof.
                  </p>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] p-12 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500 mx-auto" />
                <p className="mt-2 text-xs text-gray-500 dark:text-white/60">Loading billing information...</p>
              </div>
            ) : (
              <>
                {/* Current Plan */}
                <div className="rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
                  <div className="border-b border-gray-200 dark:border-white/[0.08] px-4 md:px-5 py-3">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Current Plan</h2>
                  </div>

                  <div className="p-4 md:p-5">
                    {/* Plan info row */}
                    <div className="flex items-center gap-3">
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', PLAN_COLORS[org?.plan || 'FREE'])}>
                        <PlanIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            {org?.plan || 'FREE'} Plan
                          </h3>
                          {sub && (
                            <span className={cn(
                              'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                              sub.cancelAtPeriodEnd
                                ? 'bg-amber-500/10 text-amber-500'
                                : sub.status === 'ACTIVE'
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : 'bg-gray-500/10 text-gray-400'
                            )}>
                              {sub.cancelAtPeriodEnd ? 'Canceling' : sub.status}
                            </span>
                          )}
                        </div>
                        {sub ? (
                          <p className="text-xs text-gray-500 dark:text-white/60 mt-0.5">
                            {formatAmount(sub.amount, sub.currency)} / {sub.interval.toLowerCase()} via{' '}
                            {sub.provider === 'STRIPE' ? 'Stripe' : 'Chapa'}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-white/60 mt-0.5">
                            Free plan — upgrade to unlock more features
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Limits grid */}
                    {org && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {[
                          { icon: Users, label: 'Members', value: org.maxMembers },
                          { icon: FolderKanban, label: 'Projects', value: org.maxProjects },
                          { icon: HardDrive, label: 'Storage', value: `${org.maxStorage} GB` },
                        ].map(({ icon: Icon, label, value }) => (
                          <div key={label} className="rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04] p-2.5">
                            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-white/30">
                              <Icon className="h-3 w-3" />
                              {label}
                            </div>
                            <div className="mt-1 text-base font-bold text-gray-900 dark:text-white">{value}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Billing cycle */}
                    {sub && (
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04] px-3 py-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-white/60">
                          <Calendar className="h-3.5 w-3.5" />
                          {sub.cancelAtPeriodEnd
                            ? `Access ends ${formatDate(sub.currentPeriodEnd)}`
                            : `Next billing: ${formatDate(sub.currentPeriodEnd)}`}
                        </div>
                        {sub.status === 'ACTIVE' && !sub.cancelAtPeriodEnd && (
                          <button
                            onClick={() => setShowCancelConfirm(true)}
                            className="text-xs text-red-400 hover:text-red-500 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment History */}
                <div className="rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
                  <div className="border-b border-gray-200 dark:border-white/[0.08] px-4 md:px-5 py-3 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                      <Receipt className="h-4 w-4 text-gray-400 dark:text-white/30" />
                      Payment History
                    </h2>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-white/30">
                      {payments.length} transaction{payments.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {payments.length === 0 ? (
                    <div className="p-8 text-center">
                      <FileText className="h-8 w-8 text-gray-300 dark:text-white/10 mx-auto" />
                      <p className="mt-2 text-xs text-gray-400 dark:text-white/30">
                        No payments yet. Your payment history will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                      {payments.map((payment) => {
                        const statusCfg = STATUS_CONFIG[payment.status] || STATUS_CONFIG.PENDING;
                        const StatusIcon = statusCfg.icon;

                        return (
                          <div key={payment.id} className="flex items-center gap-3 px-4 md:px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                            <StatusIcon className={cn('h-4 w-4 flex-shrink-0', statusCfg.color)} />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {payment.description || 'Subscription payment'}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-400 dark:text-white/30">
                                <span>{formatDate(payment.createdAt)}</span>
                                <span className="text-gray-200 dark:text-white/10">|</span>
                                {payment.provider === 'STRIPE' ? (
                                  <CreditCard className="h-3 w-3" />
                                ) : (
                                  <Landmark className="h-3 w-3" />
                                )}
                                <span>
                                  {payment.provider === 'STRIPE' ? 'Stripe' : 'Chapa'}
                                  {payment.providerMethod ? ` (${payment.providerMethod})` : ''}
                                </span>
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {formatAmount(payment.amount, payment.currency)}
                              </div>
                              <div className={cn('text-[11px] font-medium', statusCfg.color)}>
                                {statusCfg.label}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => setReceiptPayment(payment)}
                                className="rounded-md p-1.5 text-gray-300 hover:text-primary-500 hover:bg-primary-500/5 dark:text-white/20 dark:hover:text-primary-400 transition-colors"
                                title="View receipt"
                              >
                                <FileText className="h-3.5 w-3.5" />
                              </button>
                              {(payment.invoiceUrl || payment.receiptUrl) && (
                                <a
                                  href={payment.invoiceUrl || payment.receiptUrl || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-md p-1.5 text-gray-300 hover:text-primary-500 hover:bg-primary-500/5 dark:text-white/20 dark:hover:text-primary-400 transition-colors"
                                  title="Download invoice"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Test Mode Banner */}
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="mt-0.5 h-4 w-4 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-amber-500">Test Mode Active</p>
                      <p className="mt-0.5 text-[11px] text-amber-500/70 leading-relaxed">
                        Payments are in test mode. Use card{' '}
                        <code className="rounded bg-amber-500/10 px-1 py-0.5 font-mono text-[10px] text-amber-500">
                          4242 4242 4242 4242
                        </code>{' '}
                        with any future expiry and CVC. No real charges will be made.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-sm rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] p-5 shadow-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Cancel subscription?</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-white/60 leading-relaxed">
                Your subscription will remain active until the end of the current billing
                period. After that, your organization will be downgraded to the Free plan.
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 dark:border-white/[0.08] dark:text-white/60"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  Keep plan
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    'Yes, cancel'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {receiptPayment && org && (
          <ReceiptModal
            payment={receiptPayment}
            orgName={org.name}
            onClose={() => setReceiptPayment(null)}
          />
        )}
      </div>
    </AppLayout>
  );
}

/* ─── Receipt / Invoice Modal with Print/Download ─── */

function ReceiptModal({
  payment,
  orgName,
  onClose,
}: {
  payment: Payment;
  orgName: string;
  onClose: () => void;
}) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const invoiceNo = (payment.providerPayId || payment.id).slice(0, 24).toUpperCase();
  const date = formatDate(payment.createdAt);
  const method = `${payment.provider === 'STRIPE' ? 'Stripe' : 'Chapa'}${payment.providerMethod ? ` (${payment.providerMethod})` : ''}`;
  const total = formatAmount(payment.amount, payment.currency);
  const unitPrice = formatAmount(payment.amount, payment.currency);

  // Derive plan + billing period from description
  const desc = payment.description || 'Subscription Payment';
  const isYearly = desc.toLowerCase().includes('yearly');
  const periodStart = new Date(payment.createdAt);
  const periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodEnd.getMonth() + (isYearly ? 12 : 1));
  const periodStr = `${periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${periodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  function handlePrint() {
    const w = window.open('', '_blank', 'width=800,height=1000');
    if (!w) return;

    w.document.write(`<!DOCTYPE html>
<html><head>
<title>Onekof Invoice ${invoiceNo}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Inter',-apple-system,sans-serif;background:#f8fafb;color:#1e293b;font-size:13px}
  .page{max-width:680px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06)}

  /* ── Header band ── */
  .hdr{background:linear-gradient(135deg,#0f172a 0%,#1C8C7D 100%);color:#fff;padding:32px 40px 28px;text-align:center;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .logo{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:14px}
  .logo b{width:30px;height:30px;background:rgba(255,255,255,.15);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px}
  .logo span{font-size:20px;font-weight:800;letter-spacing:-.02em}
  .hdr .sub{font-size:11px;text-transform:uppercase;letter-spacing:.15em;color:rgba(255,255,255,.55);font-weight:600}
  .hdr .ref{font-size:11px;color:rgba(255,255,255,.4);margin-top:5px;font-family:'Courier New',monospace}
  .pill{display:inline-flex;align-items:center;gap:6px;background:rgba(16,185,129,.15);color:#34d399;font-size:11px;font-weight:700;padding:5px 14px;border-radius:20px;text-transform:uppercase;letter-spacing:.05em;margin-top:14px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .pill i{width:6px;height:6px;background:#34d399;border-radius:50%;display:inline-block}

  /* ── Body ── */
  .bd{padding:28px 40px 20px}

  /* Two-column info */
  .info{display:flex;justify-content:space-between;margin-bottom:24px}
  .info-col{flex:1}
  .info-col.right{text-align:right}
  .info-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;font-weight:600;margin-bottom:3px}
  .info-val{font-size:13px;font-weight:600;color:#1e293b}
  .info-val.sm{font-size:12px;font-weight:500;color:#64748b;margin-top:1px}

  /* Line-items table */
  table{width:100%;border-collapse:collapse;margin:0 0 20px}
  thead th{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;font-weight:600;padding:8px 0;border-bottom:2px solid #e2e8f0;text-align:left}
  thead th:last-child,thead th:nth-child(3),thead th:nth-child(2){text-align:right}
  tbody td{padding:12px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#1e293b;vertical-align:top}
  tbody td:last-child,tbody td:nth-child(3),tbody td:nth-child(2){text-align:right;font-weight:600}
  .desc-sub{font-size:11px;color:#94a3b8;font-weight:400;margin-top:2px}

  /* Totals */
  .totals{border-top:2px solid #e2e8f0;padding-top:12px;margin-top:4px}
  .totals .row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px}
  .totals .row .lbl{color:#64748b}
  .totals .row .val{font-weight:600}
  .totals .grand{border-top:2px solid #1e293b;margin-top:8px;padding-top:10px}
  .totals .grand .lbl{font-weight:700;color:#1e293b;font-size:14px}
  .totals .grand .val{font-weight:800;color:#1C8C7D;font-size:18px}

  /* Payment details */
  .pay-info{background:#f8fafb;border-radius:10px;padding:16px 20px;margin:20px 0 0;display:flex;gap:32px;flex-wrap:wrap}
  .pay-item .pay-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;font-weight:600;margin-bottom:2px}
  .pay-item .pay-val{font-size:12px;font-weight:600;color:#1e293b}

  /* Footer */
  .ftr{background:#f8fafb;padding:20px 40px;text-align:center;border-top:1px solid #f1f5f9}
  .ftr .co{font-size:12px;font-weight:700;color:#1C8C7D;margin-bottom:3px}
  .ftr .addr{font-size:11px;color:#94a3b8;line-height:1.5}
  .ftr .note{font-size:10px;color:#cbd5e1;margin-top:10px;font-style:italic}

  @media print{
    body{background:#fff}
    .page{box-shadow:none;margin:0;border-radius:0}
  }
  @page{margin:.4in;size:A4}
</style>
</head>
<body>
<div class="page">
  <div class="hdr">
    <div class="logo"><b>O</b><span>Onekof</span></div>
    <div class="sub">Invoice / Payment Receipt</div>
    <div class="ref">${invoiceNo}</div>
    <div class="pill"><i></i> ${payment.status === 'SUCCEEDED' ? 'Paid' : payment.status}</div>
  </div>

  <div class="bd">
    <!-- Two-column info -->
    <div class="info">
      <div class="info-col">
        <div class="info-lbl">Invoice Number</div>
        <div class="info-val" style="font-family:'Courier New',monospace;font-size:11px">${invoiceNo}</div>
        <div style="height:12px"></div>
        <div class="info-lbl">Date of Issue</div>
        <div class="info-val">${date}</div>
        <div style="height:12px"></div>
        <div class="info-lbl">Billing Period</div>
        <div class="info-val">${periodStr}</div>
      </div>
      <div class="info-col right">
        <div class="info-lbl">Bill To</div>
        <div class="info-val">${orgName}</div>
        <div class="info-val sm">Onekof Platform Subscriber</div>
        <div style="height:24px"></div>
        <div class="info-lbl">From</div>
        <div class="info-val">DAPS Analytics PLC</div>
        <div class="info-val sm">Addis Ababa, Ethiopia</div>
      </div>
    </div>

    <!-- Line items table -->
    <table>
      <thead>
        <tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>
            ${desc.replace(' (Demo)', '')}
            <div class="desc-sub">${periodStr}</div>
          </td>
          <td>1</td>
          <td>${unitPrice}</td>
          <td>${total}</td>
        </tr>
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="row"><span class="lbl">Subtotal</span><span class="val">${total}</span></div>
      <div class="row"><span class="lbl">Tax</span><span class="val">${payment.currency === 'ETB' ? 'VAT Exempt' : '$0.00'}</span></div>
      <div class="row grand"><span class="lbl">Total</span><span class="val">${total}</span></div>
    </div>

    <!-- Payment details -->
    <div class="pay-info">
      <div class="pay-item">
        <div class="pay-lbl">Payment Method</div>
        <div class="pay-val">${method}</div>
      </div>
      <div class="pay-item">
        <div class="pay-lbl">Transaction ID</div>
        <div class="pay-val" style="font-family:'Courier New',monospace;font-size:10px">${invoiceNo}</div>
      </div>
      <div class="pay-item">
        <div class="pay-lbl">Currency</div>
        <div class="pay-val">${payment.currency}</div>
      </div>
      <div class="pay-item">
        <div class="pay-lbl">Status</div>
        <div class="pay-val" style="color:#059669">${payment.status === 'SUCCEEDED' ? 'Paid in Full' : payment.status}</div>
      </div>
    </div>
  </div>

  <div class="ftr">
    <div class="co">DAPS Analytics PLC</div>
    <div class="addr">Addis Ababa, Ethiopia &middot; TIN: 0123456789<br/>support@onekof.com &middot; onekof.com</div>
    <div class="note">Computer-generated invoice/receipt — no signature required</div>
  </div>
</div>
<script>window.onload=function(){window.print()}</script>
</body></html>`);
    w.document.close();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] shadow-2xl overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-white/[0.08]">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Invoice / Receipt</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-white/30 dark:hover:text-white/60 dark:hover:bg-white/[0.05] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Preview */}
        <div ref={receiptRef} className="p-5 space-y-4">
          {/* Header preview */}
          <div className="rounded-lg bg-gradient-to-r from-[#0f172a] to-[#1C8C7D] p-4 text-center text-white">
            <img src="/logo-wordmark.png?v=2" alt="Onekof" className="h-12" />
            <div className="text-[10px] uppercase tracking-[0.12em] text-white/70 mt-0.5">Invoice / Receipt</div>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-bold uppercase text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              {payment.status === 'SUCCEEDED' ? 'Paid' : payment.status}
            </div>
          </div>

          {/* Invoice details preview */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-white/25 font-semibold">Invoice No.</div>
              <div className="font-mono text-[11px] font-medium text-gray-900 dark:text-white mt-0.5">{invoiceNo}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-white/25 font-semibold">Date</div>
              <div className="font-medium text-gray-900 dark:text-white mt-0.5">{date}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-white/25 font-semibold">Bill To</div>
              <div className="font-medium text-gray-900 dark:text-white mt-0.5">{orgName}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-white/25 font-semibold">Period</div>
              <div className="font-medium text-gray-900 dark:text-white mt-0.5">{periodStr}</div>
            </div>
          </div>

          {/* Line item */}
          <div className="border border-gray-100 dark:border-white/[0.05] rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-2 bg-gray-50 dark:bg-white/[0.03] px-3 py-2 text-[10px] uppercase tracking-wide text-gray-400 dark:text-white/25 font-semibold">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            <div className="grid grid-cols-12 gap-2 px-3 py-3 text-xs">
              <div className="col-span-6">
                <div className="font-medium text-gray-900 dark:text-white">{desc.replace(' (Demo)', '')}</div>
                <div className="text-[10px] text-gray-400 dark:text-white/25 mt-0.5">{periodStr}</div>
              </div>
              <div className="col-span-2 text-right font-medium text-gray-900 dark:text-white">1</div>
              <div className="col-span-2 text-right font-medium text-gray-900 dark:text-white">{unitPrice}</div>
              <div className="col-span-2 text-right font-semibold text-gray-900 dark:text-white">{total}</div>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-white/[0.05]">
            <span className="text-sm font-bold text-gray-900 dark:text-white">Total</span>
            <span className="text-xl font-extrabold text-primary-600 dark:text-primary-400">{total}</span>
          </div>

          {/* Payment info */}
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] p-3 text-[11px]">
            <div><span className="text-gray-400 dark:text-white/25">Method:</span> <span className="font-medium text-gray-700 dark:text-white/70">{method}</span></div>
            <div><span className="text-gray-400 dark:text-white/25">Currency:</span> <span className="font-medium text-gray-700 dark:text-white/70">{payment.currency}</span></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 py-3 border-t border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 dark:border-white/[0.08] dark:text-white/60"
            onClick={handlePrint}
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
          <Button
            size="sm"
            className="flex-1 gap-1.5"
            onClick={handlePrint}
          >
            <Download className="h-3.5 w-3.5" />
            Save as PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
