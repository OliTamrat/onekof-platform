'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Loader2, Mail, Lock, User, ArrowRight, Building2, CheckCircle2, Smartphone, Eye, EyeOff, TrendingUp, Users, Zap, Calendar, Languages, Bot, Shield } from 'lucide-react';

interface OrganizationInfo {
  id: string;
  name: string;
  slug: string;
  plan: string;
  memberCount: number;
}

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [organization, setOrganization] = useState<OrganizationInfo | null>(null);
  const [isMainDomain, setIsMainDomain] = useState(true);

  // Detect organization from subdomain
  useEffect(() => {
    const detectOrganization = async () => {
      const hostname = window.location.hostname;
      const isSubdomain =
        hostname.includes('.') &&
        !hostname.startsWith('www.') &&
        (hostname.endsWith('.onekof.com') || hostname.endsWith('.localhost'));

      if (isSubdomain) {
        setIsMainDomain(false);
        let subdomain = '';

        if (hostname.endsWith('.onekof.com')) {
          subdomain = hostname.replace('.onekof.com', '');
        } else if (hostname.endsWith('.localhost')) {
          subdomain = hostname.replace('.localhost', '');
        }

        try {
          const response = await fetch(`/api/organizations/by-slug/${subdomain}`);
          if (response.ok) {
            const data = await response.json();
            setOrganization(data.organization);
          }
        } catch (err) {
          console.error('Failed to fetch organization:', err);
        }
      }
    };

    detectOrganization();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Redirect to onboarding
      router.push('/onboarding?email=' + encodeURIComponent(email));
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* LEFT SIDE - DARK - Success Stories + Mobile App */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1B1F23] via-[#22272B] to-[#1B1F23] relative overflow-hidden">
        {/* Subtle animated accents */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-[#1C8C7D]/20 to-emerald-600/10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-tr from-[#1C8C7D]/15 to-teal-600/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Ethiopian flag accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="flex-1 bg-[#078930]" />
          <div className="flex-1 bg-[#FCDD09]" />
          <div className="flex-1 bg-[#DA121A]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1C8C7D] to-emerald-600 shadow-lg">
              <span className="text-xl font-bold text-white">O</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Onekof</h1>
              <p className="text-sm text-slate-300">Enterprise Project Management</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-10">
            {/* Heading */}
            <div>
              <h2 className="text-5xl font-bold text-white leading-tight mb-6">
                Join Ethiopia's<br />
                <span className="bg-gradient-to-r from-[#1C8C7D] to-emerald-400 bg-clip-text text-transparent">Project Platform</span>
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed max-w-md">
                The complete project management platform with Ethiopian calendar, native languages, and smart AI automation.
              </p>
            </div>

            {/* Feature Grid - Same as Sign In */}
            <div className="grid grid-cols-2 gap-6 max-w-lg">
              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1C8C7D]/20 border border-[#1C8C7D]/30">
                  <Calendar className="h-5 w-5 text-[#1C8C7D]" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Ethiopian Calendar</div>
                  <div className="text-xs text-slate-400">የኢትዮጵያ ዘመን አቆጣጠር</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1C8C7D]/20 border border-[#1C8C7D]/30">
                  <Languages className="h-5 w-5 text-[#1C8C7D]" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">4 Languages</div>
                  <div className="text-xs text-slate-400">አማርኛ, ትግርኛ, Afaan Oromo</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1C8C7D]/20 border border-[#1C8C7D]/30">
                  <Zap className="h-5 w-5 text-[#1C8C7D]" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">AI-Powered</div>
                  <div className="text-xs text-slate-400">Smart automation</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1C8C7D]/20 border border-[#1C8C7D]/30">
                  <Shield className="h-5 w-5 text-[#1C8C7D]" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Secure</div>
                  <div className="text-xs text-slate-400">Multi-tenant isolation</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center gap-8 pt-8 border-t border-slate-700/50">
            <div>
              <div className="text-2xl font-bold text-white mb-1">500+</div>
              <div className="text-xs text-slate-400">Organizations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">10K+</div>
              <div className="text-xs text-slate-400">Active Projects</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">99.9%</div>
              <div className="text-xs text-slate-400">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - WHITE - Sign Up Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1C8C7D] to-emerald-600">
              <span className="text-xl font-bold text-white">O</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Onekof</h1>
              <p className="text-xs text-gray-600">Enterprise Project Management</p>
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h3>
            <p className="text-gray-600 mb-8">
              Already have an account?{' '}
              <Link href="/auth/signin" className="font-semibold text-[#1C8C7D] hover:text-emerald-600 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border-2 border-gray-200 bg-white py-3.5 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-all focus:border-[#1C8C7D] focus:outline-none focus:ring-4 focus:ring-[#1C8C7D]/10"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border-2 border-gray-200 bg-white py-3.5 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-all focus:border-[#1C8C7D] focus:outline-none focus:ring-4 focus:ring-[#1C8C7D]/10"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border-2 border-gray-200 bg-white py-3.5 pl-12 pr-12 text-gray-900 placeholder-gray-400 transition-all focus:border-[#1C8C7D] focus:outline-none focus:ring-4 focus:ring-[#1C8C7D]/10"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border-2 border-gray-200 bg-white py-3.5 pl-12 pr-12 text-gray-900 placeholder-gray-400 transition-all focus:border-[#1C8C7D] focus:outline-none focus:ring-4 focus:ring-[#1C8C7D]/10"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#1C8C7D] to-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1C8C7D]/20 transition-all hover:shadow-xl hover:shadow-[#1C8C7D]/30 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#1C8C7D]/30 disabled:opacity-50 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Create account</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </button>
          </form>

          {/* Next Steps Info */}
          <div className="mt-8 rounded-xl bg-gray-50 border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#1C8C7D] flex-shrink-0 mt-0.5" />
              <div className="text-sm flex-1">
                <p className="font-semibold text-gray-900 mb-1">Quick 2-minute setup</p>
                <p className="text-gray-600">
                  After signup, we'll help you create your workspace and invite your team
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-gray-500">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
          <p className="mt-2 text-center text-xs text-gray-500">
            © 2026 Onekof. Built with ❤️ for Ethiopia
          </p>
        </div>
      </div>
    </div>
  );
}
