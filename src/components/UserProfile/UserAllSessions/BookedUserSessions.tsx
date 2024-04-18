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
import { Oval } from "react-loader-spinner";

interface Session {
  booking_status: string;
  dao_name: string;
  description: string;
  host_address: string;
  joined_status: string;
  meetingId: string;
  meeting_status: "Upcoming" | "Recorded" | "Denied";
  slot_time: string;
  title: string;
  user_address: string;
  _id: string;
}

function BookedUserSessions() {
  const { address } = useAccount();
  // const address = "0x5e349eca2dc61abcd9dd99ce94d04136151a09ee";
  const [sessionDetails, setSessionDetails] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const { chain, chains } = useNetwork();

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
        const currentSlot = new Date(currentTime.getTime() + 60 * 60 * 1000);
        if (chain?.name === "Optimism") {
          filteredData = result.data.filter(
            (session: Session) =>
              session.dao_name === "optimism" &&
              session.meeting_status !== "Recorded" &&
              new Date(session.slot_time).toLocaleString() >
                currentSlot.toLocaleString()
          );
        } else if (chain?.name === "Arbitrum One") {
          filteredData = result.data.filter(
            (session: Session) =>
              session.dao_name === "arbitrum" &&
              session.meeting_status !== "Recorded" &&
              new Date(session.slot_time).toLocaleString() >
                currentSlot.toLocaleString()
          );
        }
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
            <Oval
              visible={true}
              height="40"
              width="40"
              color="#0500FF"
              secondaryColor="#cdccff"
              ariaLabel="oval-loading"
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
