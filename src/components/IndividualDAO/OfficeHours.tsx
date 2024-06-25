import React, { useState, useEffect } from "react";
import search from "@/assets/images/daos/search.png";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import Tile from "../utils/Tile";
import { Oval, ThreeCircles } from "react-loader-spinner";
import { IoSearchSharp } from "react-icons/io5";

interface Session {
  _id: string;
  host_address: string;
  office_hours_slot: string;
  title: string;
  description: string;
  meeting_status: "ongoing" | "active" | "inactive"; // Define the possible statuses
  dao_name: string;
}

function OfficeHours({ props }: { props: string }) {
  const [activeSection, setActiveSection] = useState("ongoing");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const dao_name = props;
  // const dao_name = props.charAt(0).toUpperCase() + props.slice(1);

  const [sessionDetails, setSessionDetails] = useState([]);
  const [tempDetails, setTempDetails] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
          dao_name: dao_name,
        });

        const requestOptions: RequestInit = {
          method: "POST",
          headers: myHeaders,
          body: raw,
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
        setSearchQuery("");
        setSessionDetails(filteredSessions);
        setTempDetails(filteredSessions);
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
      setSessionDetails(tempDetails);
      setDataLoading(false);
    }
  };

  return (
    <div>
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

      <div className="pr-36 pt-3">
        <div className="my-3 flex gap-16 border-2 border-gray-400 px-6 rounded-xl text-sm">
          <button
            className={`py-2  ${
              searchParams.get("hours") === "ongoing"
                ? "text-[#A7DBF2] font-medium"
                : "text-white"
            }`}
            onClick={() =>
              router.push(path + "?active=officeHours&hours=ongoing")
            }
          >
            Ongoing
          </button>
          <button
            className={`py-2 ${
              searchParams.get("hours") === "upcoming"
                ? "text-[#A7DBF2] font-medium"
                : "text-white"
            }`}
            onClick={() =>
              router.push(path + "?active=officeHours&hours=upcoming")
            }
          >
            Upcoming
          </button>
          <button
            className={`py-2 ${
              searchParams.get("hours") === "recorded"
                ? "text-[#A7DBF2] font-medium"
                : "text-white"
            }`}
            onClick={() =>
              router.push(path + "?active=officeHours&hours=recorded")
            }
          >
            Recorded
          </button>
        </div>

        <div className="py-10">
          {searchParams.get("hours") === "ongoing" &&
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
                  height="50"
                  width="50"
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
                  height="50"
                  width="50"
                  color="#FFFFFF"
                  ariaLabel="three-circles-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                />
              </div>
            ) : (
              <div>
                <Tile
                  sessionDetails={sessionDetails}
                  dataLoading={dataLoading}
                  isEvent="Recorded"
                  isOfficeHour={true}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default OfficeHours;
