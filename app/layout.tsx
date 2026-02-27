import type { Metadata } from "next";
import { Lora, DM_Sans } from "next/font/google";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prayer Wall",
  description: "Share your prayer request and let our community pray for you.",
  openGraph: {
    title: "Prayer Wall",
    description: "Share your prayer request and let our community pray for you.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lora.variable} ${dmSans.variable} antialiased bg-warm-bg text-charcoal`}
      >
        <main className="min-h-screen flex flex-col">
          <div className="flex-1">{children}</div>
          <footer className="py-6 text-center text-sm text-muted">
            Built with love for our community
          </footer>
        </main>
      </body>
    </html>
  );
}
