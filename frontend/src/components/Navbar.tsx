'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bot, BriefcaseBusiness, ChevronDown, FileText, LayoutDashboard, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const mainLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { href: '/resume', label: 'Resume', icon: FileText },
  { href: '/applications', label: 'Applications', icon: BriefcaseBusiness },
  { href: '/tools', label: 'AI Assistant', icon: Bot }
];

const moreLinks = [
  { href: '/analytics', label: 'Analytics' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/responses', label: 'Responses' },
  { href: '/daily-digest', label: 'Daily Digest' },
  { href: '/interview', label: 'Interview' },
  { href: '/profile', label: 'Profile' },
  { href: '/settings', label: 'Settings' },
  { href: '/admin', label: 'Admin' }
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<'user' | 'admin'>('user');

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((response) => response.json())
      .then((payload) => setRole(payload.user?.role === 'admin' ? 'admin' : 'user'))
      .catch(() => setRole('user'));
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="font-black tracking-tight text-slate-950">
          AI Job Copilot Pro MAX
        </Link>
        <div className="flex items-center gap-2">
          {mainLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100',
                  pathname === link.href && 'bg-slate-950 text-white hover:bg-slate-900'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
          <div className="group relative">
            <button type="button" className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              More <ChevronDown className="h-4 w-4" />
            </button>
            <div className="invisible absolute right-0 top-full w-48 rounded-lg border border-slate-200 bg-white p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
              {moreLinks.filter((link) => link.href !== '/admin' || role === 'admin').map((link) => (
                <Link key={link.href} href={link.href} className="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
