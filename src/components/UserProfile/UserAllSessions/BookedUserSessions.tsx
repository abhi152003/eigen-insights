"use client";

import React, { useState, useEffect } from "react";
import text1 from "@/assets/images/daos/texture1.png";
import text2 from "@/assets/images/daos/texture2.png";
import Image from "next/image";
import { FaCircleCheck, FaCircleXmark, FaCirclePlay } from "react-icons/fa6";
import { Tooltip } from "@nextui-org/react";
import EventTile from "../../utils/EventTile";
import { useAccount, useNetwork } from "wagmi";
import toast, { Toaster } from "react-hot-toast";
import { Oval, ThreeCircles } from "react-loader-spinner";

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
  user_address: string;
  _id: string;
}

function BookedUserSessions({ daoName }: { daoName: string }) {
  const { address } = useAccount();
  // const address = "0x5e349eca2dc61abcd9dd99ce94d04136151a09ee";
  const [sessionDetails, setSessionDetails] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  const getMeetingData = async () => {
    try {
      const response = await fetch(`/api/get-meeting/${address}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      // console.log("result in get meeting", result);
      let filteredData: any = result.data;
      if (result.success) {
        const currentTime = new Date();
        const currentSlot = new Date(currentTime.getTime() - 60 * 60 * 1000);

        filteredData = result.data.filter(
          (session: Session) =>
            session.operator_or_avs === daoName &&
            session.meeting_status !== "Recorded" &&
            new Date(session.slot_time).toLocaleString() >=
              currentSlot.toLocaleString()
        );

        setSessionDetails(filteredData);
        setPageLoading(false);
      } else {
        setPageLoading(false);
      }
    } catch (error) {
      console.log("error in catch", error);
    }
  };

  useEffect(() => {
    getMeetingData();
  }, [address, sessionDetails]);

  return (
    <>
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
              isEvent="Book"
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
    </>
  );
}

export default BookedUserSessions;
