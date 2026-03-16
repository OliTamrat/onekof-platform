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
  const { data: session, status: sessionStatus } = useSession();
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
      setError('Missing invitation token');
      setLoading(false);
      return;
    }

    async function validateToken() {
      try {
        const res = await fetch(`/api/invitations/accept?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Invalid invitation');
          setLoading(false);
          return;
        }

        setInvitation(data.invitation);
        setLoading(false);
      } catch {
        setError('Failed to validate invitation');
        setLoading(false);
      }
    }

    validateToken();
  }, [token]);

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
        setError(data.error || 'Failed to accept invitation');
        setAccepting(false);
        return;
      }

      setSuccess(true);
      setResultMessage(data.message);
      setResultOrg(data.organization);
    } catch {
      setError('Failed to accept invitation');
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#1B1F23]">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-500" />
          <p className="mt-4 text-sm text-gray-600 dark:text-slate-400">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#1B1F23] px-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Invalid Invitation</h1>
          <p className="mb-6 text-sm text-gray-600 dark:text-slate-400">{error}</p>
          <Link href="/auth/signin">
            <Button className="bg-primary-500 hover:bg-primary-600 text-white">
              Go to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success && resultOrg) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#1B1F23] px-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Welcome!</h1>
          <p className="mb-6 text-sm text-gray-600 dark:text-slate-400">{resultMessage}</p>
          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-primary-500 hover:bg-primary-600 text-white"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#1B1F23] px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] overflow-hidden">
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-8 py-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
            <Users className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-white">You&apos;re Invited!</h1>
          <p className="mt-1 text-sm text-white/80">Join your team on Onekof</p>
        </div>

        <div className="p-8">
          {invitation?.isExpired ? (
            <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-4 text-center">
              <XCircle className="mx-auto mb-2 h-6 w-6 text-red-500" />
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                This invitation has expired
              </p>
              <p className="mt-1 text-xs text-red-600 dark:text-red-500">
                Please ask the sender for a new invitation
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-[#1B1F23] p-3">
                  <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Organization</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{invitation?.organizationName}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-[#1B1F23] p-3">
                  <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Invited by</span>
                  <span className="text-sm text-gray-900 dark:text-white">{invitation?.invitedBy}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-[#1B1F23] p-3">
                  <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Role</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 dark:bg-primary-900/20 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:text-primary-400">
                    <Shield className="h-3 w-3" />
                    {invitation?.role}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-[#1B1F23] p-3">
                  <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Expires</span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-slate-400">
                    <Clock className="h-3 w-3" />
                    {invitation?.expiresAt ? new Date(invitation.expiresAt).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-3 text-center">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              {sessionStatus === 'unauthenticated' ? (
                <div className="space-y-3">
                  <p className="text-center text-sm text-gray-600 dark:text-slate-400">
                    Sign in or create an account to accept this invitation
                  </p>
                  <Link
                    href={`/auth/signin?callbackUrl=${encodeURIComponent(`/auth/accept-invite?token=${token}`)}`}
                    className="block"
                  >
                    <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white">
                      Sign In to Accept
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link
                    href={`/auth/signup?callbackUrl=${encodeURIComponent(`/auth/accept-invite?token=${token}`)}`}
                    className="block"
                  >
                    <Button variant="outline" className="w-full border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white">
                      Create Account
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white"
                >
                  {accepting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      Accept Invitation
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
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#1B1F23]">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-500" />
            <p className="mt-4 text-sm text-gray-600 dark:text-slate-400">Loading...</p>
          </div>
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
