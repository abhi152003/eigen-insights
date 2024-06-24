"use client";

import React, { useState, useEffect } from "react";
import search from "@/assets/images/daos/search.png";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import text1 from "@/assets/images/daos/texture1.png";
import text2 from "@/assets/images/daos/texture2.png";
import { StaticImageData } from "next/image";
import Tile from "../utils/Tile";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Oval, ThreeCircles } from "react-loader-spinner";
import { Tooltip } from "@nextui-org/react";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import { RxCross2 } from "react-icons/rx";
import { IoSearchSharp } from "react-icons/io5";
import "../../css/SearchShine.css"
import "../../css/BtnShine.css"
import "../../css/ShineFont.css"

interface Type {
  img: StaticImageData;
  title: string;
  dao: string;
  participant: number;
  attendee: string;
  host: string;
  started: string;
  desc: string;
}

interface Session {
  _id: string;
  host_address: string;
  office_hours_slot: string;
  title: string;
  description: string;
  meeting_status: "ongoing" | "active" | "inactive"; // Define the possible statuses
  dao_name: string;
}

function DaoOfficeHours() {
  const [activeSection, setActiveSection] = useState("ongoing");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();

  const [sessionDetails, setSessionDetails] = useState<Type[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showComingSoon, setShowComingSoon] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions: RequestInit = {
          method: "GET",
          headers: myHeaders,
        };

        const response = await fetch(
          "/api/get-specific-officehours",
          requestOptions
        );
        const result = await response.json();
        console.log(result);

        // Filter sessions based on meeting_status
        const filteredSessions = result.filter((session: Session) => {
          if (searchParams.get("hours") === "ongoing") {
            return session.meeting_status === "ongoing";
          } else if (searchParams.get("hours") === "upcoming") {
            return session.meeting_status === "active";
          } else if (searchParams.get("hours") === "recorded") {
            return session.meeting_status === "inactive";
          }
        });

        setSessionDetails(filteredSessions);
        setDataLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [searchParams.get("hours")]); // Re-fetch data when filter changes

  useEffect(() => {
    // Set initial session details
    setSessionDetails([]);
    setDataLoading(true);
  }, []);

  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);

    if (query.length > 0) {
      setDataLoading(true);

      const requestOptions: any = {
        method: "POST",
        body: JSON.stringify({
          dao_name: null,
        }),
        redirect: "follow",
      };
      const res = await fetch(
        `/api/search-officehours/${query}`,
        requestOptions
      );
      const result = await res.json();
      const resultData = await result.data;

      if (result.success) {
        const filtered: any = resultData.filter((session: Session) => {
          if (searchParams.get("hours") === "ongoing") {
            return session.meeting_status === "ongoing";
          } else if (searchParams.get("hours") === "upcoming") {
            return session.meeting_status === "active";
          } else if (searchParams.get("hours") === "recorded") {
            return session.meeting_status === "inactive";
          }
        });
        console.log("filtered: ", filtered);
        setSessionDetails(filtered);
        setDataLoading(false);
      }
    } else {
      // setSessionDetails(tempDetails);
      setDataLoading(false);
    }
  };

  return (
    <div className="pt-6 pl-14 pr-6">
      <div className="flex justify-between pe-10">
        <div className="font-quanty font-medium text-4xl pb-4 pl-2">
          <Tooltip
            showArrow
            content={
              <div className="font-poppins">
                Find all the current, upcoming, and past office hours hosted by
                different DAOs, and easily search them by using Title or Host
                Address.
              </div>
            }
            placement="right"
            className="rounded-md bg-opacity-90 max-w-96 bg-deep-blue"
            closeDelay={1}
          >
            <div>Office Hours</div>
          </Tooltip>
        </div>
        <div>
          <ConnectWalletWithENS />
        </div>
      </div>

      {showComingSoon && (
        <div className="flex items-center w-fit bg-light-blue border border-light-cyan rounded-full px-3 py-1 mb-1 font-poppins">
          <p className="text-md text-white mr-2">
            Office hours are currently being developed. In the meantime, please
            enjoy our 1:1 sessions.
          </p>
          <button
            onClick={() => setShowComingSoon(false)}
            className="text-light-cyan hover:text-deep-blue ps-3"
          >
            <RxCross2 size={18} />
          </button>
        </div>
      )}

      <div className="pr-32 pt-4 font-poppins">
        <div className="flex gap-8 justify-start rounded-xl text-md">
          <button
            className={`p-3 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-4 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group
              ${
              searchParams.get("hours") === "ongoing"
                ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3]"
                : "text-white"
            }`}
            onClick={() => router.push(path + "?hours=ongoing")}
          >
            <span className="bg-navy-blue shadow-light-cyan absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-70 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
            Ongoing
          </button>
          <button
            className={`p-3 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-4 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group
              ${
              searchParams.get("hours") === "upcoming"
                ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3]"
                : "text-white border-white"
            }`}
            onClick={() => router.push(path + "?hours=upcoming")}
          >
            <span className="bg-navy-blue shadow-light-cyan absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-70 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
            Upcoming
          </button>
          <button
            className={`p-3 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-4 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group
              ${
              searchParams.get("hours") === "recorded"
                ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3]"
                : "text-white border-white"
            }`}
            onClick={() => router.push(path + "?hours=recorded")}
          >
            <span className="bg-navy-blue shadow-light-cyan absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-70 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
            Recorded
          </button>
        </div>

        {/* <div
          style={{ background: "rgba(238, 237, 237, 0.36)" }}
          className="flex border-[0.5px] border-black w-1/3 rounded-full my-8 font-poppins"
        >
          <input
            type="text"
            placeholder="Search by title or host address"
            style={{ background: "rgba(238, 237, 237, 0.36)" }}
            className="pl-5 rounded-full outline-none w-full py-2"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          ></input>
          <span className="flex items-center bg-black rounded-full px-6 py-2">
            <Image src={search} alt="search" width={22} />
          </span>
        </div> */}

        <div className="searchBox searchShineWidthOfcHour my-7">
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

        <div className="py-5">
          {searchParams.get("hours") === "ongoing" &&
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
              <Tile
                sessionDetails={sessionDetails}
                dataLoading={dataLoading}
                isEvent="Ongoing"
                isOfficeHour={true}
              />
            ))}
          {searchParams.get("hours") === "upcoming" &&
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
              <Tile
                sessionDetails={sessionDetails}
                dataLoading={dataLoading}
                isEvent="Upcoming"
                isOfficeHour={true}
              />
            ))}
          {searchParams.get("hours") === "recorded" &&
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
              <Tile
                sessionDetails={sessionDetails}
                dataLoading={dataLoading}
                isEvent="Recorded"
                isOfficeHour={true}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default DaoOfficeHours;
