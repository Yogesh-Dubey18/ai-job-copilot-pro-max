import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Job Copilot Pro MAX',
  description: 'AI career operating system from resume upload to job offer.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
