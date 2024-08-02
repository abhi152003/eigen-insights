"use client";

import React, { useState, useEffect } from "react";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next-nprogress-bar";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import { dao_details } from "@/config/daoDetails";
import "../../css/ShineFont.css";
import "../../css/BtnShine.css";
import "../../css/SearchShine.css";
import "../../css/ExploreDAO.css";
import restakers_logo from "@/assets/images/logos/a_restakerFinal.png";

import client from "../utils/avsExplorerClient";
import { ApolloClient, ApolloProvider, gql, useQuery } from "@apollo/client";
import Analytics from "../Analytics/Analytics";

const GET_EIGENLAYER_METRICS = gql`
  query MyQuery {
    eigenLayers {
      avsCount
      operatorsCount
      stakersCount
      stakersWhoDelegateCount
    }
    avss(where: { paused: false, metadataURI_not_contains: "null" }) {
      id
      paused
    }
  }
`;

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
  const [status, setStatus] = useState(true);

  const router = useRouter();
  const [showNotification, setShowNotification] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const { loading, error, data } = useQuery(GET_EIGENLAYER_METRICS, {
    context: {
      subgraph: "avs",
    },
  });

  useEffect(() => {
    const storedStatus = sessionStorage.getItem("notificationStatus");
    setShowNotification(storedStatus !== "closed");
    setIsPageLoading(false);
  }, []);

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
    } else if (formatted === "restakers") {
      router.push(`/${formatted}`);
    }
  };

  const handleClose = () => {
    setStatus(false);
    localStorage.setItem("hasSeenNotification", "true");
  };

  const [totalOperators, setTotalOperators] = useState();
  const [totalAVSs, setTotalAVSs] = useState();
  const [totalStakers, setTotalStakers] = useState();

  useEffect(() => {
    // const fetchData = async () => {
    //   const options = { method: "GET" };
    //   try {
    //     const operatorsRes = await fetch(
    //       "https://api.eigenexplorer.com/metrics/total-operators",
    //       options
    //     );
    //     const avsRes = await fetch(
    //       "https://api.eigenexplorer.com/metrics/total-avs",
    //       options
    //     );
    //     const metricsRes = await fetch(
    //       "https://api.eigenexplorer.com/metrics",
    //       options
    //     );

    //     const totalOperators = await operatorsRes.json();
    //     const totalAVSs = await avsRes.json();
    //     const metricsData = await metricsRes.json();
    //     // console.log(totalOperators.totalOperators)
    //     setTotalOperators(totalOperators.totalOperators);
    //     setTotalAVSs(totalAVSs.totalAvs);
    //     setTotalStakers(metricsData.totalStakers);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // };

    // fetchData();

    if (data) {
      console.log("eigenlayerrrrrrrrrrrrr", data.eigenLayers);
      console.log("activeavssssssssssss", data.avss);
      setTotalOperators(data.eigenLayers[0].operatorsCount);
      setTotalStakers(data.eigenLayers[0].stakersWhoDelegateCount);
      setTotalAVSs(data.avss.length);
    }
  });

  return (
    <>
      <div className="flex items-center justify-between pr-[5rem] pl-[94px]">
        <h2 className="text-4xl pb-7 mt-5 font-semibold shineFont">
          EigenLayer
        </h2>
        <div>
          <ConnectWalletWithENS />
        </div>
      </div>

      {/* <div className="px-20">
        <div className="grid min-[475px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-10 py-8 font-poppins">
          {daoInfo.length > 0 ? (
            daoInfo.map((daos: any, index: any) => (
              <div
                key={daos.name}
                className="parent-hover-div px-5 py-7 rounded-2xl cursor-pointer flex flex-col justify-around border-1 border-white bg-midnight-blue dark-blue-shadow"
                onClick={() => handleClick(daos.name, daos.img)}
              >
                <div className="flex justify-center">
                  <Image
                    src={daos.img}
                    alt="Image not found"
                    style={{ width: "50px", height: "50px" }}
                    className="rounded-full"
                  ></Image>
                </div>
                <div className="text-center">
                  <div className="py-3">
                    <div className="font-semibold capitalize">{daos.name}</div>
                    {daos.name === "Operators" ? (
                      <div className="child-hover-div text-sm bg-navy-blue py-2 rounded-md mt-3">
                        <span className="text-light-cyan font-bold">
                          {totalOperators}
                        </span>{" "}
                        Operators
                      </div>
                    ) : (
                      <div className="child-hover-div text-sm bg-navy-blue py-2 rounded-md mt-3">
                        <span className="text-light-cyan font-bold">
                          {totalAVSs}
                        </span>{" "}
                        AVSs
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="pl-3 text-xl font-semibold">
              No such data available
            </div>
          )}

          <div
            className="px-5 py-7 rounded-2xl cursor-pointer flex flex-col gap-8 border-1 border-white bg-midnight-blue dark-blue-shadow"
            onClick={() => handleClick("restakers", restakers_logo)}
          >
            <div className="flex justify-center">
              <Image
                src={restakers_logo}
                alt="Image not found"
                width={60}
                height={60}
                style={{ width: "53px", height: "53px" }}
                className="rounded-full"
              ></Image>
            </div>
            <div className="text-center">
              <div className="py-2">
                <div className="font-semibold capitalize">Restakers</div>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      <div className="px-20">
        <div className="grid min-[475px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-3 gap-10 pb-7 pt-4 font-poppins">
          {daoInfo.length > 0 ? (
            daoInfo.map((daos: any, index: any) => (
              <div
                key={daos.name}
                className="parent-hover-div px-5 py-7 rounded-2xl cursor-pointer flex flex-col justify-between border-1 border-white bg-midnight-blue dark-blue-shadow"
                onClick={() => handleClick(daos.name, daos.img)}
              >
                <div className="flex items-center justify-center mb-4">
                  <Image
                    src={daos.img}
                    alt="Image not found"
                    width={50}
                    height={50}
                    className="rounded-full mr-3"
                  />
                  <div className="font-semibold capitalize">{daos.name}</div>
                </div>
                <div className="child-hover-div text-sm bg-navy-blue py-2 rounded-md text-center">
                  <span className="text-light-cyan font-bold">
                    {daos.name === "Operators" ? totalOperators : totalAVSs}
                  </span>{" "}
                  {daos.name === "Operators" ? "Operators" : "AVSs"}
                </div>
              </div>
            ))
          ) : (
            <div className="pl-3 text-xl font-semibold">
              No such data available
            </div>
          )}

          <div
            className="parent-hover-div px-5 pb-7 pt-[26px] rounded-2xl cursor-pointer flex flex-col justify-between border-1 border-white bg-midnight-blue dark-blue-shadow"
            onClick={() => handleClick("restakers", restakers_logo)}
          >
            <div className="flex items-center justify-center mb-4">
              <Image
                src={restakers_logo}
                alt="Image not found"
                width={73}
                height={53}
                className="rounded-full mr-3"
              />
              <div className="font-semibold capitalize">Restakers</div>
            </div>
            <div className="child-hover-div text-sm bg-navy-blue py-2 rounded-md text-center">
              <span className="text-light-cyan font-bold">{totalStakers}</span>
              {"  "}
              Stakers
            </div>
          </div>
        </div>
      </div>

      <ApolloProvider client={client}>
        <Analytics />
      </ApolloProvider>
    </>
  );
}

export default ExploreDAOs;
