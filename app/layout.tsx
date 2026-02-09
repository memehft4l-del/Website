import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Inter, Rajdhani, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.variable} ${inter.variable} ${rajdhani.variable} ${spaceGrotesk.variable} font-sans`} style={{ backgroundColor: '#0F172A' }}>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
