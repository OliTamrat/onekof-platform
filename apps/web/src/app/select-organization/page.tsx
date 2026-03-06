'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Building2, ArrowRight, Loader2 } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  role: string;
}

export default function SelectOrganizationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchOrganizations();
    }
  }, [status, router]);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/user/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrganization = (org: Organization) => {
    // Redirect to organization subdomain
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';

    // For production
    if (window.location.hostname.includes('onekof.com')) {
      window.location.href = `${protocol}//${org.slug}.onekof.com/dashboard`;
    }
    // For local development
    else {
      window.location.href = `${protocol}//${org.slug}.localhost${port}/dashboard`;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <Building2 className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Select Your Organization
          </h1>
          <p className="text-gray-600">
            Choose which organization you'd like to access
          </p>
        </div>

        {organizations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">
              You're not a member of any organization yet.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Contact your administrator to get invited to an organization.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => handleSelectOrganization(org)}
                className="bg-white rounded-lg shadow-sm p-6 text-left hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-500 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>

                <h3 className="font-semibold text-gray-900 mb-1">{org.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{org.slug}.onekof.com</p>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {org.role}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {org.plan}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/auth/signout')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
