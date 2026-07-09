'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Users,
  ArrowRight,
  Clock,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

interface InvitationDetails {
  email: string;
  role: string;
  organizationName: string;
  organizationSlug: string;
  invitedBy: string;
  expiresAt: string;
  isExpired: boolean;
}

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus, update: updateSession } = useSession();
  const { t } = useLanguage();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultOrg, setResultOrg] = useState<{ name: string; slug: string } | null>(null);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError(t('auth.missingInvitationToken'));
      setLoading(false);
      return;
    }

    async function validateToken() {
      try {
        const res = await fetch(`/api/invitations/accept?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || t('auth.invalidInvitation'));
          setLoading(false);
          return;
        }

        setInvitation(data.invitation);
        setLoading(false);
      } catch {
        setError(t('auth.failedToValidateInvitation'));
        setLoading(false);
      }
    }

    validateToken();
  }, [token, t]);

  const handleAccept = async () => {
    if (!token) return;

    setAccepting(true);
    setError('');

    try {
      const res = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/auth/accept-invite?token=${token}`)}`);
          return;
        }
        setError(data.error || t('auth.failedToValidateInvitation'));
        setAccepting(false);
        return;
      }

      await updateSession();
      setSuccess(true);
      setResultMessage(data.message);
      setResultOrg(data.organization);
    } catch {
      setError(t('auth.failedToValidateInvitation'));
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0E11]">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#2BB5A2]" />
          <p className="mt-4 text-sm text-white/70">{t('invite.validating')}</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0E11] px-4">
        <div className="w-full max-w-md rounded-xl border border-white/[0.08] bg-[#12161B] p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/20">
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-white">{t('invite.invalidInvitation')}</h1>
          <p className="mb-6 text-sm text-white/70">{error}</p>
          <Link href="/auth/signin">
            <Button className="rounded-full bg-gradient-to-r from-[#1C8C7D] to-[#2BB5A2] text-white hover:opacity-90 transition-opacity">
              {t('invite.goToSignIn')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success && resultOrg) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0E11] px-4">
        <div className="w-full max-w-md rounded-xl border border-white/[0.08] bg-[#12161B] p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900/20">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-white">{t('invite.welcome')}</h1>
          <p className="mb-6 text-sm text-white/70">{resultMessage}</p>
          <Button
            onClick={() => {
              if (resultOrg?.slug) {
                const isProduction = window.location.hostname.endsWith('.onekof.com') || window.location.hostname === 'onekof.com';
                if (isProduction) {
                  window.location.href = `https://${resultOrg.slug}.onekof.com/dashboard`;
                } else {
                  window.location.href = `/dashboard`;
                }
              } else {
                router.push('/dashboard');
              }
            }}
            className="rounded-full bg-gradient-to-r from-[#1C8C7D] to-[#2BB5A2] text-white hover:opacity-90 transition-opacity"
          >
            {t('invite.goToDashboard')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0E11] px-4">
      <div className="w-full max-w-md rounded-xl border border-white/[0.08] bg-[#12161B] overflow-hidden">
        {/* Invitation header banner */}
        <div className="bg-gradient-to-br from-[#1C8C7D] to-[#0B3A34] px-8 py-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
            <Users className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-white">{t('invite.youreInvited')}</h1>
          <p className="mt-1 text-sm text-white">{t('invite.joinTeamOnOnekof')}</p>
        </div>

        <div className="p-8">
          {invitation?.isExpired ? (
            <div className="mb-6 rounded-xl border border-white/[0.08] bg-[#181D23] p-4 text-center">
              <XCircle className="mx-auto mb-2 h-6 w-6 text-red-400" />
              <p className="text-sm font-medium text-white">
                {t('invite.invitationExpired')}
              </p>
              <p className="mt-1 text-xs text-white/70">
                {t('invite.askNewInvitation')}
              </p>
            </div>
          ) : (
            <>
              {/* Invitation detail rows */}
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#181D23] p-3">
                  <span className="text-xs font-medium text-white/70">{t('invite.organization')}</span>
                  <span className="text-sm font-semibold text-white">{invitation?.organizationName}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#181D23] p-3">
                  <span className="text-xs font-medium text-white/70">{t('invite.invitedBy')}</span>
                  <span className="text-sm text-white">{invitation?.invitedBy}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#181D23] p-3">
                  <span className="text-xs font-medium text-white/70">{t('invite.role')}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#1C8C7D]/20 border border-[#1C8C7D]/30 px-2.5 py-0.5 text-xs font-medium text-[#2BB5A2]">
                    <Shield className="h-3 w-3" />
                    {invitation?.role}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#181D23] p-3">
                  <span className="text-xs font-medium text-white/70">{t('invite.expires')}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-white/70">
                    <Clock className="h-3 w-3" />
                    {invitation?.expiresAt ? new Date(invitation.expiresAt).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-white/[0.08] bg-[#181D23] p-3 text-center">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {sessionStatus === 'unauthenticated' ? (
                <div className="space-y-3">
                  <p className="text-center text-sm text-white/70">
                    {t('invite.signInOrCreate')}
                  </p>
                  <Link
                    href={`/auth/signin?callbackUrl=${encodeURIComponent(`/auth/accept-invite?token=${token}`)}`}
                    className="block"
                  >
                    <Button className="w-full rounded-full bg-gradient-to-r from-[#1C8C7D] to-[#2BB5A2] text-white hover:opacity-90 transition-opacity">
                      {t('invite.signInToAccept')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link
                    href={`/auth/signup?callbackUrl=${encodeURIComponent(`/auth/accept-invite?token=${token}`)}`}
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full rounded-full border-white/[0.08] bg-transparent text-white hover:bg-white/[0.06] hover:text-white"
                    >
                      {t('invite.createAccount')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full rounded-full bg-gradient-to-r from-[#1C8C7D] to-[#2BB5A2] text-white hover:opacity-90 transition-opacity"
                >
                  {accepting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('invite.accepting')}
                    </>
                  ) : (
                    <>
                      {t('invite.acceptInvitation')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0B0E11]">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#2BB5A2]" />
            <p className="mt-4 text-sm text-white/70">Loading...</p>
          </div>
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
