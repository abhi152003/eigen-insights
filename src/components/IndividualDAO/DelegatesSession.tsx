"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import search from "@/assets/images/daos/search.png";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import Tile from "../utils/Tile";
import SessionTile from "../utils/SessionTiles";
import { Oval, ThreeCircles } from "react-loader-spinner";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import AttestationModal from "../utils/AttestationModal";
import { IoSearchSharp } from "react-icons/io5";

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

function DelegatesSession({ props }: { props: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const dao_name = props;

  const [sessionDetails, setSessionDetails] = useState([]);
  const [tempSession, setTempSession] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  // console.log("propspropsprops", dao_name);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        const requestOptions: any = {
          method: "POST",
          redirect: "follow",
          body: JSON.stringify({
            dao_name: dao_name,
            address: "",
          }),
        };

        const response = await fetch(`/api/get-dao-sessions`, requestOptions);
        const result = await response.json();
        // console.log("resultt:", result);
        const resultData = await result.data;
        console.log("resultData", resultData);
        if (Array.isArray(resultData)) {
          const filtered: any = resultData.filter((session: Session) => {
            if (searchParams.get("session") === "upcoming") {
              return session.meeting_status === "Upcoming";
            } else if (searchParams.get("session") === "recorded") {
              return session.meeting_status === "Recorded";
            }
          });
          // console.log("filtered", filtered);
          setSearchQuery("");
          setSessionDetails(filtered);
          setTempSession(filtered);
          setDataLoading(false);
        } else {
          console.error("API response is not an array:", result);
        }
        // setSessionDetails(filtered);
        // console.log("filtered", filtered);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, [searchParams.get("session")]);

  useEffect(() => {
    setSessionDetails([]);
  }, [props]);

  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);

    if (query.length > 0) {
      setDataLoading(true);
      const raw = JSON.stringify({
        dao_name: dao_name,
      });

      const requestOptions: any = {
        method: "POST",
        body: raw,
        redirect: "follow",
      };
      const res = await fetch(`/api/search-session/${query}`, requestOptions);
      const result = await res.json();
      const resultData = await result.data;

      if (result.success) {
        const filtered: any = resultData.filter((session: Session) => {
          if (searchParams.get("session") === "upcoming") {
            return session.meeting_status === "Upcoming";
          } else if (searchParams.get("session") === "recorded") {
            return session.meeting_status === "Recorded";
          }
        });
        console.log("filtered: ", filtered);
        setSessionDetails(filtered);
        setDataLoading(false);
      }
    } else {
      setSessionDetails(tempSession);
      setDataLoading(false);
    }
  };

  return (
    <div className="font-poppins">
      <div className="searchBox searchShineWidthOfAVSs">
        <input
          className="searchInput"
          type="text"
          name=""
          placeholder="Search by title or host address"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <button className="searchButton">
          <IoSearchSharp className="iconExplore" />
        </button>
      </div>

      {/* <div>
        <AttestationModal props={true} />
      </div> */}

      <div className="pr-36 pt-3">
        <div className="my-3 flex w-fit gap-16 border-2 border-gray-400 px-6 rounded-xl text-sm">
          {/* <button
            className={`py-2 ${
              searchParams.get("session") === "upcoming"
                ? "text-[#3E3D3D] font-bold"
                : "text-[#7C7C7C]"
            }`}
            onClick={() =>
              router.push(path + "?active=delegatesSession&session=upcoming")
            }
          >
            Upcoming
          </button> */}
          <button
            className={`py-2 ${
              searchParams.get("session") === "recorded"
                ? "text-[#A7DBF2] font-medium"
                : "text-white"
            }`}
            onClick={() =>
              router.push(path + "?active=delegatesSession&session=recorded")
            }
          >
            Recorded
          </button>
        </div>

        <div className="py-10">
          {/* {searchParams.get("session") === "upcoming" &&
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
                // query={searchQuery}
              />
            ))} */}
          {searchParams.get("session") === "recorded" &&
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
                isSession={""}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default DelegatesSession;
