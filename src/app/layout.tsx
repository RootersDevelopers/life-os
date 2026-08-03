import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/query";
import { ToastProvider } from "@/components/ui";

export const metadata: Metadata = {
  title: "LifeOS — Live Better. Every Day.",
  description: "Your personal life operating system: plan, track, and improve every aspect of your life.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <ToastProvider>{children}</ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
