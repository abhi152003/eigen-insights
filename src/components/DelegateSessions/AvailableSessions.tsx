"use client";

import React, { useState, useEffect } from "react";
import search from "@/assets/images/daos/search.png";
import Image, { StaticImageData } from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import { Oval, ThreeCircles } from "react-loader-spinner";
import { IoCopy } from "react-icons/io5";
import copy from "copy-to-clipboard";
import toast, { Toaster } from "react-hot-toast";
import { FaCircleInfo } from "react-icons/fa6";
import { Tooltip } from "@nextui-org/react";
import text1 from "@/assets/images/daos/texture1.png";
import clockIcn from "@/assets/images/daos/icon_clock.png";
import EILogo from "@/assets/images/daos/eigen_logo.png";
import NOLogo from "@/assets/images/daos/operators.png";
import AVSLogo from "@/assets/images/daos/avss.png";
import "@/components/DelegateSessions/DelegateSessionsMain.module.css";
import { getEnsNameOfUser } from "../ConnectWallet/ENSResolver";
import { IoSearchSharp } from "react-icons/io5";
import "../../css/SearchShine.css";
import "../../css/BtnShine.css";
import { MdWatchLater } from "react-icons/md";

interface Type {
  ensName: string;
  operator_or_avs: string;
  userAddress: string;
  timeSlotSizeMinutes: number;
  allowedDates: string[];
  dateAndRanges: {
    date: string;
    timeRanges: [string, string, string, string][];
    formattedUTCTime_startTime: string;
    utcTime_startTime: string;
    formattedUTCTime_endTime: string;
    utcTime_endTime: string;
  }[];
}

function AvailableSessions() {
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const [daoInfo, setDaoInfo] = useState<Array<Type>>([]);
  const [APIData, setAPIData] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [selectedDao, setSelectedDao] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [startTime, setStartTime] = useState<any>(null);
  const [endTime, setEndTime] = useState<any>(null);
  const [ensNames, setEnsNames] = useState<any>({});

  useEffect(() => {
    setIsPageLoading(false);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsPageLoading(true);
      try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        let dateToSend = null;

        console.log("selectedDao", selectedDao);
        console.log("selectedDate", selectedDate);
        console.log("startTime", startTime);
        console.log("endTime", endTime);

        const currentDate = new Date();
        let newDate = currentDate.toLocaleDateString();
        if (newDate.length !== 10 || !newDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, "0");
          const day = String(currentDate.getDate()).padStart(2, "0");
          newDate = `${year}-${month}-${day}`;
        }

        console.log("currentDate", newDate);

        const startDateTime = (await startTime)
          ? new Date(`${newDate} ${startTime}:00`)
          : null;

        const endDateTime = (await endTime)
          ? new Date(`${newDate} ${endTime}:00`)
          : null;

        console.log("startDateTime", startDateTime);
        console.log("endDateTime", endDateTime);

        const startTimeToSend = startDateTime
          ?.toISOString()
          .split("T")[1]
          .substring(0, 5);

        const endTimeToSend = endDateTime
          ?.toISOString()
          .split("T")[1]
          .substring(0, 5);

        console.log("startTimeToSend", startTimeToSend);
        console.log("endTimeToSend", endTimeToSend);

        const raw = JSON.stringify({
          operator_or_avs: selectedDao,
          date: selectedDate,
          startTime: startTimeToSend ? startTimeToSend : null,
          endTime: endTimeToSend ? endTimeToSend : null,
        });

        // console.log("")

        const requestOptions: any = {
          method: "POST",
          headers: myHeaders,
          body: raw,
        };

        console.log("requestOptions", requestOptions);
        const result = await fetch(
          "/api/get-availability/filter",
          requestOptions
        );
        const response = await result.json();

        let resultData;
        console.log("resultData: ", response);
        if (response.success === true) {
          console.log("response", response.data);
          resultData = await response.data;
          console.log("resultData", resultData);
        }
        setAPIData(resultData);
        setDaoInfo(resultData);
        setIsPageLoading(false);
      } catch (error) {
        console.error("Error Fetching Data of availability:", error);
      }
    };
    fetchData();
  }, [selectedDao, selectedDate, startTime, endTime]);

  const handleCopy = (addr: string) => {
    copy(addr);
    toast("Address Copied");
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const filtered = APIData.filter((item: any) => {
        // Convert both query and userAddress to lowercase for case-insensitive matching
        const lowercaseQuery = query.toLowerCase();
        const lowercaseAddress = item.session.userAddress.toLowerCase();

        // Check if the lowercase userAddress includes the lowercase query
        return lowercaseAddress.includes(lowercaseQuery);
      });

      setDaoInfo(filtered);
    } else {
      setDaoInfo(APIData);
    }
  };

  const handleDaoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    // setSelectedDao(selected);
    let filtered: any;
    if (selected === "All") {
      // setDaoInfo(APIData);
      setSelectedDao(null);
    } else {
      // filtered = APIData.filter((item) => item.operator_or_avs === selected);
      // setDaoInfo(filtered);
      setSelectedDao(selected);
    }
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.value;
    console.log("selected date", selected);
    if (selected === "") {
      console.log("its empty string");
      setSelectedDate(null);
    } else {
      setSelectedDate(selected);
    }
  };

  const handleStartTimeChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = e.target.value;
    console.log("selected startTime", selected);
    if (selected === "Start Time") {
      setStartTime(null);
    } else {
      setStartTime(selected);
    }
  };

  const handleEndTimeChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = e.target.value;
    console.log("selected endTime", selected);
    if (selected === "End Time") {
      setEndTime(null);
    } else {
      setEndTime(selected);
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        options.push(time);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const handleClearTime = () => {
    setStartTime(null);
    setEndTime(null);
  };

  const currentDate = new Date();
  let formattedDate = currentDate.toLocaleDateString();
  if (
    formattedDate.length !== 10 ||
    !formattedDate.match(/^\d{4}-\d{2}-\d{2}$/)
  ) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    formattedDate = `${year}-${month}-${day}`;
  }

  useEffect(() => {
    const fetchEnsNames = async () => {
      console.log("dao info: ", daoInfo);
      const addresses = daoInfo.map((dao: any) => dao.userInfo[0].address);
      console.log("addresses: ", addresses);
      const names = await Promise.all(
        addresses.map(async (address) => {
          const ensName = await getEnsNameOfUser(address);
          return { address, ensName };
        })
      );
      const ensNameMap: { [address: string]: string } = {};
      names.forEach(({ address, ensName }) => {
        ensNameMap[address] = ensName;
      });
      console.log("ens name: ", ensNameMap);
      setEnsNames(ensNameMap);
    };

    // if (daoInfo.length > 0) {
    //   fetchEnsNames();
    // }
  }, [daoInfo]);

  return (
    <div className="">
      <div className="flex gap-7 bg-[#D9D9D945] p-4 mt-4 rounded-2xl font-poppins">
        <div className="searchBox">
          <input
            className="searchInput"
            type="text"
            name=""
            placeholder="Search by Address"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <button className="searchButton">
            <IoSearchSharp className="iconExplore" />
          </button>
        </div>

        <div className="flex items-center">
          <Tooltip
            showArrow
            content={
              <div className="font-poppins text-white">
                Select a Operators/AVSs option to view available sessions
              </div>
            }
            placement="bottom"
            className="rounded-md bg-opacity-90 bg-medium-blue"
            closeDelay={1}
          >
            <select
              value={selectedDao}
              // onChange={(e) => setSelectedDao(e.target.value)}
              onChange={handleDaoChange}
              className="px-3 py-2 rounded-lg shadow bg-medium-blue cursor-pointer"
            >
              <option className="bg-midnight-blue" value="All">
                All
              </option>
              <option className="bg-midnight-blue" value="operators">
                Operators
              </option>
              <option className="bg-midnight-blue" value="avss">
                AVSs
              </option>
            </select>
          </Tooltip>
        </div>

        <div className="flex items-center">
          <Tooltip
            showArrow
            content={
              <div className="font-poppins">
                Select a date to view available Operators and AVSs for that
                date.
              </div>
            }
            placement="bottom"
            className="rounded-md bg-opacity-90 bg-medium-blue"
            closeDelay={1}
          >
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={formattedDate}
              // onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 shadow mr-1 rounded-md bg-medium-blue cursor-pointer text-white"
            />
          </Tooltip>
        </div>

        <Tooltip
          showArrow
          content={
            <div className="font-poppins">
              Select a time to view available Operators and AVSs for that
              specific time.
            </div>
          }
          placement="bottom"
          className="rounded-md bg-opacity-90 bg-medium-blue"
          closeDelay={1}
        >
          <div className="flex items-center select-container">
            <select
              value={startTime || "Start Time"}
              onChange={handleStartTimeChange}
              className="px-3 py-2 rounded-md shadow mr-1 bg-medium-blue cursor-pointer"
            >
              <option className="text-white my-1">Start Time</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            <span>&nbsp;to</span>
            <select
              value={endTime || "End Time"}
              onChange={handleEndTimeChange}
              className="px-3 py-2 rounded-md shadow ml-2 bg-medium-blue cursor-pointer"
            >
              <option className="text-white">End Time</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {(startTime || endTime) && (
              <button
                onClick={handleClearTime}
                className="ml-2 text-red-500 bg-white px-2 py-[6px] rounded-md border-red-500 border-2 hover:bg-red-500 hover:text-white hover:scale-100"
              >
                Clear Time
              </button>
            )}
          </div>
        </Tooltip>
      </div>

      {/* Remove this component */}

      <div
        // key={index}
        style={{
          boxShadow:
            "0 4px 10px 0px rgba(94, 156, 191, 0.7), 0 4px 10px 0px rgba(94, 156, 191, 0.5);",
        }}
        className="rounded-3xl flex flex-col bg-deep-blue my-8 w-fit"
      >
        <div className="flex items-center mb-4 border-b-2 py-5 px-5 rounded-tl-3xl rounded-tr-3xl">
          <div
            className="relative object-cover rounded-3xl"
            style={{
              backgroundColor: "#fcfcfc",
              border: "2px solid #E9E9E9 ",
            }}
          >
            <div className="w-32 h-32 flex items-center justify-content ">
              <div className="flex justify-center items-center w-32 h-32">
                <Image
                  src={EILogo ? EILogo : NOLogo}
                  alt="user"
                  width={256}
                  height={256}
                  className={
                    EILogo ? "w-32 h-32 rounded-3xl" : "w-20 h-20 rounded-3xl"
                  }
                />
              </div>

              <Image
                src={EILogo}
                alt="EigenInsights Logo"
                className="absolute top-0 right-0"
                style={{
                  width: "30px",
                  height: "30px",
                  marginTop: "10px",
                  marginRight: "10px",
                }}
              />
            </div>
          </div>

          <div className="w-3/4 ml-4">
            <div className="text-light-cyan text-lg font-semibold mb-1">
              TestName or Address
            </div>
            <div className="text-sm flex">
              <div className="ml-[3px]">
                0x4cd2086e1d708e65db5d4f5712a9ca46ed4bbd0a
              </div>
              <div className="items-center">
                {/* <Tooltip
                  placement="right"
                  closeDelay={1}
                > */}
                  <div className="pl-2 pt-[2px] cursor-pointer" color="#3E3D3D">
                    <IoCopy
                      // onClick={() =>
                      //   handleCopy()
                      // }
                      className="text-white hover:text-light-cyan"
                    />
                  </div>
                {/* </Tooltip> */}
                <Toaster
                  toastOptions={{
                    style: {
                      fontSize: "14px",
                      backgroundColor: "#3E3D3D",
                      color: "#fff",
                      boxShadow: "none",
                      borderRadius: "50px",
                      padding: "3px 5px",
                    },
                  }}
                />
              </div>
            </div>
            <div className="mt-2 bg-midnight-blue border-1 border-white text-white rounded-md text-xs px-4 py-1 font-semibold w-fit capitalize">
              Test Name
            </div>
            <div>
              <div
                className="text-[#4F4F4F] rounded-md mt-3"
                style={{
                  overflowX: "auto",
                  overflowY: "hidden",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <div style={{ display: "flex" }}>
                  <div
                    // key={index}
                    className="text-midnight-blue bg-white rounded-2xl font-semibold text-small border-[0.5px] border-[#D9D9D9] px-4 py-1"
                  >
                    {/* {new Date(date).toLocaleString().split(",")[0]} */}
                    13/12/11
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center px-5 pb-3">
          <MdWatchLater className="w-5 h-5 mt-[1px] text-white" />
          <div className="w-[60%]">
            <span className="text-base font-semibold text-light-cyan ml-[6px] mt-[6px]">
              Available for 10 minutes
            </span>
          </div>
          <div className="w-[40%] flex justify-end ">
            {/* <button
              className="bg-medium-blue text-white py-4 px-6 rounded-[36px] text-sm w-[11rem] hover:bg-slate-blue focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium btnNewShine"
            >
              Book Session
            </button> */}
            <div
              className="text-sm w-fit hover:bg-slate-blue font-medium
              flex items-center justify-center cursor-pointer btnShine"
            >
              <div className="relative inline-flex items-center justify-start py-3 pl-4 pr-12 overflow-hidden font-semibold shadow text-medium-blue transition-all duration-150 ease-in-out rounded hover:pl-10 hover:pr-6 bg-gray-50 dark:bg-gray-700 dark:text-white dark:hover:text-gray-200 dark:shadow-none group">
                <span className="absolute bottom-0 left-0 w-full h-1 transition-all duration-150 ease-in-out bg-light-blue group-hover:h-full"></span>
                <span className="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    fill="none"
                    className="w-5 h-5 text-medium-blue"
                  >
                    <path
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                      stroke-width="2"
                      stroke-linejoin="round"
                      stroke-linecap="round"
                    ></path>
                  </svg>
                </span>
                <span className="absolute left-0 pl-2.5 -translate-x-12 group-hover:translate-x-0 ease-out duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    fill="none"
                    className="w-5 h-5 text-white"
                  >
                    <path
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                      stroke-width="2"
                      stroke-linejoin="round"
                      stroke-linecap="round"
                    ></path>
                  </svg>
                </span>
                <span className="relative w-full text-left transition-colors duration-200 ease-in-out group-hover:text-white dark:group-hover:text-gray-200">
                  Book Session
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 font-poppins">
        {isPageLoading ? (
          <div className="flex items-center justify-center m-6">
            <ThreeCircles
              visible={true}
              height="50"
              width="50"
              color="#FFFFFF"
              ariaLabel="three-circles-loading"
              wrapperStyle={{}}
              // wrapperclassName=""
            />
          </div>
        ) : daoInfo && daoInfo.length > 0 ? (
          <div className="overflow-auto font-poppins grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 gap-12 py-5 px-10">
            {daoInfo.map((daos: any, index: number) => (
              <div
                key={index}
                style={{
                  boxShadow:
                    "0 4px 10px 0px rgba(94, 156, 191, 0.7), 0 4px 10px 0px rgba(94, 156, 191, 0.5);",
                }}
                className="rounded-3xl flex flex-col bg-deep-blue my-8"
              >
                <div className="flex items-center mb-4 border-b-2 py-5 px-5 rounded-tl-3xl rounded-tr-3xl">
                  <div
                    className="relative object-cover rounded-3xl"
                    style={{
                      backgroundColor: "#fcfcfc",
                      border: "2px solid #E9E9E9 ",
                    }}
                  >
                    <div className="w-32 h-32 flex items-center justify-content ">
                      <div className="flex justify-center items-center w-32 h-32">
                        <Image
                          src={
                            daos.userInfo[0].image
                              ? `https://gateway.lighthouse.storage/ipfs/${daos.userInfo[0].image}`
                              : daos.session.operator_or_avs === "operators"
                              ? NOLogo
                              : daos.session.operator_or_avs === "avss"
                              ? AVSLogo
                              : EILogo
                          }
                          alt="user"
                          width={256}
                          height={256}
                          className={
                            daos?.userInfo[0]?.image
                              ? "w-32 h-32 rounded-3xl"
                              : "w-20 h-20 rounded-3xl"
                          }
                        />
                      </div>

                      <Image
                        src={EILogo}
                        alt="EigenInsights Logo"
                        className="absolute top-0 right-0"
                        style={{
                          width: "30px",
                          height: "30px",
                          marginTop: "10px",
                          marginRight: "10px",
                        }}
                      />
                    </div>
                  </div>

                  <div className="w-3/4 ml-4">
                    <div className="text-light-cyan text-lg font-semibold mb-1">
                      {ensNames[daos.userInfo[0].address] ||
                        daos.userInfo[0].displayName ||
                        daos.session.userAddress.slice(0, 6) +
                          "..." +
                          daos.session.userAddress.slice(-4)}
                    </div>
                    <div className="text-sm flex">
                      <div>
                        {daos.session.userAddress.slice(0, 6) +
                          "..." +
                          daos.session.userAddress.slice(-4)}
                      </div>
                      <div className="items-center">
                        <Tooltip
                          content="Copy"
                          placement="right"
                          closeDelay={1}
                          showArrow
                          className="bg-midnight-blue text-white"
                        >
                          <div
                            className="pl-2 pt-[2px] cursor-pointer"
                            color="#3E3D3D"
                          >
                            <IoCopy
                              onClick={() =>
                                handleCopy(`${daos.session.userAddress}`)
                              }
                              className="text-white hover:text-light-cyan"
                            />
                          </div>
                        </Tooltip>
                        <Toaster
                          toastOptions={{
                            style: {
                              fontSize: "14px",
                              backgroundColor: "#3E3D3D",
                              color: "#fff",
                              boxShadow: "none",
                              borderRadius: "50px",
                              padding: "3px 5px",
                            },
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-2 bg-midnight-blue border-1 border-white text-white rounded-md text-xs px-4 py-1 font-semibold w-fit capitalize">
                      {daos.session.operator_or_avs}
                    </div>
                    <div>
                      <div
                        className="text-[#4F4F4F] rounded-md mt-3"
                        style={{
                          overflowX: "auto",
                          overflowY: "hidden",
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                        }}
                      >
                        <div style={{ display: "flex" }}>
                          {daos.session.dateAndRanges
                            .flatMap((dateRange: any) => dateRange.date)
                            .filter(
                              (date: any, index: any, self: any) =>
                                self.indexOf(date) === index
                            )
                            .sort(
                              (a: any, b: any) =>
                                new Date(a).getTime() - new Date(b).getTime()
                            )
                            .map((date: string, index: number) => (
                              <div
                                key={index}
                                className="text-midnight-blue bg-white rounded-2xl font-semibold text-small border-[0.5px] border-[#D9D9D9] px-4 py-1"
                              >
                                {new Date(date).toLocaleString().split(",")[0]}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center px-5 pb-3">
                  <MdWatchLater className="w-5 h-5 mt-[2px] text-light-cyan" />
                  <div className="w-[60%]">
                    <span className="text-base font-semibold text-light-cyan ml-[6px] mt-1">
                      Available for 10 minutes
                    </span>
                  </div>
                  <div className="w-[40%] flex justify-end ">
                    <button
                      onClick={() =>
                        router.push(
                          `/${daos.session.operator_or_avs}/${daos.session.userAddress}?active=delegatesSession&session=book`
                        )
                      }
                      className="bg-black text-white py-4 px-6 rounded-[36px] text-sm w-[11rem] font-medium"
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center pt-10">
            <div className="text-5xl">☹️</div>{" "}
            <div className="pt-4 font-semibold text-lg">
              Oops, no such result available!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AvailableSessions;
