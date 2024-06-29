import React, { useEffect, useRef, useState } from "react";
import user from "@/assets/images/daos/user3.png";
import view from "@/assets/images/daos/view.png";
import Image from "next/image";
import NOLogo from "@/assets/images/daos/Operator4.jpg";
import AVSLogo from "@/assets/images/daos/avss.png";
import time from "@/assets/images/daos/time.png";
import { PiFlagFill } from "react-icons/pi";
import { BiSolidShare } from "react-icons/bi";
import { IoMdArrowDropdown } from "react-icons/io";
import { CgStopwatch } from "react-icons/cg";
import Link from "next/link";
import VideoJS from "@/components/utils/VideoJs";
import videojs from "video.js";
import { parseISO } from "date-fns";
import ReportOptionModal from "./ReportOptionModal";
import { getEnsName } from "../ConnectWallet/ENSResolver";
import { useRouter } from "next-nprogress-bar";
import "./WatchSession.module.css";
import ShareMediaModal from "./ShareMediaModal";
import { BASE_URL } from "@/config/constants";
import { Toaster } from "react-hot-toast";

interface ProfileInfo {
  _id: string;
  address: string;
  image: string;
  description: string;
  daoName: string;
  isDelegate: boolean;
  displayName: string;
  socialHandles: {
    twitter: string;
    discord: string;
    discourse: string;
    github: string;
  };
  emailId: string;
}
interface Attendee {
  attendee_address: string;
  attendee_uid: string;
  profileInfo: ProfileInfo;
}

interface HostProfileInfo {
  _id: string;
  address: string;
  image: string;
  description: string;
  daoName: string;
  isDelegate: boolean;
  displayName: string;
  socialHandles: {
    twitter: string;
    discord: string;
    discourse: string;
    github: string;
  };
  emailId: string;
}

interface Meeting {
  _id: string;
  slot_time: string;
  office_hours_slot: string; // Assuming this is a date-time string
  title: string;
  description: string;
  video_uri: string;
  meetingId: string;
  attendees: Attendee[];
  uid_host: string;
  operator_or_avs: string;
  host_address: string;
  joined_status: string | null;
  booking_status: string;
  meeting_status:
    | "active"
    | "inactive"
    | "ongoing"
    | "Recorded"
    | "Upcoming"
    | "Ongoing"; // Assuming meeting status can only be active or inactive
  session_type: string;
  hostProfileInfo: HostProfileInfo;
}

function WatchSession({
  data,
  collection,
}: {
  data: Meeting;
  collection: string;
}) {
  const [showPopup, setShowPopup] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [ensHostName, setEnsHostName] = useState<string | null>(null);
  const [shareModal, setShareModal] = useState(false);
  const router = useRouter();

  const handleShareClose = () => {
    setShareModal(false);
  };

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [data.description, isExpanded]);

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

  const handleModalClose = () => {
    console.log("Popup Closed");
    setModalOpen(false);
  };

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const getLineCount = (text: string) => {
    const lines = text.split("\n");
    return lines.length;
  };

  useEffect(() => {
    const fetchEnsName = async () => {
      const name = await getEnsName(data.host_address.toLowerCase());
      setEnsHostName(name);
    };

    fetchEnsName();
  }, [data.host_address]);

  return (
    <div className="">
      <div className="rounded-3xl border-2 border-white bg-deep-blue">
        <div
          className={`px-6 pt-4 pb-4 ${
            data.description.length > 0 ? "border-b" : ""
          }  border-[#CCCCCC]`}
        >
          <div className="text-lg font-medium pb-3 text-white">
            {data.title}
          </div>
          <div className="flex justify-between text-sm pe-4 pb-4">
            <div className="flex gap-6">
              <div className="flex items-center gap-2 ">
                <div>
                  <Image
                    src={
                      data.hostProfileInfo?.image
                        ? `https://gateway.lighthouse.storage/ipfs/${data.hostProfileInfo.image}`
                        : user
                    }
                    alt="image"
                    width={20}
                    height={20}
                    className="rounded-full"
                    priority
                  />
                </div>
                <div
                  className="text-white font-medium"
                >
                  {ensHostName}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {data.operator_or_avs === "operators" ? (
                  <Image
                    src={NOLogo}
                    alt="image"
                    width={30}
                    style={{width: "60%", height: "60%"}}
                    className="rounded-full"
                  />
                ) : data.operator_or_avs === "avss" ? (
                  <Image
                    src={AVSLogo}
                    alt="image"
                    width={30}
                    className="rounded-full"
                  />
                ) : (
                  ""
                )}
                <div className="text-white font-medium capitalize">
                  {data.operator_or_avs}
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-1">
                {/* <Image src={time} alt="image" className="text-white" width={20} priority /> */}
                <CgStopwatch color="#fff" size={20} />
                <div className="text-white">
                  {formatTimeAgo(data.slot_time)}
                </div>
              </div>
              <div
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => setModalOpen(true)}
              >
                <div>
                  <PiFlagFill color="#ff3838" size={20} />
                </div>
                <div className="text-[#ff3838] hover:scale-110">Report</div>
              </div>
              <div
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => setShareModal(true)}
              >
                <div className="scale-x-[-1]">
                  <BiSolidShare size={20} color="#fff" />
                </div>
                <div className="text-white hover:scale-110">Share</div>
              </div>
            </div>
          </div>

          <div>
            <div
              className="flex items-center border border-[#8E8E8E] bg-white w-fit rounded-md px-3 font-medium py-1 gap-2 cursor-pointer"
              onClick={() => setShowPopup(!showPopup)}
            >
              <div className="text-black text-sm">Guest</div>
              <div
                className={
                  showPopup
                    ? "rotate-180 duration-200 ease-in-out"
                    : "duration-200 ease-in-out"
                }
              >
                <IoMdArrowDropdown color="#4F4F4F" />
              </div>
            </div>
            {showPopup && (
              <div
                className="absolute bg-white text-[#1E1E1E] rounded-xl mt-1 py-2 duration-200 ease-in-out"
                style={{ boxShadow: "0px 4px 9.1px 0px rgba(0,0,0,0.04)" }}
              >
                {data.attendees.map((attendee, index) => (
                  <div key={index}>
                    <div className="flex items-center text-sm gap-3 px-6  py-[10px]">
                      <div>
                        <Image
                          src={
                            attendee.profileInfo?.image
                              ? `https://gateway.lighthouse.storage/ipfs/${attendee.profileInfo.image}`
                              : user
                          }
                          alt="image"
                          width={18}
                          height={18}
                          className="rounded-full"
                          priority
                        />
                      </div>
                      <div>
                        {attendee.attendee_address.slice(0, 8) +
                          "........." +
                          attendee.attendee_address.slice(-6)}{" "}
                      </div>
                    </div>
                    {index !== data.attendees.length - 1 && (
                      <div className="border border-[#D9D9D9]"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {data.description.length > 0 && (
          <div
            className={`px-6 pt-4 pb-4 rounded-b-3xl bg-white text-[#1E1E1E]`}
          >
            <>
              {/* <div
                className={`${
                  isExpanded ? "max-h-full" : "max-h-24 line-clamp-3"
                } transition-[max-height] duration-500 ease-in-out `}
              >
                {data.description}
              </div> */}
              <div
                ref={contentRef}
                className={`max-h-full transition-max-height duration-500 ease-in-out overflow-hidden ${
                  isExpanded ? "max-h-full" : "max-h-24 line-clamp-3"
                }`}
                style={{
                  maxHeight: isExpanded ? `${contentHeight}px` : "6rem",
                }}
              >
                <div className="overflow-hidden">{data.description}</div>
              </div>

              {getLineCount(data.description) > 3 && (
                <button
                  className="text-sm text-light-cyan mt-2"
                  onClick={toggleExpansion}
                >
                  {isExpanded ? "View Less" : "View More"}
                </button>
              )}
            </>
          </div>
        )}
      </div>
      {modalOpen && (
        <ReportOptionModal
          data={data}
          collection={collection}
          isOpen={modalOpen}
          onClose={handleModalClose}
        />
      )}
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

      {shareModal && (
        <ShareMediaModal
          isOpen={shareModal}
          onClose={handleShareClose}
          data={data}
        />
      )}
    </div>
  );
}

export default WatchSession;
