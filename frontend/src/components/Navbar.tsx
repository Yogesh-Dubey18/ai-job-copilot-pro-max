'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, BookOpenCheck, BriefcaseBusiness, FileText, LayoutDashboard, LogOut, Settings, Shield, Sparkles, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { href: '/applications', label: 'Applications', icon: BriefcaseBusiness },
  { href: '/resume', label: 'Resume', icon: FileText },
  { href: '/interview', label: 'Interview', icon: BookOpenCheck },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/tools', label: 'AI Tools', icon: Sparkles },
  { href: '/profile', label: 'Profile', icon: UserRound },
  { href: '/admin', label: 'Admin', icon: Shield },
  { href: '/settings', label: 'Settings', icon: Settings }
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

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
          {links.map((link) => {
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
