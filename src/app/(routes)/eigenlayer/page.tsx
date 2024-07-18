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

function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const [showComingSoon, setShowComingSoon] = useState(true);

  return (
    <div>
      <h1 className="text-5xl text-center pb-7 mt-5 font-semibold">
        EigenLayer
      </h1>
      {/* <div className="ml-0 pl-16 py-2 flex gap-12 justify-start text-base">
        <button
          className={` 
                mt-6 p-3 border-[#A7DBF2] border-1 rounded-full px-6 
                border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000  group
                ${
                  searchParams.get("active") === "analytics"
                    ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3] btnShine"
                    : "text-white border-white"
                }`}
          onClick={() => router.push(path + "?active=analytics")}
        >
          Analytics
        </button>

        <button
          className={` 
                mt-6 p-3 border-[#A7DBF2] border-1 rounded-full px-6 
                border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000  group
                ${
                  searchParams.get("active") === "recordedSessions"
                    ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3] btnShine"
                    : "text-white border-white"
                }`}
          onClick={() => router.push(path + "?active=recordedSessions")}
        >
          Sessions
        </button>

        <button
          className={` 
                mt-6 p-3 border-[#A7DBF2] border-1 rounded-full px-6 
                border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000  group
                ${
                  searchParams.get("hours") === "ongoing"
                    ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3] btnShine"
                    : "text-white border-white"
                }`}
          onClick={() => router.push(path + "?hours=ongoing")}
        >
          Office Hours
        </button>
      </div> */}

      <div className="py-6">
        {searchParams.get("active") === "analytics" ? (
          <Analytics />
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
