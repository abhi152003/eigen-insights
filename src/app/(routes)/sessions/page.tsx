import React from "react";
import DelegateSessionsMain from "@/components/DelegateSessions/DelegateSessionsMain";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://eigeninsight.vercel.app/"),
  title: "Eigen Insight",
  description: "Discover. Learn. Engage.",
  openGraph: {
    title: "Available Delegates",
    description:
      "Explore available delegates by DAO, date, and time to book sessions and unlock Web3 opportunities.",
    url: "https://eigeninsight.vercel.app/available-delegates",
    siteName: "Eigen Insight",
    images: [
      {
        url: "https://gateway.lighthouse.storage/ipfs/QmUEoQqvoYbfp9ZD3AHzDNBYTmwovDifVBxWByzr8mMKnT",
        width: 800,
        height: 600,
        alt: "img",
      },
      {
        url: "https://gateway.lighthouse.storage/ipfs/QmUEoQqvoYbfp9ZD3AHzDNBYTmwovDifVBxWByzr8mMKnT",
        width: 1800,
        height: 1600,
        alt: "img",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

function page() {
  return (
    <>
      <DelegateSessionsMain />
    </>
  );
}

export default page;
