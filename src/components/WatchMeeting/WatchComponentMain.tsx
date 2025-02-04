"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { Oval, ThreeCircles } from "react-loader-spinner";
import search from "@/assets/images/daos/search.png";
import WatchSession from "./WatchSession";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "./WatchSession.module.css";
import WatchSessionVideo from "./WatchSessionVideo";
import WatchSocialLinks from "./WatchSocialLinks";
import { color } from "framer-motion";
import WatchCollectibleInfo from "./WatchCollectibleInfo";
import WatchLeaderBoard from "./WatchLeaderBoard";
import WatchFreeCollect from "./WatchFreeCollect";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import "../../css/ShineFont.css"

interface AttestationObject {
  attendee_address: string;
  attendee_uid: string;
}

function WatchComponentMain({ props }: { props: { id: string } }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any>();
  const [collection, setCollection] = useState<any>();
  const [searchQuery, setSearchQuery] = useState("");
  const [watchSessionHeight, setWatchSessionHeight] = useState<number | 0>();

  useEffect(() => {
    async function fetchData() {
      try {
        const requestOptions: any = {
          method: "GET",
          redirect: "follow",
        };
        const response = await fetch(
          `/api/get-watch-data/${props.id}`,
          requestOptions
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        console.log("result::::", result);
        setData(result.data[0]);
        setCollection(result.collection);
        console.log(result.data[0].video_uri.video_uri);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, [props.id]);

  function utcToLocal(utcDateString: any) {
    // Create a Date object from the UTC string
    const utcDate = new Date(utcDateString);

    // Get the local date and time components
    const localDate = utcDate.toLocaleDateString();
    const localTime = utcDate.toLocaleTimeString();

    // Combine and return the formatted local date and time
    return `${localDate} ${localTime}`;
  }

  return (
    <>
      {data ? (
        <div className=" 1.7xl:ps-14 lg:ps-5 ps-4 xl:ps-10">
          <div className="flex justify-between items-center pt-6 pb-3 1.7xl:pe-10 lg:pe-3 pe-2">
            <div className="font-poppins font-medium text-3xl ml-3">
              <span className="shineFont">EigenInsight</span>
            </div>
            <ConnectWalletWithENS />
          </div>

          <div className="grid grid-cols-3 gap-y-4 gap-x-4 1.7xl:gap-x-6 pt-6 relative 1.7xl:pr-14 pr-4 lg:pr-5 xl-pr-10">
            {/* Left side */}
            <div className="sticky top-10 z-10 col-span-2 space-y-5 font-poppins pb-10 ">
              <WatchSessionVideo data={data} collection={collection} />
              <WatchSession data={data} collection={collection} />

              {/* /Video Recommendation */}
              {/* <WatchVideoRecommendation /> */}
            </div>

            {/* Right side */}
            <div
              className={`col-span-1  pb-8 ${styles.customScrollbar} gap-y-6 flex flex-col`}
            >
              {/* <WatchSessionList /> */}

              {/* Free */}
              <WatchFreeCollect />

              {/* Leader BOARD */}
              <WatchLeaderBoard />

              {/* COLLECTIBLE INFO */}
              <WatchCollectibleInfo />

              {/* SOCIAL LINKS */}
              <WatchSocialLinks data={data} collection={collection} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen">
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
      )}
    </>
  );
}

export default WatchComponentMain;
