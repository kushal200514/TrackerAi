import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "Striver's A2Z DSA Sheet — Day-by-Day Personal Roadmap",
  description: "Complete 495 problems personal roadmap with daily checklists, auto-reschedule, streak tracker, revision queuing, and direct links to TakeUForward, LeetCode, and editorials.",
  keywords: ['DSA', 'Striver', 'A2Z DSA Sheet', 'LeetCode', 'Coding Interview', 'Algorithms', 'Data Structures'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
