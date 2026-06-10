"use client";

import { ReactNode } from "react";
// import { createAppKit, useAppKit } from "@reown/appkit/react";
// import { EthersAdapter } from "@reown/appkit-adapter-ethers";
// import { arbitrum, optimism } from "@reown/appkit/networks";

// 1. Get projectId at https://dashboard.reown.com
// const projectId = "5f7b9f8e70ea61696c529dad95f5d80f";

// 2. Create a metadata object
// const metadata = {
//   name: "Spinfox",
//   description: "Spinfox - Sports Betting on the Blockchain",
//   url: "https://Spinfox.com", // must match your domain
//   icons: ["https://avatars.mywebsite.com/"],
// };

// 3. Create the AppKit instance (singleton)
// createAppKit({
//   adapters: [new EthersAdapter()],
//   metadata,
//   networks: [optimism, arbitrum],
//   projectId,
//   features: {
//     analytics: true,
//   },
// });

// 4. Wrap your layout or app with AppKit provider
export function AppKitProvider({ children }: { children: ReactNode }) {
  // const appKit = useAppKit(); // now available for hooks, modals, etc.

  return (
    <>
      {children}
    </>
  );
}
