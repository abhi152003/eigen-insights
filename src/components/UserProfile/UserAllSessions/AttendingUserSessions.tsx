"use client";

import React, { useState, useEffect } from "react";
import text1 from "@/assets/images/daos/texture1.png";
import text2 from "@/assets/images/daos/texture2.png";
import Image from "next/image";
import { Tooltip } from "@nextui-org/react";
import EventTile from "../../utils/EventTile";
import { useAccount, useNetwork } from "wagmi";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import { Oval, ThreeCircles } from "react-loader-spinner";

type Attendee = {
  attendee_address: string;
  attendee_uid?: string; // Making attendee_uid optional
};

interface Session {
  booking_status: string;
  operator_or_avs: string;
  description: string;
  host_address: string;
  joined_status: string;
  meetingId: string;
  meeting_status: "Upcoming" | "Recorded" | "Denied" | "";
  slot_time: string;
  title: string;
  attendees: Attendee[];
  _id: string;
}

function AttendingUserSessions({ daoName }: { daoName: string }) {
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const { address } = useAccount();
  const [sessionDetails, setSessionDetails] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  const getUserMeetingData = async () => {
    try {
      const response = await fetch(`/api/get-session-data/${address}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operator_or_avs: daoName,
        }),
      });

      const result = await response.json();
      // console.log("result in get session data", result);

      if (result.success) {
        // setSessionDetails(result.data);
        const resultData = await result.data;
        console.log("resultData", resultData);
        setPageLoading(true);
        const currentTime = new Date();
        const currentSlot = new Date(currentTime.getTime() - 60 * 60 * 1000);
        if (Array.isArray(resultData)) {
          let filteredData: any = resultData;
          if (searchParams.get("session") === "attending") {
            filteredData = resultData.filter((session: Session) => {
              return (
                session.meeting_status !== "Recorded" &&
                new Date(session.slot_time).toLocaleString() >=
                  currentSlot.toLocaleString()
                // && session.operator_or_avs === daoName
              );
            });
            console.log("filtered data in attending: ", filteredData);
          }
          // console.log("filtered in attending", filteredData);
          setSessionDetails(filteredData);
          setPageLoading(false);
        }
      }
    } catch (error) {
      console.log("error in catch", error);
    }
  };

  useEffect(() => {
    getUserMeetingData();
  }, [searchParams.get("session")]);

  return (
    <div className="space-y-6">
      {pageLoading ? (
        <div className="flex items-center justify-center">
          <ThreeCircles
            visible={true}
            height="50"
            width="50"
            color="#FFFFFF"
            ariaLabel="three-circles-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      ) : sessionDetails.length > 0 ? (
        sessionDetails.map((data, index) => (
          <EventTile
            key={index}
            tileIndex={index}
            data={data}
            isEvent="Attending"
          />
        ))
      ) : (
        <div className="flex flex-col justify-center items-center">
          <div className="text-5xl">☹️</div>{" "}
          <div className="pt-4 font-semibold text-lg">
            Oops, no such result available!
          </div>
        </div>
      )}
    </div>
  );
}
export default AttendingUserSessions;
