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
import "../../css/ShineFont.css";
import "../../css/ExploreDAO.css"
import { IoSearchSharp } from "react-icons/io5";

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
    localStorage.setItem(
      "visitedDao",
      JSON.stringify({ ...localData, [formatted]: [formatted, img] })
    );
    if (formatted === "operators") {
      router.push(`/${formatted}?active=operatorsList`);
    } else {
      router.push(`/${formatted}?active=avsList`);
    }
  };

  const handleClose = () => {
    setStatus(false);
    localStorage.setItem("hasSeenNotification", "true");
  };
  // const coursercall=(event)=>{
  //   const rect = event.currentTarget.getBoundingClientRect();
  //   const x = event.clientX - rect.left;
  //   const y = event.clientY - rect.top;

  //   setCirclePosition({ x, y });
  //   SetCircleShow(true);
  //   console.log(circlePosition);

  //   setTimeout(() => {
  //     SetCircleShow(false);
  //   }, 1000); // Adjust the time as needed

  // }

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
    <div className="pt-6 pl-14 pr-6 min-h-screen">
      <div className="">
        <div className="flex justify-between pe-10">
          <div
            className="font-medium text-4xl font-quanty pb-4 shineFont"
          >
            Explore
          </div>

          <div>
            <ConnectWalletWithENS />
            {/* <ConnectButton /> */}
          </div>
        </div>

        <div
          style={{ background: "rgba(238, 237, 237, 0.36)" }}
          className="flex border-[0.5px] border-black w-fit rounded-full my-3 font-poppins"
        >
          {/* <input
            type="text"
            placeholder="Search"
            style={{ background: "rgba(238, 237, 237, 0.36)" }}
            className="pl-5 rounded-full outline-none"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          ></input>
          <span className="flex items-center bg-black rounded-full px-6 py-3">
            <Image src={search} alt="search" width={20} height={20} />
          </span> */}

          <div className="searchBox btnShineExplore">
            <input
              className="searchInput"
              type="text"
              name=""
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <button className="searchButton">
              <IoSearchSharp className="iconExplore"/>
            </button>
          </div>
        </div>

        <div className="flex gap-10 py-8 font-poppins">
          {daoInfo.length > 0 ? (
            daoInfo.map((daos: any, index: any) => (
              <div
                key={daos.name}
                style={{ boxShadow: "0px 4px 50.8px 0px rgba(0, 0, 0, 0.11)" }}
                className="px-5 py-7 rounded-2xl cursor-pointer bg-deep-blue exploreMainDiv"
                onClick={() => handleClick(daos.name, daos.img)}
              >
                <div className="flex justify-center">
                  <Image
                    src={daos.img}
                    alt="Image not found"
                    width={80}
                    height={80}
                    style={{ width: "80px", height: "80px" }}
                    className="rounded-full"
                  ></Image>
                </div>
                <div className="text-center">
                  <div className="py-3">
                    <div className="font-semibold capitalize">{daos.name}</div>
                    {daos.name === "Operators" ? (
                      <div className="text-sm bg-[#05223B] py-2 rounded-md mt-3">
                        {totalOperators} Operators
                      </div>
                    ) : (
                      <div className="text-sm bg-[#05223B] py-2 rounded-md mt-3">
                        {totalAVSs} AVSs
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
            ))
          ) : (
            <div className="pl-3 text-xl font-semibold">
              No such Dao available
            </div>
          )}
          {/* <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ boxShadow: "0px 4px 50.8px 0px rgba(0, 0, 0, 0.11)" }}
            className={`px-5 py-7 rounded-2xl cursor-pointer flex items-center justify-center relative transition-all duration-250 ease-in-out ${
              isHovered ? "border-2 border-gray-600" : ""
            }`}
          >
            <div className="">
              <FaCirclePlus
                size={70}
                className={
                  isHovered
                    ? "blur-md transition-all duration-250 ease-in-out text-slate-300"
                    : "block transition-all duration-250 ease-in-out text-slate-300"
                }
              />
            </div>
            <Link
              href={`https://app.deform.cc/form/a401a65c-73c0-49cb-8d96-63e36ef36f88`}
              target="_blank"
              className={`absolute inset-0 flex items-center justify-center bottom-0  ${
                isHovered ? "block" : "hidden"
              }`}
            >
              <span className="text-xl font-semibold text-slate-800">
                Add your DAO
              </span>
            </Link>
          </div> */}
        </div>
      </div>
      {showNotification && !isPageLoading && (
        <div
          className={`flex fixed items-center justify-center bottom-9 rounded-full font-poppins text-sm font-medium left-[34%] w-[32rem] ${
            status ? "" : "hidden"
          }`}
        >
          <div className="py-2 bg-blue-shade-100 text-white rounded-full px-7">
            To ensure optimal user experience, please note that our site is
            designed to be responsive on desktop devices.
          </div>
          <div
            className="bg-red-600 hover:bg-red-700 p-2 rounded-full cursor-pointer ml-3"
            onClick={handleCloseNotification}
          >
            <ImCross color="#fff" size={10} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ExploreDAOs;
