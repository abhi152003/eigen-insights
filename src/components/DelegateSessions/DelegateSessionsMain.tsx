"use client";

import React, { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import AvailableSessions from "./AvailableSessions";
import RecordedSessions from "./RecordedSessions";
import { FaCircleInfo } from "react-icons/fa6";
import { Tooltip } from "@nextui-org/react";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";

function DelegateSessionsMain() {
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();

  return (
    <>
      <div className="">
        <div className="flex justify-between pt-6 pl-14 pr-14">
          <div className="flex font-quanty font-medium text-4xl text-light-cyan mx-3 pb-4 items-center">
            {/* <div>
              <Tooltip
                showArrow
                content={
                  <div className="font-poppins">
                    Explore available delegates by DAO, date, and time to book
                    sessions and unlock Web3 opportunities.
                  </div>
                }
                placement="right"
                className="rounded-md bg-opacity-90 max-w-96"
                closeDelay={1}
              >
                <div> Available Delegates</div>
              </Tooltip>
            </div>  */}
            Sessions
          </div>
          <div>
            <ConnectWalletWithENS />
          </div>
        </div>

        <div className="flex gap-12 bg-[#D9D9D945] pl-16 font-poppins">
          <button
            className={`border-b-2 py-3 px-2 ${
              searchParams.get("active") === "recordedSessions"
                ? " border-light-cyan text-light-cyan font-semibold"
                : "border-transparent"
            }`}
            onClick={() => router.push(path + "?active=recordedSessions")}
          >
            <Tooltip
              showArrow
              content={
                <div className="font-poppins text-white">
                  Browse previously recorded sessions.
                </div>
              }
              placement="right"
              className="rounded-md bg-deep-blue bg-opacity-90 max-w-96"
              closeDelay={1}
            >
              <div>Recorded</div>
            </Tooltip>
          </button>
          <button
            className={`border-b-2 py-3 px-2 ${
              searchParams.get("active") === "availableDelegates"
                ? "border-light-cyan text-light-cyan font-semibold"
                : "border-transparent"
            }`}
            onClick={() => router.push(path + "?active=availableDelegates")}
          >
            <Tooltip
              showArrow
              content={
                <div className="font-poppins text-white">
                  Explore available delegates by DAO, date, and time to book
                  sessions and unlock Web3 opportunities.
                </div>
              }
              placement="right"
              className="rounded-md bg-deep-blue bg-opacity-90 max-w-96"
              closeDelay={1}
            >
              <div> Available Delegates</div>
            </Tooltip>
          </button>
        </div>

        <div className="py-6 pl-14 pr-6">
          {searchParams.get("active") === "recordedSessions" ? (
            <RecordedSessions />
          ) : (
            ""
          )}
          {searchParams.get("active") === "availableDelegates" ? (
            <AvailableSessions />
          ) : (
            ""
          )}
        </div>

        {/* <div className="mt-1">
          <AvailableSessions />
        </div> */}
      </div>
    </>
  );
}

export default DelegateSessionsMain;
