import DaoOfficeHours from "@/components/OfficeHours/DaoOfficeHours";
import React from "react";
import type { Metadata } from "next";

// export const metadata: Metadata = {
//   metadataBase: new URL("https://eigeninsight.vercel.app/"),
//   title: "EigenInsight",
//   description: "Empowering EigenLayer with Data, Engagement, and Knowledge",
//   openGraph: {
//     title: "Office Hours",
//     description:
//       "Find all the current, upcoming, and past office hours hosted by different AVSs, and easily search them by using Title or Host Address.",
//     url: "https://eigeninsight.vercel.app/office-hours?hours=ongoing",
//     siteName: "EigenInsight",
//     images: [
//       {
//         url: "https://gateway.lighthouse.storage/ipfs/QmPjZZxacLkRM1kPSBMmyV45MUtCHJPAPYW21cSds8gUet",
//         width: 800,
//         height: 600,
//         alt: "img",
//       },
//       {
//         url: "https://gateway.lighthouse.storage/ipfs/QmPjZZxacLkRM1kPSBMmyV45MUtCHJPAPYW21cSds8gUet",
//         width: 1800,
//         height: 1600,
//         alt: "img",
//       },
//     ],
//     locale: "en_US",
//     type: "website",
//   },
// };

function OfficeHoursPage() {
  return (
    <div>
      <DaoOfficeHours />
    </div>
  );
}

export default OfficeHoursPage;
