"use client";
import PageNotFound from "@/components/PageNotFound/PageNotFound";
import React from "react";
import Analytics from "@/components/Analytics/Analytics";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import DelegatesSession from "@/components/IndividualDAO/DelegatesSession";
import OfficeHours from "@/components/IndividualDAO/OfficeHours";
import DelegateSessionsMain from "@/components/DelegateSessions/DelegateSessionsMain";
import DaoOfficeHours from "@/components/OfficeHours/DaoOfficeHours";
import SessionPage from "@/app/(routes)/sessions/page"

function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const path = usePathname();

  return (
    <div>      
      <h1 className="text-5xl text-center pb-7 mt-5 ml-4 font-semibold">EigenLayer</h1>
      <div className="ml-0 pl-16 py-2 flex gap-12 justify-start text-base">
        <button
          className={` 
                mt-6 p-3 border-[#A7DBF2] border-1 rounded-full px-6 
                border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b eigenlayer:opacity-75 outline-none duration-1000  group
                ${
                  searchParams.get("eigenlayer") === "analytics"
                    ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3] btnShine"
                    : "text-white border-white"
                }`}
          onClick={() => router.push(path + "?eigenlayer=analytics")}
        >
          Analytics
        </button>

        <button
          className={` 
                mt-6 p-3 border-[#A7DBF2] border-1 rounded-full px-6 
                border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b eigenlayer:opacity-75 outline-none duration-1000  group
                ${
                  searchParams.get("eigenlayer") === "sessions"
                    ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3] btnShine"
                    : "text-white border-white"
                }`}
          onClick={() => router.push(path + "?eigenlayer=sessions")}
        >
          Sessions
        </button>

        <button
          className={` 
                mt-6 p-3 border-[#A7DBF2] border-1 rounded-full px-6 
                border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b eigenlayer:opacity-75 outline-none duration-1000  group
                ${
                  searchParams.get("eigenlayer") === "officeHours"
                    ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3] btnShine"
                    : "text-white border-white"
                }`}
          onClick={() => router.push(path + "?eigenlayer=officeHours")}
        >
          Office Hours
        </button>
      </div>

      <div className="py-6 ps-16">
        {searchParams.get("eigenlayer") === "analytics" ? (
          <Analytics />
        ) : searchParams.get("eigenlayer") === "sessions" ? (
          <SessionPage />
        ) : searchParams.get("eigenlayer") === "officeHours" ? (
          <DaoOfficeHours />
        ) : (
          ""
        )}
      </div>
      {/* <Analytics /> */}
    </div>
  );
}

export default Page;
