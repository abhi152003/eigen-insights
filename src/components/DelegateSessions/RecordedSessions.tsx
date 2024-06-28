import Image, { StaticImageData } from "next/image";
import React, { useEffect, useRef, useState } from "react";
import search from "@/assets/images/daos/search.png";
import texture1 from "@/assets/images/daos/texture1.png";
import NOLogo from "@/assets/images/daos/Operator4.jpg";
import AVSLogo from "@/assets/images/daos/AVSs3 New.png";
import user from "@/assets/images/daos/user3.png";
import { Tooltip } from "@nextui-org/react";
import { IoCopy } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";
import copy from "copy-to-clipboard";
import styles from "./RecordedSessions.module.css";
import { Oval, ThreeCircles } from "react-loader-spinner";
// const { parseISO } = require("date-fns");
import { parseISO } from "date-fns";
// import { useRouter } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import user1 from "@/assets/images/user/user1.svg";
import user2 from "@/assets/images/user/user2.svg";
import user3 from "@/assets/images/user/user3.svg";
import user4 from "@/assets/images/user/user4.svg";
import user5 from "@/assets/images/user/user5.svg";
import user6 from "@/assets/images/user/user6.svg";
import user7 from "@/assets/images/user/user7.svg";
import user8 from "@/assets/images/user/user8.svg";
import user9 from "@/assets/images/user/user9.svg";
import { IoSearchSharp } from "react-icons/io5";
import "../../css/SearchShine.css";

interface SessionData {
  session: {
    attendees: {
      attendee_address: string;
    }[];
    host_address: string;
  };
  guestInfo: {
    image: string | null;
  };
  hostInfo: {
    image: string | null;
  };
}
import Head from "next/head";
import { getEnsName, getEnsNameOfUser } from "../ConnectWallet/ENSResolver";

function RecordedSessions() {
  // const parseISO = dateFns;
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [meetingData, setMeetingData] = useState<any>([]);
  const [displayIFrame, setDisplayIFrame] = useState<number | null>(null);
  const router = useRouter();
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null); // Track which video is hovered
  const videoRefs = useRef<any>([]);
  const [videoDurations, setVideoDurations] = useState<any>({});
  const [searchMeetingData, setSearchMeetingData] = useState<any>([]);
  const [activeButton, setActiveButton] = useState("all");
  const [ensHostNames, setEnsHostNames] = useState<any>({});
  const [ensGuestNames, setEnsGuestNames] = useState<any>({});

  const handleCopy = (addr: string) => {
    copy(addr);
    toast("Address Copied");
  };

  useEffect(() => {
    const getRecordedMeetings = async () => {
      try {
        const response = await fetch(`/api/get-recorded-meetings`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const resultData = await response.json();
        // console.log("result data: ", resultData);

        if (resultData.success) {
          console.log("result data: ", resultData.data);
          setMeetingData(resultData.data);
          setSearchMeetingData(resultData.data);
          setIsLoading(false);
        }
      } catch (error) {
        console.log("error in catch", error);
      }
    };
    getRecordedMeetings();
  }, []);

  const formatTimeAgo = (utcTime: string): string => {
    const parsedTime = parseISO(utcTime);
    const currentTime = new Date();
    const differenceInSeconds = Math.abs(
      (parsedTime.getTime() - currentTime.getTime()) / 1000
    );

    if (differenceInSeconds < 60) {
      return "Just now";
    } else if (differenceInSeconds < 3600) {
      const minutes = Math.round(differenceInSeconds / 60);
      return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    } else if (differenceInSeconds < 86400) {
      const hours = Math.round(differenceInSeconds / 3600);
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    } else if (differenceInSeconds < 604800) {
      const days = Math.round(differenceInSeconds / 86400);
      return `${days} day${days === 1 ? "" : "s"} ago`;
    } else if (differenceInSeconds < 31536000) {
      const weeks = Math.round(differenceInSeconds / 604800);
      return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
    } else {
      const years = Math.round(differenceInSeconds / 31536000);
      return `${years} year${years === 1 ? "" : "s"} ago`;
    }
  };

  const handleTimeUpdate = (video: HTMLVideoElement, index: number) => {
    const duration = video.duration;
    const currentTime = video.currentTime;
    const progressBar = document.querySelectorAll(".progress-bar")[index];

    if (progressBar) {
      const progressDiv = progressBar as HTMLDivElement;
      const percentage = (currentTime / duration) * 100;
      console.log("percentage: ", percentage);
      progressDiv.style.width = `${percentage}%`;
    }
  };

  useEffect(() => {
    if (hoveredVideo !== null && videoRefs.current[hoveredVideo]) {
      const videoElement = videoRefs.current[hoveredVideo];
      const progressBar = document.getElementById(
        `progressBar-${hoveredVideo}`
      );

      const handleTimeUpdate = (e: any) => {
        const { currentTime, duration } = e.target;
        const progressPercentage = (currentTime / duration) * 100;

        if (progressBar) {
          progressBar.style.width = `${progressPercentage}%`;
        }
      };

      videoElement.addEventListener("timeupdate", handleTimeUpdate);

      // Clean up the event listener when the component unmounts or video changes
      return () => {
        videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, [hoveredVideo]);

  const handleLoadedMetadata = (index: any, e: any) => {
    const duration = e.target.duration;
    setVideoDurations((prev: any) => ({ ...prev, [index]: duration })); // Store the duration
  };

  const formatVideoDuration = (duration: any) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    const formattedDuration =
      (hours > 0 ? `${hours}:` : "") +
      `${minutes.toString().padStart(2, "0")}:` +
      `${seconds.toString().padStart(2, "0")}`;

    return formattedDuration;
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const filtered = searchMeetingData.filter((item: any) => {
        // Convert both query and userAddress to lowercase for case-insensitive matching
        const lowercaseQuery = query.toLowerCase();
        const lowercaseAddress = item.session.host_address.toLowerCase();
        const lowercaseTitle = item.session.title.toLowerCase();

        // Check if the lowercase userAddress includes the lowercase query
        return (
          lowercaseAddress.includes(lowercaseQuery) ||
          lowercaseTitle.includes(lowercaseQuery)
        );
      });

      setMeetingData(filtered);
    } else {
      setMeetingData(searchMeetingData);
    }
  };

  const handleFilters = (params: string) => {
    if (params) {
      setActiveButton(params);
      const filtered = searchMeetingData.filter((item: any) => {
        return item.session.operator_or_avs.includes(params);
      });

      setMeetingData(filtered);
    } else {
      setActiveButton("all");
      setMeetingData(searchMeetingData);
    }
  };

  // Create an array of user images
  const userImages = [
    user1,
    user2,
    user3,
    user4,
    user5,
    user6,
    user7,
    user8,
    user9,
  ];

  // State to store the randomly selected user images
  const [randomUserImages, setRandomUserImages] = useState<{
    [key: string]: StaticImageData;
  }>({});
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());

  // Function to get a random user image
  const getRandomUserImage = (): StaticImageData => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * userImages.length);
    } while (usedIndices.has(randomIndex));

    usedIndices.add(randomIndex);
    return userImages[randomIndex];
  };

  // Effect to set the random user image when the component mounts
  useEffect(() => {
    const newRandomUserImages: { [key: string]: StaticImageData } = {
      ...randomUserImages,
    };

    meetingData.forEach((data: SessionData) => {
      const guestAddress = data.session.attendees[0]?.attendee_address;
      const hostAddress = data.session.host_address;
      if (!data.guestInfo?.image && !newRandomUserImages[guestAddress]) {
        newRandomUserImages[guestAddress] = getRandomUserImage();
      }
      if (!data.hostInfo?.image && !newRandomUserImages[hostAddress]) {
        newRandomUserImages[hostAddress] = getRandomUserImage();
      }
    });

    setRandomUserImages(newRandomUserImages);
  }, [meetingData]);

  useEffect(() => {
    const fetchEnsNames = async () => {
      const ensNamesMap: any = {};
      for (const data of meetingData) {
        const ensName = await getEnsName(
          data.session.host_address.toLowerCase()
        );
        if (ensName) {
          ensNamesMap[data.session.host_address] = ensName;
        }
      }
      console.log("ensNamesMap", ensNamesMap);
      setEnsHostNames(ensNamesMap);
    };

    if (meetingData.length > 0) {
      fetchEnsNames();
    }
  }, [meetingData]);

  useEffect(() => {
    const fetchEnsNames = async () => {
      const ensNamesMap: any = {};
      for (const data of meetingData) {
        const ensName = await getEnsName(
          data.session.attendees[0]?.attendee_address.toLowerCase()
        );
        if (ensName) {
          ensNamesMap[data.session.attendees[0]?.attendee_address] = ensName;
        }
      }
      console.log("guest ensNamesMap", ensNamesMap);
      setEnsGuestNames(ensNamesMap);
    };

    if (meetingData.length > 0) {
      fetchEnsNames();
    }
  }, [meetingData]);

  return (
    <>
      <div className="">
        <div className="flex my-3 items-center gap-4 font-poppins">

          <div className="searchBox searchShineWidthOfAVSs">
            <input
              className="searchInput"
              type="text"
              name=""
              placeholder="Search by title and host address"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <button className="searchButton">
              <IoSearchSharp className="iconExplore" />
            </button>
          </div>
          <div className="flex space-x-4">
            <button
              className={`p-3 border-[#A7DBF2] border-1
              border-b-3 font-medium overflow-hidden relative hover:brightness-100 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-300 group px-4 py-1 rounded-lg flex items-center gap-1.5
              ${
                activeButton === "all"
                  ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3]"
                  : "text-white border-white"
              }`}
              onClick={() => handleFilters("")}
            >
              All
            </button>
            <button
              className={`p-3 border-[#A7DBF2] border-1
              border-b-3 font-medium overflow-hidden relative hover:brightness-100 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-300 group px-4 py-1 rounded-lg flex items-center gap-1.5
              ${
                activeButton === "operators"
                  ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3]"
                  : "text-white border-white"
              }`}
              onClick={() => handleFilters("operators")}
            >
              <Image src={NOLogo} alt="operators" width={23} className="" />
              Operators
            </button>
            <button
              className={`p-3 border-[#A7DBF2] border-1
              border-b-3 font-medium overflow-hidden relative hover:brightness-100 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-300 group px-4 py-1 rounded-lg flex items-center gap-1.5
              ${
                activeButton === "avss"
                  ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3]"
                  : "text-white border-white"
              }`}
              onClick={() => handleFilters("avss")}
            >
              <Image
                src={AVSLogo}
                alt="avss"
                width={23}
                className="rounded-md"
              />
              AVSs
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center m-6">
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
        ) : meetingData && meetingData.length > 0 ? (
          <div className="grid min-[475px]:grid-cols- md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-10 py-8 font-poppins">
            {meetingData.map((data: any, index: number) => (
              <div
                key={index}
                className="border-2 border-[#D9D9D9] rounded-3xl cursor-pointer hover:border-light-cyan hover:border-x-4"
                onClick={() => router.push(`/watch/${data.session.meetingId}`)}
                onMouseEnter={() => setHoveredVideo(index)}
                onMouseLeave={() => setHoveredVideo(null)}
              >
                <div
                  className={`w-full h-44 rounded-t-3xl bg-[#D9D9D945] object-cover object-center relative`}
                >
                  {hoveredVideo === index ? (
                    <div className="relative">
                      <video
                        ref={(el: any) => (videoRefs.current[index] = el)}
                        autoPlay
                        loop
                        muted
                        onLoadedMetadata={(e) => handleLoadedMetadata(index, e)}
                        src={data.session.video_uri}
                        className="w-full h-44 rounded-t-3xl object-cover"
                      ></video>
                      <div className={styles.videoTimeline}>
                        <div className={styles.progressArea}>
                          <div
                            id={`progressBar-${index}`}
                            className={styles.progressBar}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <video
                      poster={`https://gateway.lighthouse.storage/ipfs/${data.session.thumbnail_image}`}
                      // poster="https://gateway.lighthouse.storage/ipfs/Qmb1JZZieFSENkoYpVD7HRzi61rQCDfVER3fhnxCvmL1DB"
                      ref={(el: any) => (videoRefs.current[index] = el)}
                      loop
                      muted
                      onLoadedMetadata={(e) => handleLoadedMetadata(index, e)}
                      src={data.session.video_uri}
                      className="w-full h-44 rounded-t-3xl object-cover"
                    ></video>
                  )}
                  <div className="absolute right-2 bottom-2 text-white text-xs bg-white px-1 bg-opacity-30 rounded-sm">
                    {formatVideoDuration(videoDurations[index] || 0)}
                  </div>
                </div>
                <div className="px-4 py-2">
                  <div
                    className={`ml-1 font-semibold py-1 ${styles.truncate}`}
                    style={{
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 1,
                    }}
                  >
                    {data.session.title}
                  </div>
                  <div className="flex text-sm gap-3 py-1">
                    <div className="bg-medium-blue flex items-center py-1 px-3 rounded-md gap-2">
                      <div>
                        {data.session.operator_or_avs === "operators" ? (
                          <Image
                            src={NOLogo}
                            alt="image"
                            width={20}
                            className="rounded-full"
                          />
                        ) : data.session.operator_or_avs === "avss" ? (
                          <Image
                            src={AVSLogo}
                            alt="image"
                            width={20}
                            className="rounded-full"
                          />
                        ) : (
                          ""
                        )}
                      </div>
                      <div className="capitalize">{data.session.dao_name}</div>
                    </div>
                    <div className="bg-medium-blue py-1 px-3 rounded-md">
                      {formatTimeAgo(data.session.slot_time)}
                    </div>
                  </div>
                  <div className="">
                    <div className="flex items-center gap-2 py-1 ps-3 text-sm">
                      <div>
                        <Image
                          src={
                            data.hostInfo?.image
                              ? `https://gateway.lighthouse.storage/ipfs/${data.hostInfo.image}`
                              : randomUserImages[data.session.host_address]
                          }
                          alt="image"
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      </div>
                      <div>Host: {ensHostNames[data.session.host_address]}</div>
                      <div>
                        <Tooltip
                          content="Copy"
                          placement="right"
                          closeDelay={1}
                          showArrow
                          className="bg-deep-blue"
                        >
                          <span className="cursor-pointer text-sm">
                            <IoCopy
                              onClick={(event) => {
                                event.stopPropagation();
                                handleCopy(data.session.host_address);
                              }}
                            />
                          </span>
                        </Tooltip>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 py-1 ps-3 text-sm">
                      <div className="">
                        <Image
                          src={
                            data.guestInfo?.image
                              ? `https://gateway.lighthouse.storage/ipfs/${data.guestInfo.image}`
                              : randomUserImages[
                                  data.session.attendees[0]?.attendee_address
                                ]
                          }
                          alt="image"
                          width={20}
                          height={20}
                          className="h-5 w-5 rounded-full object-cover object-center"
                        />
                      </div>
                      <div>
                        Guest:{" "}
                        {
                          ensGuestNames[
                            data.session.attendees[0]?.attendee_address
                          ]
                        }
                      </div>
                      <div>
                        <Tooltip
                          content="Copy"
                          placement="right"
                          closeDelay={1}
                          showArrow
                          className="bg-deep-blue"
                        >
                          <span className="cursor-pointer text-sm">
                            <IoCopy
                              onClick={(event) => {
                                event.stopPropagation();
                                handleCopy(
                                  data.session.attendees[0]?.attendee_address
                                );
                              }}
                            />
                          </span>
                        </Tooltip>
                      </div>
                    </div>
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
    </>
  );
}

export default RecordedSessions;
