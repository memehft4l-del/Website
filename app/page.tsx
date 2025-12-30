"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// Dynamically import wallet hook to prevent SSR issues
const WalletStatus = dynamic(
  () => import("@/components/WalletStatus").then((mod) => ({ default: mod.WalletStatus })),
  { 
    ssr: false
  }
);

export default function Home() {
  return <WalletStatus />;
}
