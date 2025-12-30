"use client";

import dynamic from "next/dynamic";
import { ComponentProps } from "react";

// Dynamically import WalletMultiButton to prevent SSR hydration issues
const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  {
    ssr: false,
    loading: () => (
      <div className="bg-gradient-to-r from-purple-600 to-yellow-600 rounded-lg px-8 py-4 font-bold text-lg text-white opacity-50 cursor-not-allowed">
        Loading...
      </div>
    ),
  }
);

interface DynamicWalletButtonProps extends ComponentProps<typeof WalletMultiButton> {}

export function DynamicWalletButton(props: DynamicWalletButtonProps) {
  return <WalletMultiButton {...props} />;
}


