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
  title: "$ELIXIR - Token-Gated Tournament",
  description: "Hold $ELIXIR tokens to unlock exclusive tournament access",
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
