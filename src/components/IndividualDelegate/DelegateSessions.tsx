import React, { useState, useEffect } from "react";
import Tile from "../utils/Tile";
import BookSession from "./AllSessions/BookSession";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import text1 from "@/assets/images/daos/texture1.png";
import SessionTile from "../utils/SessionTiles";
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

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

function DelegateSessions({ props }: { props: Type }) {
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();

  const [dataLoading, setDataLoading] = useState(true);
  const [sessionDetails, setSessionDetails] = useState([]);
  const operator_or_avs = props.daoDelegates;

  // const operator_or_avs = daoName.charAt(0).toUpperCase() + daoName.slice(1);

  const getMeetingData = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        operator_or_avs: operator_or_avs,
        address: props.individualDelegate,
      });
      // console.log("raw", raw);
      const requestOptions: any = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      const response = await fetch("/api/get-dao-sessions", requestOptions);
      const result = await response.json();
      console.log("result in get meetinggggg", result);

      if (result) {
        const resultData = await result.data;
        // console.log("resultData", resultData);
        if (Array.isArray(resultData)) {
          // setDataLoading(true);
          let filteredData: any = resultData;
          if (searchParams.get("session") === "upcoming") {
            setDataLoading(true);
            filteredData = resultData.filter((session: Session) => {
              return session.meeting_status === "Upcoming";
            });
            console.log("upcoming filtered: ", filteredData);
            setSessionDetails(filteredData);
          } else if (searchParams.get("session") === "hosted") {
            setDataLoading(true);
            filteredData = resultData.filter((session: Session) => {
              return (
                session.meeting_status === "Recorded" &&
                session.host_address.toLowerCase() === props.individualDelegate
              );
            });
            console.log("hosted filtered: ", filteredData);
            setSessionDetails(filteredData);
          } else if (searchParams.get("session") === "attended") {
            setDataLoading(true);
            filteredData = resultData.filter((session: Session) => {
              return (
                session.meeting_status === "Recorded" &&
                session.attendees?.some(
                  (attendee) =>
                    attendee.attendee_address === props.individualDelegate
                )
              );
            });
            console.log("attended filtered: ", filteredData);
            setSessionDetails(filteredData);
          }
          // console.log("filtered", filteredData);
          // setSessionDetails(filteredData);
          setDataLoading(false);
        } else {
          setDataLoading(false);
        }
      } else {
        setDataLoading(false);
      }
    } catch (error) {
      console.log("error in catch", error);
    }
  };

  useEffect(() => {
    getMeetingData();
  }, [
    props.daoDelegates,
    props.individualDelegate,
    sessionDetails,
    searchParams.get("session"),
  ]);

  return (
    <div>
      <div className="pr-36 pt-3">
        <div className="flex gap-16 border-2 border-gray-400 px-6 rounded-xl text-sm">
          <button
            className={`py-2  ${
              searchParams.get("session") === "book"
                ? "text-[#A7DBF2] font-medium"
                : "text-white"
            }`}
            onClick={() =>
              router.push(path + "?active=delegatesSession&session=book")
            }
          >
            Book
          </button>
          {/* <button
            className={`py-2  ${
              searchParams.get("session") === "ongoing"
                ? "text-[#A7DBF2] font-medium"
                : "text-white"
            }`}
            onClick={() =>
              router.push(path + "?active=delegatesSession&session=ongoing")
            }
          >
            Ongoing
          </button> */}
          <button
            className={`py-2 ${
              searchParams.get("session") === "upcoming"
                ? "text-[#A7DBF2] font-medium"
                : "text-white"
            }`}
            onClick={() =>
              router.push(path + "?active=delegatesSession&session=upcoming")
            }
          >
            Upcoming
          </button>
          <button
            className={`py-2 ${
              searchParams.get("session") === "hosted"
                ? "text-[#A7DBF2] font-medium"
                : "text-white"
            }`}
            onClick={() =>
              router.push(path + "?active=delegatesSession&session=hosted")
            }
          >
            Hosted
          </button>
          <button
            className={`py-2 ${
              searchParams.get("session") === "attended"
                ? "text-[#A7DBF2] font-medium"
                : "text-white"
            }`}
            onClick={() =>
              router.push(path + "?active=delegatesSession&session=attended")
            }
          >
            Attended
          </button>
        </div>

        <div className="py-10">
          {searchParams.get("session") === "book" && (
            <BookSession props={props} />
          )}
          {/* {searchParams.get("session") === "ongoing" && (
            <>
            <Tile sessionDetails={sessionDetails} dataLoading={dataLoading} isEvent="Ongoing" isOfficeHour={false} />
            </>
          )} */}
          {searchParams.get("session") === "upcoming" &&
            (dataLoading ? (
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
            ) : (
              <SessionTile
                sessionDetails={sessionDetails}
                dataLoading={dataLoading}
                isEvent="Upcoming"
                isOfficeHour={false}
                isSession=""
              />
            ))}
          {searchParams.get("session") === "hosted" &&
            (dataLoading ? (
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
            ) : (
              <SessionTile
                sessionDetails={sessionDetails}
                dataLoading={dataLoading}
                isEvent="Recorded"
                isOfficeHour={false}
                isSession=""
              />
            ))}
          {searchParams.get("session") === "attended" &&
            (dataLoading ? (
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
            ) : (
              <SessionTile
                sessionDetails={sessionDetails}
                dataLoading={dataLoading}
                isEvent="Recorded"
                isOfficeHour={false}
                isSession=""
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default DelegateSessions;
