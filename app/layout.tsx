import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Elixir Pump - Home to Clash Royale Tournaments",
  description: "Elixir Pump: Hold $ELIXIR tokens to unlock exclusive Clash Royale tournament access and compete for prize pools",
  icons: {
    icon: [
      { url: "/elixir-icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/elixir-icon.svg", type: "image/svg+xml" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.variable} ${sora.variable} ${dmSans.variable} font-sans`} style={{ backgroundColor: '#0F172A' }}>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
