"use client";

import React, { useState, useEffect } from "react";
import Image, { StaticImageData } from "next/image";
import search from "@/assets/images/daos/search.png";
// import { useRouter } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import { ImCross } from "react-icons/im";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaCirclePlus } from "react-icons/fa6";
import Link from "next/link";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import { dao_details } from "@/config/daoDetails";
import EILogo from "@/assets/images/daos/eigen_logo.png";
import "../../css/ShineFont.css";
import "../../css/BtnShine.css";
import "../../css/SearchShine.css";
import "../../css/ExploreDAO.css";
import { IoSearchSharp } from "react-icons/io5";

import client from "../utils/avsExplorerClient";
import { ApolloClient, ApolloProvider } from "@apollo/client";
import Analytics from "../Analytics/Analytics";

function ExploreDAOs() {
  const dao_info = Object.keys(dao_details).map((key) => {
    const dao = dao_details[key];
    return {
      name: dao.title,
      value: dao.number_of_delegates,
      img: dao.logo,
    };
  });

  const [daoInfo, setDaoInfo] = useState(dao_info);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState(true);

  const router = useRouter();
  const [showNotification, setShowNotification] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [circlePosition, setCirclePosition] = useState({ x: 0, y: 0 });
  const [IshowCircle, SetCircleShow] = useState(false);

  useEffect(() => {
    const storedStatus = sessionStorage.getItem("notificationStatus");
    setShowNotification(storedStatus !== "closed");
    setIsPageLoading(false);
  }, []);

  const handleCloseNotification = () => {
    sessionStorage.setItem("notificationStatus", "closed");
    setShowNotification(false);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const filtered = dao_info.filter((item) =>
      item.name.toLowerCase().startsWith(query.toLowerCase())
    );
    setDaoInfo(filtered);
  };

  const handleClick = (name: string, img: StaticImageData) => {
    const formatted = name.toLowerCase();
    const localData = JSON.parse(localStorage.getItem("visitedDao") || "{}");
    // only store operators and avss, not analytics
    if (formatted === "operators" || formatted === "avss")
      localStorage.setItem(
        "visitedDao",
        JSON.stringify({ ...localData, [formatted]: [formatted, img] })
      );
    if (formatted === "operators") {
      router.push(`/${formatted}?active=operatorsList`);
    } else if (formatted === "avss") {
      router.push(`/${formatted}?active=avsList`);
    } else if (formatted === "eigenlayer") {
      router.push(`/${formatted}?active=analytics`);
    }
    // else if (formatted === "restakers") {
    //   router.push(`/${formatted}?active=restakersList`);
    // }
  };

  const handleClose = () => {
    setStatus(false);
    localStorage.setItem("hasSeenNotification", "true");
  };

  const [totalOperators, setTotalOperators] = useState();
  const [totalAVSs, setTotalAVSs] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const options = { method: "GET" };
      try {
        const operatorsRes = await fetch(
          "https://api.eigenexplorer.com/metrics/total-operators",
          options
        );
        const avsRes = await fetch(
          "https://api.eigenexplorer.com/metrics/total-avs",
          options
        );

        const totalOperators = await operatorsRes.json();
        const totalAVSs = await avsRes.json();
        // console.log(totalOperators.totalOperators)
        setTotalOperators(totalOperators.totalOperators);
        setTotalAVSs(totalAVSs.totalAvs);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  });

  return (
    // <div className="pt-6 pl-14 pr-14 min-h-screen">
    //   <div className="">
    //     <div className="flex justify-between pe-10">
    //       <div className="text-light-cyan font-medium text-4xl font-quanty pb-4 ml-3">
    //         Explore
    //       </div>

    //       <div>
    //         <ConnectWalletWithENS />
    //         {/* <ConnectButton /> */}
    //       </div>
    //     </div>

    //     <div
    //       style={{ background: "rgba(238, 237, 237, 0.36)" }}
    //       className="flex border-[0.5px] border-black w-fit rounded-full my-3 font-poppins"
    //     >
    //       <div className="searchBox">
    //         <input
    //           className="searchInput"
    //           type="text"
    //           name=""
    //           placeholder="Search"
    //           value={searchQuery}
    //           onChange={(e) => handleSearchChange(e.target.value)}
    //         />
    //         <button className="searchButton">
    //           <IoSearchSharp className="iconExplore" />
    //         </button>
    //       </div>
    //     </div>

    //     <div className="grid min-[475px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-10 py-8 font-poppins">
    //       {daoInfo.length > 0 ? (
    //         daoInfo.map((daos: any, index: any) => (

    //           <div
    //             key={daos.name}
    //             className="parent-hover-div px-5 py-7 rounded-2xl cursor-pointer flex flex-col justify-around border-1 border-white bg-midnight-blue dark-blue-shadow"
    //             onClick={() => handleClick(daos.name, daos.img)}
    //           >
    //               <div className="flex justify-center">
    //                 <Image
    //                   src={daos.img}
    //                   alt="Image not found"
    //                   style={{ width: "50px", height: "50px" }}
    //                   className="rounded-full"
    //                 ></Image>
    //               </div>
    //               <div className="text-center">
    //                 <div className="py-3">
    //                   <div className="font-semibold capitalize">
    //                     {daos.name}
    //                   </div>
    //                   {daos.name === "Operators" ? (
    //                     <div className="child-hover-div text-sm bg-navy-blue py-2 rounded-md mt-3">
    //                       <span className="text-light-cyan font-bold">{totalOperators}</span> Operators
    //                     </div>
    //                   ) : (
    //                     <div className="child-hover-div text-sm bg-navy-blue py-2 rounded-md mt-3">
    //                       <span className="text-light-cyan font-bold">{totalAVSs}</span> AVSs
    //                     </div>
    //                   )}
    //                 </div>
    //               </div>
    //             </div>
    //         ))
    //       ) : (
    //         <div className="pl-3 text-xl font-semibold">
    //           No such data available
    //         </div>
    //       )}

    //       <div
    //         className="px-5 py-7 rounded-2xl cursor-pointer flex flex-col gap-8 border-1 border-white bg-midnight-blue dark-blue-shadow"
    //         onClick={() => handleClick("eigenlayer", EILogo)}
    //       >
    //         <div className="flex justify-center">
    //           <Image
    //             src={EILogo}
    //             alt="Image not found"
    //             width={60}
    //             height={60}
    //             style={{ width: "53px", height: "53px" }}
    //             className="rounded-full"
    //           ></Image>
    //         </div>
    //         <div className="text-center">
    //           <div className="py-2">
    //             <div className="font-semibold capitalize">Eigen Layer</div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    //   {showNotification && !isPageLoading && (
    //     <div
    //       className={`flex fixed items-center justify-center bottom-9 rounded-full font-poppins text-sm font-medium left-[34%] w-[32rem] ${
    //         status ? "" : "hidden"
    //       }`}
    //     >
    //       <div className="py-2 bg-medium-blue text-white rounded-full px-7">
    //         To ensure optimal user experience, please note that our site is
    //         designed to be responsive on desktop devices.
    //       </div>
    //       <div
    //         className="bg-red-600 hover:bg-red-700 p-2 rounded-full cursor-pointer ml-3"
    //         onClick={handleCloseNotification}
    //       >
    //         <ImCross color="#fff" size={10} />
    //       </div>
    //     </div>
    //   )}
    // </div>

    <>
      <h2 className="text-4xl text-center pb-7 mt-5 font-semibold shineFont">
        EigenLayer
      </h2>

      <ApolloProvider client={client}>
        <Analytics />
      </ApolloProvider>
    </>
  );
}

export default ExploreDAOs;
