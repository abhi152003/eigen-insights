"use client";

import React, { useEffect, useState } from "react";

// Components
import BottomBar from "@/components/BottomBar/BottomBar";
import Sidebar from "@/components/Sidebar/Sidebar";
import GridLayout from "@/components/GridLayout/GridLayout";
import Prompts from "@/components/common/Prompts";
import {
  useRoom,
  useLocalPeer,
  usePeerIds,
  useHuddle01,
  useDataMessage,
} from "@huddle01/react/hooks";
import { usePathname } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import AcceptRequest from "@/components/Modals/AcceptRequest";
import useStore from "@/components/store/slices";
import { toast } from "react-hot-toast";
import { Role } from "@huddle01/server-sdk/auth";
import Chat from "@/components/Chat/Chat";
import { useAccount } from "wagmi";
import { TailSpin, ThreeCircles } from "react-loader-spinner";
import Link from "next/link";
import { PiRecordFill } from "react-icons/pi";
import { Tooltip } from "@nextui-org/react";
import copy from "copy-to-clipboard";

// import Chat from '@/components/Chat/Chat';

const Home = ({ params }: { params: { roomId: string } }) => {
  const { push } = useRouter();
  // const { changePeerRole } = useAcl();
  const [requestedPeerId, setRequestedPeerId] = useState("");
  const { showAcceptRequest, setShowAcceptRequest } = useStore();
  const addChatMessage = useStore((state) => state.addChatMessage);
  const addRequestedPeers = useStore((state) => state.addRequestedPeers);
  const removeRequestedPeers = useStore((state) => state.removeRequestedPeers);
  const requestedPeers = useStore((state) => state.requestedPeers);
  const avatarUrl = useStore((state) => state.avatarUrl);
  const userDisplayName = useStore((state) => state.userDisplayName);
  const isChatOpen = useStore((state) => state.isChatOpen);
  const { updateMetadata, metadata, peerId, role } = useLocalPeer<{
    displayName: string;
    avatarUrl: string;
    isHandRaised: boolean;
  }>();
  const { peerIds } = usePeerIds();

  const { huddleClient } = useHuddle01();

  const { address } = useAccount();

  const [isAllowToEnter, setIsAllowToEnter] = useState<boolean>();
  const [notAllowedMessage, setNotAllowedMessage] = useState<string>();
  const [meetingDetailsVisible, setMeetingDetailsVisible] = useState(true);

  const path = usePathname();

  const [modalOpen, setModalOpen] = useState(false);

  const handleModalClose = () => {
    setModalOpen(false);
    push(`/meeting/session/${params.roomId}/lobby`);
  };

  const { state } = useRoom({
    onLeave: () => {
      setModalOpen(true);
    },
  });

  useEffect(() => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      roomId: params.roomId,
      meetingType: "session",
    });

    const requestOptions: any = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    async function verifyMeetingId() {
      try {
        const response = await fetch("/api/verify-meeting-id", requestOptions);
        const result = await response.json();

        if (result.success) {
          if (result.message === "Meeting has ended") {
            console.log("Meeting has ended");
            setIsAllowToEnter(false);
            setNotAllowedMessage(result.message);
          } else if (result.message === "Meeting is upcoming") {
            console.log("Meeting is upcoming");
            setIsAllowToEnter(true);
          } else if (result.message === "Meeting has been denied") {
            console.log("Meeting has been denied");
            setIsAllowToEnter(false);
            setNotAllowedMessage(result.message);
          } else if (result.message === "Meeting does not exist") {
            setIsAllowToEnter(false);
            setNotAllowedMessage(result.message);
            console.log("Meeting does not exist");
          } else if (result.message === "Meeting is ongoing") {
            setIsAllowToEnter(true);
            console.log("Meeting is ongoing");
          }
        } else {
          // Handle error scenarios
          setNotAllowedMessage(result.error || result.message);
          console.error("Error:", result.error || result.message);
        }
      } catch (error) {
        // Handle network errors
        console.error("Fetch error:", error);
      }
    }

    verifyMeetingId();
  }, [params.roomId, isAllowToEnter, notAllowedMessage]);

  useEffect(() => {
    if (state === "idle" && isAllowToEnter) {
      console.log(`pushing to /meeting/session/${params.roomId}/lobby`);
      push(`/meeting/session/${params.roomId}/lobby`);
      return;
    } else {
      updateMetadata({
        displayName: userDisplayName,
        avatarUrl: avatarUrl,
        isHandRaised: metadata?.isHandRaised || false,
      });

      if (role === "listener" || role === "speaker") {
        // Get the attendee address based on the role
        const attendeeAddress = role === "listener" ? address : peerId;
        let uniqueAddresses = new Set();
        let attendees = [];

        if (!uniqueAddresses.has(attendeeAddress)) {
          // Add the address to the set of unique addresses
          uniqueAddresses.add(attendeeAddress);

          // Construct the request body

          // Add the attendee dynamically one by one
          attendees.push({
            attendee_address: attendeeAddress,
          });
        }

        console.log("All attendees: ", attendees);

        const raw = JSON.stringify({
          meetingId: params.roomId,
          attendees: attendees,
        });

        // Make the API request
        const requestOptions = {
          method: "PUT",
          body: raw,
        };

        fetch("/api/update-session-attendees", requestOptions)
          .then((response) => response.text())
          .then((result) => console.log(result))
          .catch((error) => console.error(error));
      }
    }
  }, [isAllowToEnter]);

  useDataMessage({
    onMessage(payload, from, label) {
      if (label === "requestToSpeak") {
        setShowAcceptRequest(true);
        setRequestedPeerId(from);
        addRequestedPeers(from);
        setTimeout(() => {
          setShowAcceptRequest(false);
        }, 5000);
      }

      if (label === "chat" && from !== peerId) {
        const messagePayload = JSON.parse(payload);
        const newChatMessage = {
          name: messagePayload.name,
          text: messagePayload.message,
          is_user: false,
        };
        addChatMessage(newChatMessage);
      }
    },
  });

  useEffect(() => {
    if (!requestedPeers.includes(requestedPeerId)) {
      setShowAcceptRequest(false);
    }
  }, [requestedPeers]);

  const handleCopy = (link: string) => {
    copy(link);
    toast("Meeting link Copied");
  };

  return (
    <>
      {isAllowToEnter ? (
        <section className="bg-white flex h-screen text-black flex-col justify-between overflow-hidden">
          <>
            <div className="flex w-full h-[90%] pb-4 relative">
              <div className="absolute top-5 left-5">
                <Tooltip
                  showArrow
                  content={
                    <div className="font-poppins">
                      This meeting is being recorded
                    </div>
                  }
                  placement="right"
                  className="rounded-md bg-opacity-90 max-w-96"
                  closeDelay={1}
                >
                  <span>
                    <PiRecordFill color="#c42727" size={22} />
                  </span>
                </Tooltip>
              </div>
              <GridLayout />
              <Sidebar />
              <div className="absolute right-4 bottom-20">
                {Role.HOST
                  ? showAcceptRequest && (
                      <AcceptRequest peerId={requestedPeerId} />
                    )
                  : null}
              </div>
              {isChatOpen && <Chat />}
            </div>
            <BottomBar />
            <Prompts />
          </>
        </section>
      ) : (
        <>
          {notAllowedMessage ? (
            <div className="flex justify-center items-center h-screen font-poppins">
              <div className="text-center">
                <div className="text-6xl mb-6">☹️</div>
                <div className="text-lg font-semibold mb-8">
                  Oops, {notAllowedMessage}
                </div>
                <Link
                  // onClick={() => push(`/profile/${address}?active=info`)}
                  href={`/profile/${address}?active=info`}
                  className="px-6 py-3 bg-white text-black rounded-full shadow-lg hover:bg-light-blue hover:text-white transition duration-300 ease-in-out"
                >
                  Back to Profile
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                  <div className="flex items-center justify-center pt-10">
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
                </div>
              </div>
            </>
          )}
        </>
      )}

    </>
  );
};
export default Home;
