import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Atlas Prime - Lead Generation Platform",
  description: "AI-powered lead generation and business intelligence platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <ConvexClientProvider>
            {children}
            <Toaster />
            <SonnerToaster position="bottom-right" richColors />
          </ConvexClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
