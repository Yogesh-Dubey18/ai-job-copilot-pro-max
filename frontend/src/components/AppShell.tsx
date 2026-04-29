import { ReactNode } from 'react';
import { AIAssistantPopup } from './AIAssistantPopup';
import { Navbar } from './Navbar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Navbar />
      <main>{children}</main>
      <AIAssistantPopup />
    </div>
  );
}
