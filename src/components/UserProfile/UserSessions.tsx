import React, { useState, useEffect } from "react";
import ScheduledUserSessions from "./UserAllSessions/ScheduledUserSessions";
import BookedUserSessions from "./UserAllSessions/BookedUserSessions";
import AttendingUserSessions from "./UserAllSessions/AttendingUserSessions";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import EventTile from "../utils/EventTile";
// import HostedUserSessions from "./UserAllSessions/HostedUserSessions";
// import AttendedUserSessions from "./UserAllSessions/AttendedUserSessions";
import { useNetwork, useAccount } from "wagmi";
import Tile from "../utils/Tile";
import SessionTile from "../utils/SessionTiles";
import { Oval, ThreeCircles } from "react-loader-spinner";

interface UserSessionsProps {
  isDelegate: boolean | undefined;
  selfDelegate: boolean;
  daoName: string;
}

type Attendee = {
  attendee_address: string;
  attendee_uid?: string; // Making attendee_uid optional
};

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
  attendees: Attendee[];
  _id: string;
}

function UserSessions({
  isDelegate,
  selfDelegate,
  daoName,
}: UserSessionsProps) {
  const { address } = useAccount();
  // const address = "0x5e349eca2dc61abcd9dd99ce94d04136151a09ee";
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const { chain, chains } = useNetwork();
  const [sessionDetails, setSessionDetails] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  // const [daoName, setDaoName] = useState("");

  let dao_name = "";
  const getUserMeetingData = async () => {
    try {
      try {
        // setDataLoading(true);
        const response = await fetch(`/api/get-sessions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: address,
            dao_name: daoName,
          }),
        });

        // console.log("Response", response);

        const result = await response.json();
        console.log("result", result);
        if (result.success) {
          const hostedData = await result.hostedMeetings;
          console.log("hostedData", hostedData);
          const attendedData = await result.attendedMeetings;
          console.log("attendedData", attendedData);
          setDataLoading(true);
          if (searchParams.get("session") === "hosted") {
            setSessionDetails(hostedData);
            console.log("in session hosted");
          } else if (searchParams.get("session") === "attended") {
            setSessionDetails(attendedData);
          }
          setDataLoading(false);
        }
      } catch (error) {
        console.log("error in catch", error);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getUserMeetingData();
  }, [
    address,
    sessionDetails,
    searchParams.get("session"),
    dataLoading,
    chain,
    chain?.name,
    daoName,
  ]);

  // useEffect(() => {
  //   setDataLoading(true);
  //   setSessionDetails([]);
  // }, [searchParams.get("session")]);

  useEffect(() => {
    if (!selfDelegate && searchParams.get("session") === "schedule") {
      router.replace(path + "?active=sessions&session=attending");
    }
  }, [isDelegate, selfDelegate]);
  return (
    <div>
      <div className="pr-32 pt-3">
        <div className="flex gap-8 justify-center pl-6 rounded-xl text-sm">
          {selfDelegate === true && (
            <button
              className={`p-3 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-4 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group
                ${
                searchParams.get("session") === "schedule"
                  ? "text-white bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3]"
                  : "text-[#A7DBF2]"
              }`}
              onClick={() =>
                router.push(path + "?active=sessions&session=schedule")
              }
            >
            <span className="bg-navy-blue shadow-light-cyan absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-70 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
              Schedule
            </button>
          )}

          {selfDelegate === true && (
            <button
              className={`p-3 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-4 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group
                ${
                searchParams.get("session") === "book"
                  ? "text-white bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3]"
                  : "text-[#A7DBF2]"
              }`}
              onClick={() =>
                router.push(path + "?active=sessions&session=book")
              }
            >
            <span className="bg-navy-blue shadow-light-cyan absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-70 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
              Booked
            </button>
          )}
          <button
            className={`p-3 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-4 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group
              ${
              searchParams.get("session") === "attending"
                ? "text-white bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3]"
                : "text-[#A7DBF2]"
            }`}
            onClick={() =>
              router.push(path + "?active=sessions&session=attending")
            }
          >
          <span className="bg-navy-blue shadow-light-cyan absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-70 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
            Attending
          </button>
          {selfDelegate === true && (
            <button
              className={`p-3 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-4 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group
                ${
                searchParams.get("session") === "hosted"
                  ? "text-white bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3]"
                  : "text-[#A7DBF2]"
              }`}
              onClick={() =>
                router.push(path + "?active=sessions&session=hosted")
              }
            >
            <span className="bg-navy-blue shadow-light-cyan absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-70 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
              Hosted
            </button>
          )}
          <button
            className={`p-3 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-4 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group
              ${
              searchParams.get("session") === "attended"
                ? "text-white bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3]"
                : "text-[#A7DBF2]"
            }`}
            onClick={() => 
              router.push(path + "?active=sessions&session=attended")
            }
          >
          <span className="bg-navy-blue shadow-light-cyan absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-70 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
            Attended
          </button>
        </div>

        <div className="py-10">
          {selfDelegate === true &&
            searchParams.get("session") === "schedule" && (
              <ScheduledUserSessions daoName={daoName} />
            )}
          {selfDelegate === true && searchParams.get("session") === "book" && (
            <BookedUserSessions daoName={daoName} />
          )}
          {searchParams.get("session") === "attending" && (
            <AttendingUserSessions daoName={daoName} />
          )}
          {selfDelegate === false &&
            searchParams.get("session") === "hosted" &&
            (dataLoading ? (
              <div className="flex items-center justify-center">
                <ThreeCircles
                  visible={true}
                  height="60"
                  width="60"
                  color="#FFFFFF"
                  ariaLabel="three-circles-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                />
              </div>
            ) : (
              <SessionTile
                sessionDetails={sessionDetails}
                dataLoading={dataLoading}
                isEvent="Recorded"
                isOfficeHour={false}
                isSession="hosted"
              />
            ))}
          {searchParams.get("session") === "attended" &&
            (dataLoading ? (
              <div className="flex items-center justify-center">
                <ThreeCircles
                  visible={true}
                  height="60"
                  width="60"
                  color="#FFFFFF"
                  ariaLabel="three-circles-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                />
              </div>
            ) : (
              <SessionTile
                sessionDetails={sessionDetails}
                dataLoading={dataLoading}
                isEvent="Recorded"
                isOfficeHour={false}
                isSession="attended"
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default UserSessions;
