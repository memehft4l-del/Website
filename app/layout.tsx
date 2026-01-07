import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Elixir Pump - Home to Clash Royale Tournaments",
  description: "Elixir Pump: Hold $ELIXIR tokens to unlock exclusive Clash Royale tournament access and compete for prize pools",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.variable} ${inter.variable} font-sans`} style={{ backgroundColor: '#0F172A' }}>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
