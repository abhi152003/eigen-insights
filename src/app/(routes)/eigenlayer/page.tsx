"use client";
import PageNotFound from "@/components/PageNotFound/PageNotFound";
import React, { useState } from "react";
import Analytics from "@/components/Analytics/Analytics";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import DelegatesSession from "@/components/IndividualDAO/DelegatesSession";
import OfficeHours from "@/components/IndividualDAO/OfficeHours";
import DelegateSessionsMain from "@/components/DelegateSessions/DelegateSessionsMain";
import DaoOfficeHours from "@/components/OfficeHours/DaoOfficeHours";
import SessionPage from "@/app/(routes)/sessions/page";
import OfficeHoursPage from "../office-hours/page";
import RecordedSessions from "@/components/DelegateSessions/RecordedSessions";
import { RxCross2 } from "react-icons/rx";
import { ApolloProvider } from "@apollo/client";
import client from "@/components/utils/avsExplorerClient";

function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const [showComingSoon, setShowComingSoon] = useState(true);

  return (
    <div>
      <h2 className="text-4xl text-center pb-7 mt-5 font-semibold shineFont">
        EigenLayer
      </h2>

      <div className="">
        {searchParams.get("active") === "analytics" ? (
          <ApolloProvider client={client}>
            <Analytics />
          </ApolloProvider>
        ) : searchParams.get("active") === "recordedSessions" ? (
          <div className="ps-16 pe-16">
            <RecordedSessions />
          </div>
        ) : searchParams.get("active") === "officeHours" ? (
          <DaoOfficeHours />
        ) : searchParams.get("hours") === "ongoing" ? (
          <div className="ps-16 pe-16">
            {showComingSoon && (
              <div className="flex items-center w-fit bg-medium-blue border border-light-cyan rounded-full px-3 py-1 mb-1 font-poppins">
                <p className="text-md text-white mr-2">
                  Office hours are currently being developed. In the meantime,
                  please enjoy our 1:1 sessions.
                </p>
                <button
                  onClick={() => setShowComingSoon(false)}
                  className="text-light-cyan hover:text-deep-blue ps-3"
                >
                  <RxCross2 size={18} />
                </button>
              </div>
            )}
          </div>
        ) : (
          " "
        )}
      </div>
      {/* <Analytics /> */}
    </div>
  );
}

export default Page;
