// import { useRouter } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import React, { useCallback, useEffect, useState } from "react";
import { LineWave, ThreeCircles } from "react-loader-spinner";

import { Bar, Pie, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { Toaster, toast } from "react-hot-toast";
import { IoCopy } from "react-icons/io5";
import Image from "next/image";
import NOLogo from "@/assets/images/daos/operators.png";
import AVSLogo from "@/assets/images/daos/avss.png";
import EILogo from "@/assets/images/daos/eigen_logo.png";
import styles from "@/components/IndividualDelegate/DelegateVotes.module.css";
import {
  Button,
  Dropdown,
  Pagination,
  Tooltip as CopyToolTip,
} from "@nextui-org/react";
import copy from "copy-to-clipboard";

import { IoSearchSharp } from "react-icons/io5";
import "../../css/SearchShine.css";
import "../../css/ImagePulse.css";
import "../../css/ExploreDAO.css";
import OperatorsAnalytics from "./OperatorsAnalytics";

// Register ChartJS modules
ChartJS.register(Title, Tooltip, Legend, ArcElement);

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

function DelegateInfo({
  props,
  desc,
  delegateInfo,
}: {
  props: Type;
  desc: string;
  delegateInfo: any;
}) {
  const [Loading, setLoading] = useState(true);
  const [isDataLoading, setDataLoading] = useState<boolean>(false);
  const router = useRouter();
  const [activeButton, setActiveButton] = useState("onchain");
  const [isPageLoading, setPageLoading] = useState<boolean>(true);
  const [avsOperators, setAVSOperators] = useState<any[]>([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [earningsReceiver, setEarningsReceiver] = useState("");

  const fetchData = useCallback(async () => {
    if (!hasMore || isDataLoading) return;

    setDataLoading(true);
    const options = { method: "GET" };
    const avsOperatorsRes = await fetch(
      `https://api.eigenexplorer.com/avs/${props.individualDelegate}/operators?withTvl=true&skip=${currentPage}&take=12`,
      options
    );

    const newAvsOperators = await avsOperatorsRes.json();

    if (newAvsOperators.data.length === 0) {
      setHasMore(false);
    } else {
      setAVSOperators((prevOperators) => [
        ...prevOperators,
        ...newAvsOperators.data,
      ]);
      setCurrentPage((prevPage) => prevPage + 12);
    }

    setDataLoading(false);
    setInitialLoad(false);
  }, [currentPage, hasMore, isDataLoading, props.individualDelegate]);

  useEffect(() => {
    if (props.daoDelegates === "avss" && initialLoad) {
      fetchData();
    }
  }, [fetchData, props.daoDelegates, initialLoad]);

  const debounce = (
    func: { (): void; apply?: any },
    delay: number | undefined
  ) => {
    let timeoutId: string | number | NodeJS.Timeout | undefined;
    return (...args: any) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(null, args);
      }, delay);
    };
  };

  const handleScroll = useCallback(() => {
    if (initialLoad) return;

    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    const threshold = 100;
    if (
      scrollTop + clientHeight >= scrollHeight - threshold &&
      !isDataLoading
    ) {
      fetchData();
    }
  }, [fetchData, initialLoad, isDataLoading]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(props.individualDelegate);
        const res = await fetch(
          `/api/get-statement?individualDelegate=${props.individualDelegate}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            // body: JSON.stringify({ individualDelegate: props.individualDelegate }),
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await res.json();
        const statement = data.statement.payload.delegateStatement;
        console.log("statement", statement);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [props.individualDelegate]);

  const renderParagraphs = (text: string) => {
    return text
      .split("\n")
      .filter((paragraph) => paragraph.trim() !== "")
      .map((paragraph, index) => (
        <p key={index} className="mb-3">
          {paragraph}
        </p>
      ));
  };

  type FilteredData = [string, number];

  const filteredData: FilteredData[] = Object.entries(delegateInfo.tvl.tvlStrategies)
  .filter((entry): entry is [string, number] => 
    typeof entry[1] === 'number' && entry[1] !== 0 && entry[0] !== "Eigen"
  )
  .map(([key, value]): FilteredData => [key, value])
  .sort((a, b) => b[1] - a[1]); 

  // Create labels and data arrays
  const labels = filteredData.map(([key, value]) => key);
  const dataValues = filteredData.map(([key, value]) => value);

  // Define the data for the Pie chart
  // const data = {
  //   labels: labels,
  //   datasets: [
  //     {
  //       label: "TVL Strategies",
  //       data: dataValues,
  //       backgroundColor: [
  //         "rgba(255, 99, 132, 0.6)",
  //         "rgba(54, 162, 235, 0.6)",
  //         "rgba(75, 192, 192, 0.6)",
  //         "rgba(255, 206, 86, 0.6)",
  //         "rgba(153, 102, 255, 0.6)",
  //         "rgba(199, 199, 199, 0.6)",
  //         "rgba(255, 159, 64, 0.6)",
  //         "rgba(83, 102, 255, 0.6)",
  //         "rgba(132, 206, 86, 0.6)",
  //         "rgba(192, 192, 75, 0.6)",
  //         "rgba(199, 83, 64, 0.6)",
  //         "rgba(102, 153, 255, 0.6)",
  //         "rgba(255, 83, 64, 0.6)",
  //       ],
  //       borderColor: [
  //         "rgba(255, 99, 132, 0.6)",
  //         "rgba(54, 162, 235, 0.6)",
  //         "rgba(75, 192, 192, 0.6)",
  //         "rgba(255, 206, 86, 0.6)",
  //         "rgba(153, 102, 255, 0.6)",
  //         "rgba(199, 199, 199, 0.6)",
  //         "rgba(255, 159, 64, 0.6)",
  //         "rgba(83, 102, 255, 0.6)",
  //         "rgba(132, 206, 86, 0.6)",
  //         "rgba(192, 192, 75, 0.6)",
  //         "rgba(199, 83, 64, 0.6)",
  //         "rgba(102, 153, 255, 0.6)",
  //         "rgba(255, 83, 64, 0.6)",
  //       ],
  //       borderWidth: 2,
  //     },
  //   ],
  // };

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalEth = delegateInfo.tvl.tvlRestaking;

  const chartData = {
    labels: filteredData.map(([label]) => label),
    datasets: [
      {
        data: filteredData.map(([_, value]) => value),
        backgroundColor: [
          "#3498db",
          "#2ecc71",
          "#9b59b6",
          "#f1c40f",
          "#e74c3c",
          "#1abc9c",
          "#34495e",
          "#95a5a6",
          "#d35400",
          "#c0392b",
          "#16a085",
          "#8e44ad",
          "#2c3e50",
        ],
        borderColor: [
          "#3498db",
          "#2ecc71",
          "#9b59b6",
          "#f1c40f",
          "#e74c3c",
          "#1abc9c",
          "#34495e",
          "#95a5a6",
          "#d35400",
          "#c0392b",
          "#16a085",
          "#8e44ad",
          "#2c3e50",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    onHover: (event: any, chartElement: any) => {
      if (chartElement.length > 0) {
        setHoveredIndex(chartElement[0].index);
      } else {
        setHoveredIndex(null);
      }
    },
  };

  const handleCopy = (addr: string) => {
    copy(addr);
    toast("Address Copied");
  };

  const formatTVL = (value: number): string => {
    if (!value) return "0";

    const absValue = Math.abs(value);

    // Function to round to 2 decimal places
    const roundToTwo = (num: number): number => {
      return Math.round(num * 100) / 100;
    };

    if (absValue >= 1000000) {
      // For millions, use 'm'
      const millions = absValue / 1000000;
      return roundToTwo(millions).toFixed(2) + "m";
    } else if (absValue >= 1000) {
      // For thousands, use 'k'
      const thousands = absValue / 1000;
      return roundToTwo(thousands).toFixed(2) + "k";
    }

    // For values less than 1000, just round to 2 decimal places
    return roundToTwo(absValue).toFixed(2);
  };

  return (
    <div>
      <div className="pe-16">
        <div className="flex gap-3 py-1 min-h-10 justify-center">
          <div>
            <div className="text-white w-[200px] flex flex-col gap-[10px] items-center border-[0.5px] border-[#D9D9D9] rounded-xl p-4 tvlDiv">
              <Image
                src={EILogo}
                alt="Image not found"
                width={60}
                height={60}
                style={{ width: "53px", height: "53px" }}
                className="rounded-full"
              ></Image>
              <div className="text-light-cyan font-semibold">
                {delegateInfo?.totalStakers
                  ? formatTVL(Number(delegateInfo?.totalStakers))
                  : 0}
                &nbsp;
              </div>
              <div>total stakers</div>
            </div>
          </div>
          <div>
            <div className="text-white w-[200px] flex flex-col gap-[10px] items-center border-[0.5px] border-[#D9D9D9] rounded-xl p-4 tvlDiv">
              <Image
                src={EILogo}
                alt="Image not found"
                width={60}
                height={60}
                style={{ width: "53px", height: "53px" }}
                className="rounded-full"
              ></Image>
              <div className="text-light-cyan font-semibold">
                {delegateInfo?.tvl.tvl
                  ? formatTVL(Number(delegateInfo?.tvl.tvl))
                  : 0}
                &nbsp;
              </div>
              <div>TVL ETH</div>
            </div>
          </div>
          <div>
            {props.daoDelegates === "avss" && (
              <div className="w-[200px] flex flex-col gap-[10px] items-center text-white border-[0.5px] border-[#D9D9D9] rounded-xl p-4 tvlDiv">
                <Image
                  src={EILogo}
                  alt="Image not found"
                  width={60}
                  height={60}
                  style={{ width: "53px", height: "53px" }}
                  className="rounded-full"
                ></Image>
                <div className="text-light-cyan font-semibold">
                  {delegateInfo?.totalOperators
                    ? formatTVL(Number(delegateInfo?.totalOperators))
                    : 0}
                  &nbsp;
                </div>
                <div>total operators</div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 py-1 min-h-10 justify-center">
          <div>
            <div className="w-[200px] flex flex-col gap-[10px] items-center text-white border-[0.5px] border-[#D9D9D9] rounded-xl p-4 tvlDiv">
              <Image
                src={EILogo}
                alt="Image not found"
                width={60}
                height={60}
                style={{ width: "53px", height: "53px" }}
                className="rounded-full"
              ></Image>
              {/* <div className="text-light-cyan font-semibold">
                &nbsp;
                {delegateInfo?.tvl.tvl
                  ? parseFloat((delegateInfo?.tvl.tvlRestaking).toFixed(2))
                  : 0}
                &nbsp;
              </div> */}
              <div className="text-light-cyan font-semibold">
                {delegateInfo?.tvl.tvl
                  ? formatTVL(delegateInfo?.tvl.tvlRestaking)
                  : 0}
                &nbsp;
              </div>
              <div>TVL Restaked ETH</div>
            </div>
          </div>

          <div>
            <div className="w-[200px] flex flex-col gap-[10px] items-center text-white border-[0.5px] border-[#D9D9D9] rounded-xl p-4 tvlDiv">
              <Image
                src={EILogo}
                alt="Image not found"
                width={60}
                height={60}
                style={{ width: "53px", height: "53px" }}
                className="rounded-full"
              ></Image>
              {/* <div className="text-light-cyan font-semibold">
                &nbsp;
                {delegateInfo?.tvl.tvl
                  ? parseFloat((delegateInfo?.tvl.tvlRestaking).toFixed(2))
                  : 0}
                &nbsp;
              </div> */}
              <div className="text-light-cyan font-semibold">
                {delegateInfo?.tvl.tvl
                  ? formatTVL(delegateInfo?.tvl.tvlStrategies.Eigen)
                  : 0}
                &nbsp;
              </div>
              <div>Eigen Restaked</div>
            </div>
          </div>

          <div>
            <div className="w-[200px] flex flex-col gap-[10px] items-center text-white border-[0.5px] border-[#D9D9D9] rounded-xl p-4 tvlDiv">
              <Image
                src={EILogo}
                alt="Image not found"
                width={60}
                height={60}
                style={{ width: "53px", height: "53px" }}
                className="rounded-full"
              ></Image>
              {/* <div className="text-light-cyan font-semibold">
                &nbsp;
                {delegateInfo?.tvl.tvl
                  ? parseFloat((delegateInfo?.tvl.tvlRestaking).toFixed(2))
                  : 0}
                &nbsp;
              </div> */}
              <div className="text-light-cyan font-semibold">
                {delegateInfo?.tvl.tvl
                  ? formatTVL(delegateInfo?.tvl.tvlBeaconChain)
                  : 0}
                &nbsp;
              </div>
              <div>Native ETH</div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          boxShadow: "0px 4px 30.9px 0px rgba(0, 0, 0, 0.12)",
          width: "96%",
        }}
        className={`rounded-xl my-3 py-6 px-5 text-sm bg-deep-blue ${
          desc ? "" : "min-h-52"
        }`}
      >
        <h1 className="text-xl mb-5">About</h1>
        {Loading ? (
          <div className="flex -mt-10 justify-center">
            <LineWave
              visible={true}
              height="150"
              width="150"
              color="#FFFFFF"
              ariaLabel="line-wave-loading"
            />
          </div>
        ) : desc !== "" ? (
          desc
        ) : (
          <div className="font-semibold text-base flex justify-center">
            Descrption has not been provided
          </div>
        )}
      </div>

      {/* <div className="flex w-fit gap-16 text-sm py-3 mb-6 ml-10"> */}
      {/* <div className="flex gap-16 text-sm py-3 mb-6 items-center justify-center">
        <button
          className={`
              ml-[-90px] p-9 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-100 outline-none duration-300 group
             ${
               activeButton === "onchain"
                 ? "text-light-cyan"
                 : "text-white font-bold border-white"
             } `}
          onClick={() => fetchAttestation("onchain")}
        >
          Onchain
        </button>
        <button
          className={` 
              ml-[-30px] p-5 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-100 outline-none duration-300 group
            ${
              activeButton === "offchain"
                ? "text-light-cyan"
                : "text-white font-bold border-white"
            }`}
          onClick={() => fetchAttestation("offchain")}
        >
          Offchain
        </button>
      </div>

      <div className="grid grid-cols-4 pe-32 gap-10 px-12">
        {details.length > 0 ? (
          details.map((key, index) => (
            <div
              key={index}
              className="relative bg-gradient-to-r from-midnight-blue via-deep-blue to-slate-blue text-white rounded-2xl py-7 px-3 transform transition-transform duration-500 hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 border-2 border-transparent hover:border-white hover:border-dashed hover:border-opacity-50"
              onClick={() => router.push(`${key.ref}`)}
            >
              <div className="font-semibold text-3xl text-center pb-2 relative z-10">
                {isSessionHostedLoading &&
                isSessionAttendedLoading &&
                isOfficeHoursHostedLoading &&
                isOfficeHoursAttendedLoading ? (
                  <div className="flex items-center justify-center">
                    <RotatingLines
                      visible={true}
                      width="36"
                      strokeColor="grey"
                      ariaLabel="oval-loading"
                    />
                  </div>
                ) : (
                  key.number
                )}
              </div>
              <div className="text-center text-sm relative z-10">
                {key.desc}
              </div>
            </div>
          ))
        ) : (
          <div>No data available</div>
        )}
      </div> */}

      <div className="flex justify-center mt-5 pe-16">
        {filteredData.length > 0 ? (
          <div
            className="bg-gray-800 rounded-lg shadow-lg overflow-hidden px-4"
            style={{ width: "100%" }}
          >
            <div className="p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Total</h2>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {totalEth.toLocaleString(undefined, {
                      maximumFractionDigits: 3,
                    })}{" "}
                    ETH
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-x-40">
                <div className="w-full md:w-1/2 pr-10">
                  <div className="space-y-2">
                    {filteredData.map(([label, value], index) => (
                      <div
                        key={label}
                        className={`flex justify-between items-center rounded-md ${
                          hoveredIndex === index ? "bg-gray-600" : ""
                        }`}
                      >
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-1"
                            style={{
                              backgroundColor:
                                chartData.datasets[0].backgroundColor[
                                  index %
                                    chartData.datasets[0].backgroundColor.length
                                ],
                            }}
                          ></div>
                          <span>{label}</span>
                        </div>
                        <span className="font-semibold">
                          {value.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-full md:w-1/2 flex items-center justify-center mt-6 md:mt-0">
                  <div style={{ width: "300px", height: "300px" }}>
                    <Pie data={chartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>No ETH stacked</p>
        )}
      </div>
    </div>
  );
}

export default DelegateInfo;
