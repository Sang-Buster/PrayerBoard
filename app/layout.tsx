import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
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
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} antialiased bg-background text-foreground`}
      >
        <main className="min-h-screen flex flex-col">
          <div className="flex-1 flex flex-col">{children}</div>
          <footer className="py-6 text-center text-sm text-muted-foreground">
            Built with love for our community
          </footer>
        </main>
      </body>
    </html>
  );
}
