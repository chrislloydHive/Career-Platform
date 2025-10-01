import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { WorkflowProvider } from "@/contexts/WorkflowContext";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyNextRole - Discover Your Career Path",
  description: "Figure out what you're good at. Discover jobs you never knew existed. Start your career search.",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} antialiased bg-gray-950 text-gray-100`}
      >
        <SessionProvider>
          <WorkflowProvider>
            {children}
          </WorkflowProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
