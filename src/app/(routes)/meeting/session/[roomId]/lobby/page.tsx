"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
import { useRouter } from "next-nprogress-bar";

// Assets
import { Toaster, toast } from "react-hot-toast";
import { BasicIcons } from "@/assets/BasicIcons";

// Components
import FeatCommon from "@/components/common/FeatCommon";
import AvatarWrapper from "@/components/common/AvatarWrapper";

// Store
import useStore from "@/components/store/slices";

// Hooks
import {
  useHuddle01,
  useLobby,
  useLocalPeer,
  usePeerIds,
  useRoom,
} from "@huddle01/react/hooks";
import { useAccount, useNetwork } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Role } from "@huddle01/server-sdk/auth";
import { Oval, TailSpin, ThreeCircles } from "react-loader-spinner";
import Link from "next/link";
import { RxCross2 } from "react-icons/rx";
import record from "@/assets/images/instant-meet/record.svg";
import arrow from "@/assets/images/instant-meet/arrow.svg";
import ConnectWalletWithENS from "@/components/ConnectWallet/ConnectWalletWithENS";

type lobbyProps = {};

const Lobby = ({ params }: { params: { roomId: string } }) => {
  // Local States
  console.log("params", params);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const avatarUrl = useStore((state) => state.avatarUrl);
  const setAvatarUrl = useStore((state) => state.setAvatarUrl);
  const setUserDisplayName = useStore((state) => state.setUserDisplayName);
  const userDisplayName = useStore((state) => state.userDisplayName);
  const [token, setToken] = useState<string>("");
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const { updateMetadata, metadata, peerId, role } = useLocalPeer<{
    displayName: string;
    avatarUrl: string;
    isHandRaised: boolean;
  }>();

  const { address, isDisconnected } = useAccount();
  const [isLoading, setIsLoading] = useState(true);

  const { push } = useRouter();
  const { chain, chains } = useNetwork();
  const [profileDetails, setProfileDetails] = useState<any>();

  const [popupVisibility, setPopupVisibility] = useState(true);

  // Huddle Hooks
  const { joinRoom, state, room } = useRoom();
  const [isAllowToEnter, setIsAllowToEnter] = useState<boolean>();
  const [notAllowedMessage, setNotAllowedMessage] = useState<string>();
  const [hostAddress, setHostAddress] = useState();
  const [meetingStatus, setMeetingStatus] = useState<any>();

  useEffect(() => {
    console.log("meetingStatus", meetingStatus);
  }, [meetingStatus]);

  const handleStartSpaces = async () => {
    console.log("in start spaces");
    if (isDisconnected) {
      toast("Connect your wallet to join the meeting!");
    } else {
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
      const response = await fetch("/api/verify-meeting-id", requestOptions);
      const result = await response.json();

      if (result.success) {
        setHostAddress(result.data.host_address);
      }
      if (result.message === "Meeting is ongoing") {
        setMeetingStatus("Ongoing");
      }

      // if (address === hostAddress || meetingStatus === "Ongoing") {
      if (address === hostAddress || result.message === "Meeting is ongoing") {
        setIsJoining(true);

        let token = "";
        if (state !== "connected") {
          const requestBody = {
            roomId: params.roomId,
            role: "host",
            displayName: address,
            address: address, // assuming you have userAddress defined somewhere
          };
          try {
            const response = await fetch("/api/new-token", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestBody),
            });

            // if (!response.ok) {
            //   throw new Error("Failed to fetch token");
            // }

            token = await response.text(); // Change this line
            // console.log("Token fetched successfully:", token);
          } catch (error) {
            console.error("Error fetching token:", error);
            // Handle error appropriately, e.g., show error message to user
            toast.error("Failed to fetch token");
            setIsJoining(false);
            return;
          }
        }

        try {
          console.log({ token });
          console.log(params.roomId);
          await joinRoom({
            roomId: params.roomId,
            token,
          });
        } catch (error) {
          console.error("Error joining room:", error);
          // Handle error appropriately, e.g., show error message to user
          toast.error("Failed to join room");
        }

        console.log("Role.HOST", Role.HOST);
        if (Role.HOST) {
          console.log("inside put api");
          const myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/json");

          const raw = JSON.stringify({
            meetingId: params.roomId,
            meetingType: "session",
          });
          const requestOptions: any = {
            method: "PUT",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
          };
          const response = await fetch(
            `/api/update-meeting-status/${params.roomId}`,
            requestOptions
          );
          const responseData = await response.json();
          console.log("responseData: ", responseData);
          // setMeetingStatus("Ongoing");
        }

        setIsJoining(false);
      } else {
        toast("Please wait, Host has not started the session yet.");
        console.log("Wait..");
      }
    }
  };

  useEffect(() => {
    if (state === "connected") {
      push(`/meeting/session/${params.roomId}`);
    }
  }, [state]);

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
          setHostAddress(result.data.host_address);
        }

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
            setMeetingStatus("Ongoing");
            setIsAllowToEnter(true);
            // setMeetingStatus("Ongoing");
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
  }, [params.roomId, isAllowToEnter, notAllowedMessage, meetingStatus]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
          address: address,
        });

        const requestOptions: any = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        };
        const response = await fetch(`/api/profile/${address}`, requestOptions);
        const result = await response.json();
        const resultData = await result.data;

        if (Array.isArray(resultData)) {
          const filtered: any = resultData.filter((data) => {
            return data.displayName !== "";
          });
          console.log("filtered profile: ", filtered);
          setProfileDetails(filtered[0]);
          setIsLoading(false);
          const imageCid = filtered[0].image;
          if (imageCid) {
            setAvatarUrl(`https://gateway.lighthouse.storage/ipfs/${imageCid}`);
          }
          setUserDisplayName(filtered[0].displayName);
        }

        if (resultData.length === 0) {
          const result = await response.json();
          const resultData = await result.data.delegate;

          setProfileDetails(resultData);
          setIsLoading(false);

          if (resultData.ensName !== null) {
            setUserDisplayName(resultData.ensName);
          } else {
            setUserDisplayName(formattedAddress);
          }
        }
      } catch (error) {
        console.log("Error in catch: ", error);
      }
    };
    fetchData();
  }, []);

  const formattedAddress = address?.slice(0, 6) + "..." + address?.slice(-4);

  return (
    <>
      {isAllowToEnter ? (
        <div className="h-screen">
          {popupVisibility && (
            <div className="mt-3 flex items-center justify-center">
              <div className="bg-white text-[#3E3D3D] flex gap-2 justify-center items-center py-2 font-poppins font-semibold w-fit rounded-md drop-shadow-xl">
                <div className="flex ml-2">
                  <Image
                    alt="record-left"
                    width={25}
                    height={25}
                    src={record}
                    className="w-5 h-5 mr-2"
                  />
                </div>
                <div className="">This meeting is being recorded.</div>
                <div className="flex mr-2">
                  <button
                    onClick={() => setPopupVisibility(false)}
                    className="p-1 bg-[#3E3D3D] rounded-full text-white text-bold"
                  >
                    <RxCross2 size={10} />
                  </button>
                </div>
              </div>
            </div>
          )}
          <main className="flex flex-col items-center justify-center text-slate-100 font-poppins">
            <div className="flex flex-col items-center justify-center gap-4 w-1/3 mt-4">
              <div className="text-center flex items-center justify-center bg-slate-100 w-full rounded-2xl py-20">
                <div className="relative">
                  <Image
                    src={avatarUrl}
                    alt="audio-spaces-img"
                    width={125}
                    height={125}
                    className="maskAvatar object-contain"
                    quality={100}
                    priority
                  />
                  <video
                    src={avatarUrl}
                    muted
                    className="maskAvatar absolute left-1/2 top-1/2 z-10 h-full w-full -translate-x-1/2 -translate-y-1/2"
                    // autoPlay
                    loop
                  />
                  <button
                    onClick={() => setIsOpen((prev) => !prev)}
                    type="button"
                    className="text-white absolute bottom-0 right-0 z-10"
                  >
                    {BasicIcons.edit}
                  </button>
                  <FeatCommon
                    onClose={() => setIsOpen(false)}
                    className={
                      isOpen
                        ? "absolute top-4 block"
                        : "absolute top-1/2 -translate-y-1/2 hidden "
                    }
                  >
                    <div className="relative mt-5">
                      <div className="grid-cols-3 grid h-full w-full place-items-center gap-6  px-6 ">
                        {profileDetails?.image && (
                          <Image
                            src={`https://gateway.lighthouse.storage/ipfs/${profileDetails.image}`}
                            alt={`image`}
                            width={45}
                            height={45}
                            loading="lazy"
                            className="object-contain cursor-pointer"
                            onClick={() => {
                              setAvatarUrl(
                                `https://gateway.lighthouse.storage/ipfs/${profileDetails.image}`
                              );
                            }}
                          />
                        )}
                        {Array.from({ length: 20 }).map((_, i) => {
                          const url = `/avatars/avatars/${i}.png`;

                          return (
                            <AvatarWrapper
                              key={`sidebar-avatars-${i}`}
                              isActive={avatarUrl === url}
                              onClick={() => {
                                setAvatarUrl(url);
                              }}
                            >
                              <Image
                                src={url}
                                alt={`avatar-${i}`}
                                width={45}
                                height={45}
                                loading="lazy"
                                className="object-contain"
                              />
                            </AvatarWrapper>
                          );
                        })}
                      </div>
                    </div>
                  </FeatCommon>
                </div>
              </div>
              {isDisconnected ? <ConnectWalletWithENS /> : null}
              <div className="flex items-center w-full flex-col">
                <div className="flex flex-col justify-center w-full gap-1 text-light-blue font-semibold">
                  Display name
                  <div className="flex w-full items-center rounded-[10px] border px-3 text-slate-300 outline-none border-white-800 backdrop-blur-[400px] focus-within:border-slate-600 gap-">
                    <div className="mr-2">
                      <Image
                        alt="user-icon"
                        src="/images/user-icon.svg"
                        className="w-5 h-5"
                        width={30}
                        height={30}
                      />
                    </div>
                    {/* <input
                    value={userDisplayName}
                    onChange={(e) => {
                      setUserDisplayName(e.target.value);
                    }}
                    type="text"
                    placeholder="Enter your name"
                    className="flex-1 bg-transparent py-3 outline-none text-black"
                  /> */}
                    <div className="flex-1 bg-transparent py-3 outline-none text-white">
                      {isLoading ? (
                        <div className="flex items-center justify-center top-10">
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
                        profileDetails?.displayName ||
                        profileDetails?.ensName ||
                        formattedAddress
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center w-1/2">
                <button
                  className={`flex items-center justify-center text-slate-100 font-semibold rounded-full p-3 w-full ${
                    isLoading
                      ? "bg-light-blue text-white"
                      : "bg-deep-blue text-white transition-transform transform hover:scale-105 duration-300"
                  }`}
                  onClick={handleStartSpaces}
                  disabled={isLoading}
                >
                  {isJoining ? "Joining Spaces..." : "Start meeting"}
                  {!isJoining && (
                    <Image
                      alt="narrow-right"
                      width={30}
                      height={30}
                      src={arrow}
                      className="w-5 h-5 ml-2"
                    />
                  )}
                </button>
              </div>
            </div>
          </main>
        </div>
      ) : (
        <>
          {notAllowedMessage ? (
            <div className="flex justify-center items-center h-screen">
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
};
export default Lobby;
