import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import { getSession } from "@/lib/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Imaxclean - Professional Cleaning Equipment & Chemical Catalog",
  description: "Explore premium industrial scrubber driers, high-pressure washers, eco-friendly chemical solutions, and janitorial supplies. Request custom B2B quotes easily.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSession();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        style={{ colorScheme: 'light' }}
    >
      <body className="min-h-full flex flex-col bg-brand-bg text-brand-fg">
        <Header user={user} />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
