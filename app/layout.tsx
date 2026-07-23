import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CBAMI System | Criminal Behaviour Assessment & Mapping',
  description:
    'Advanced AI-powered Criminal Behaviour Assessment Mapping and Intrusion Identification System using pattern recognition and Gemini 2.5 Flash.',
  keywords: ['criminal analysis', 'behaviour assessment', 'intrusion detection', 'pattern recognition', 'AI forensics'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={spaceGrotesk.className}>
      <body>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
