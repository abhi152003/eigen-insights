// import { useRouter } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  BallTriangle,
  Comment,
  Hourglass,
  InfinitySpin,
  LineWave,
  Oval,
  RotatingLines,
  ThreeCircles,
  ThreeDots,
} from "react-loader-spinner";

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
  const [loading, setLoading] = useState(true);
  const [isDataLoading, setDataLoading] = useState<boolean>(false);
  const router = useRouter();
  const [sessionHostCount, setSessionHostCount] = useState(0);
  const [sessionAttendCount, setSessionAttendCount] = useState(0);
  const [officehoursHostCount, setOfficehoursHostCount] = useState(0);
  const [officehoursAttendCount, setOfficehoursAttendCount] = useState(0);
  const [isSessionHostedLoading, setSessionHostedLoading] = useState(true);
  const [isSessionAttendedLoading, setSessionAttendedLoading] = useState(true);
  const [isOfficeHoursHostedLoading, setOfficeHoursHostedLoading] =
    useState(true);
  const [isOfficeHoursAttendedLoading, setOfficeHoursAttendedLoading] =
    useState(true);
  const [activeButton, setActiveButton] = useState("onchain");
  const [isPageLoading, setPageLoading] = useState<boolean>(true);
  const [avsOperators, setAVSOperators] = useState<any[]>([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

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
    if (activeButton === "onchain") {
      fetchAttestation("onchain");
    } else if (activeButton === "offchain") {
      fetchAttestation("offchain");
    }
  }, [activeButton, props.individualDelegate, props.daoDelegates]);

  const fetchAttestation = async (buttonType: string) => {
    let sessionHostingCount = 0;
    let sessionAttendingCount = 0;
    let officehoursHostingCount = 0;
    let officehoursAttendingCount = 0;

    setActiveButton(buttonType);
    setSessionHostedLoading(true);
    setSessionAttendedLoading(true);
    setOfficeHoursHostedLoading(true);
    setOfficeHoursAttendedLoading(true);

    const host_uid_key =
      buttonType === "onchain" ? "onchain_host_uid" : "uid_host";

    const attendee_uid_key =
      buttonType === "onchain" ? "onchain_uid_attendee" : "attendee_uid";

    const sessionHosted = async () => {
      try {
        const response = await fetch(
          `/api/get-meeting/${props.individualDelegate}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        if (result.success) {
          result.data.forEach((item: any) => {
            if (
              item.meeting_status === "Recorded" &&
              item.operator_or_avs === props.daoDelegates &&
              item[host_uid_key]
            ) {
              sessionHostingCount++;
            }
            // console.log("op host count: ", sessionHostingCount);
            setSessionHostCount(sessionHostingCount);
            setSessionHostedLoading(false);
          });
        } else {
          setSessionHostedLoading(false);
        }
      } catch (e) {
        console.log("Error: ", e);
      }
    };

    const sessionAttended = async () => {
      try {
        const response = await fetch(
          `/api/get-session-data/${props.individualDelegate}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              operator_or_avs: props.daoDelegates,
            }),
          }
        );
        const result = await response.json();
        if (result.success) {
          result.data.forEach((item: any) => {
            if (
              item.meeting_status === "Recorded" &&
              item.operator_or_avs === props.daoDelegates &&
              item.attendees.some((attendee: any) => attendee[attendee_uid_key])
            ) {
              sessionAttendingCount++;
            }
            // console.log("op attended count: ", sessionAttendingCount);
            setSessionAttendCount(sessionAttendingCount);
            setSessionAttendedLoading(false);
          });
        } else {
          setSessionAttendedLoading(false);
        }
      } catch (e) {
        console.log("Error: ", e);
      }
    };

    const officeHoursHosted = async () => {
      try {
        const response = await fetch(`/api/get-officehours-address`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: props.individualDelegate,
          }),
        });
        const result = await response.json();
        // console.log("office hours result: ", result);
        if (result.length > 0) {
          result.forEach((item: any) => {
            if (
              item.meeting_status === "inactive" &&
              item.operator_or_avs === props.daoDelegates &&
              item[host_uid_key]
            ) {
              officehoursHostingCount++;
            }
            // console.log("office hours host count: ", officehoursHostingCount);
            setOfficehoursHostCount(officehoursHostingCount);
            setOfficeHoursHostedLoading(false);
          });
        } else {
          setOfficeHoursHostedLoading(false);
        }
      } catch (e) {
        console.log("Error: ", e);
      }
    };

    const officeHoursAttended = async () => {
      try {
        const response = await fetch(`/api/get-attendee-individual`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attendee_address: props.individualDelegate,
          }),
        });
        const result = await response.json();
        // console.log("office hours attended result: ", result);
        if (result.length > 0) {
          result.forEach((item: any) => {
            if (
              item.meeting_status === "inactive" &&
              item.operator_or_avs === props.daoDelegates &&
              item.attendees.some((attendee: any) => attendee[attendee_uid_key])
            ) {
              officehoursAttendingCount++;
            }
            // console.log("officehours attended: ", officehoursAttendingCount);
            setOfficehoursAttendCount(officehoursAttendingCount);
            setOfficeHoursAttendedLoading(false);
          });
        } else {
          setOfficeHoursAttendedLoading(false);
        }
      } catch (e) {
        console.log("Error: ", e);
      }
    };

    sessionHosted();
    sessionAttended();
    officeHoursHosted();
    officeHoursAttended();
  };

  const details = [
    {
      number: sessionHostCount,
      desc: "Sessions hosted",
      ref: `/${props.daoDelegates}/${props.individualDelegate}?active=delegatesSession&session=hosted`,
    },
    {
      number: sessionAttendCount,
      desc: "Sessions attended",
      ref: `/${props.daoDelegates}/${props.individualDelegate}?active=delegatesSession&session=attended`,
    },
    {
      number: officehoursHostCount,
      desc: "Office Hours hosted",
      ref: `/${props.daoDelegates}/${props.individualDelegate}?active=officeHours&hours=hosted`,
    },
    {
      number: officehoursAttendCount,
      desc: "Office Hours attended",
      ref: `/${props.daoDelegates}/${props.individualDelegate}?active=officeHours&hours=attended`,
    },
  ];
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

  const filteredData: FilteredData[] = Object.entries(
    delegateInfo.tvl.tvlStrategies
  )
    .filter(([key, value]) => value !== 0 && key !== "Eigen")
    .map(([key, value]) => [key, value as number]);

  // Create labels and data arrays
  const labels = filteredData.map(([key, value]) => key);
  const dataValues = filteredData.map(([key, value]) => value);

  // Define the data for the Pie chart
  const data = {
    labels: labels,
    datasets: [
      {
        label: "TVL Strategies",
        data: dataValues,
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(199, 199, 199, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(83, 102, 255, 0.6)",
          "rgba(132, 206, 86, 0.6)",
          "rgba(192, 192, 75, 0.6)",
          "rgba(199, 83, 64, 0.6)",
          "rgba(102, 153, 255, 0.6)",
          "rgba(255, 83, 64, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(199, 199, 199, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(83, 102, 255, 0.6)",
          "rgba(132, 206, 86, 0.6)",
          "rgba(192, 192, 75, 0.6)",
          "rgba(199, 83, 64, 0.6)",
          "rgba(102, 153, 255, 0.6)",
          "rgba(255, 83, 64, 0.6)",
        ],
        borderWidth: 2,
      },
    ],
  };

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

  const formatTVL = (value: number) => {
    if (!value) return "0";

    const absValue = Math.abs(value);
    if (absValue >= 1000) {
      // Round to 3 decimal places, then format to 2
      const rounded = Math.round(value / 10) / 100;
      return rounded.toFixed(2) + "k";
    }
    // For values less than 1000, round to 2 decimal places
    return Math.round(value * 100) / 100;
  };

  return (
    <div>
      <div className="flex gap-3 py-1 min-h-10">
        <div>
          <div className="text-white w-[200px] flex flex-col gap-[10px] items-center border-[0.5px] border-[#D9D9D9] rounded-md px-3 py-1 mb-5 hover:cursor-pointer tvlDiv">
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
          <div className="text-white w-[200px] flex flex-col gap-[10px] items-center border-[0.5px] border-[#D9D9D9] rounded-md px-3 py-1 hover:cursor-pointer tvlDiv">
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
            <div className="w-[200px] flex flex-col gap-[10px] items-center text-white border-[0.5px] border-[#D9D9D9] rounded-md px-3 py-1 mb-5 hover:cursor-pointer tvlDiv">
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
        <div>
          <div className="w-[200px] flex flex-col gap-[10px] items-center text-white border-[0.5px] border-[#D9D9D9] rounded-md px-3 py-1 hover:cursor-pointer tvlDiv">
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
      </div>

      <div
        style={{
          boxShadow: "0px 4px 30.9px 0px rgba(0, 0, 0, 0.12)",
          width: "95%",
        }}
        className={`rounded-xl my-3 py-6 px-5 text-sm bg-deep-blue ${
          desc ? "" : "min-h-52"
        }`}
      >
        <h1 className="text-xl mb-5">About</h1>
        {loading ? (
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
                            maximumFractionDigits: 3,
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

      {/* {props.daoDelegates === "avss" ? (
        <div>
          <h1 className="mt-10 ml-3 font-medium text-3xl">Node Operators</h1>
          <div className="py-8 pe-14 font-poppins">
            {initialLoad ? (
              <div className="flex items-center justify-center">
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
            ) : avsOperators.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-3 gap-10">
                  {avsOperators.map((daos: any, index: number) => (
                    <div
                      key={index}
                      onClick={() =>
                        router.push(`/operators/${daos.address}?active=info`)
                      }
                      className="p-5 rounded-2xl flex flex-col justify-between cursor-pointer relative bg-midnight-blue h-full"
                      style={{
                        boxShadow: "0px 4px 50.8px 0px rgba(0, 0, 0, 0.11)",
                      }}
                    >
                      <div className="absolute top-2 right-2">
                        <Image
                          src={EILogo}
                          alt="EigenInsights Logo"
                          width={35}
                          height={35}
                        />
                      </div>

                      <div className="flex items-center mb-4">
                        <div className="relative w-20 h-20 flex-shrink-0 mr-4">
                          <Image
                            src={
                              daos.metadataLogo ??
                              (props.daoDelegates === "operators"
                                ? NOLogo
                                : props.daoDelegates === "avss"
                                ? AVSLogo
                                : "")
                            }
                            alt="Logo"
                            layout="fill"
                            objectFit="cover"
                            className="rounded-full"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {daos.metadataName ??
                              `${daos.address.slice(
                                0,
                                6
                              )}...${daos.address.slice(-4)}`}
                          </h3>
                          <div className="flex justify-start items-center gap-2 pb-2 pt-1">
                            {daos.address.slice(0, 6) +
                              "..." +
                              daos.address.slice(-4)}
                            <CopyToolTip
                              content="Copy"
                              placement="right"
                              closeDelay={1}
                              showArrow
                              className="bg-sky-blue"
                            >
                              <span className="cursor-pointer text-sm">
                                <IoCopy
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleCopy(daos.address);
                                  }}
                                />
                              </span>
                            </CopyToolTip>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col flex-grow">
                        {daos.metadataDescription ? (
                          <p className="text-sm flex-grow mb-6 line-clamp-3 border-t-1 pt-2 border-[#a0a0a0]">
                            {daos.metadataDescription}
                          </p>
                        ) : (
                          <p className="text-sm flex-grow mb-6 line-clamp-3 border-t-1 pt-2 border-[#a0a0a0]">No description provided</p>
                        )
                        }
                        
                        <div className="text-sm border-1 border-[#a0a0a0] py-2 px-2  w-full mb-2 text-left">
                          <span className="text-light-cyan font-semibold">
                            {daos.totalStakers}&nbsp;
                          </span>
                          Total Stakers
                        </div>
                        <div className="text-sm border-1 border-[#a0a0a0] py-2 px-2  w-full mb-2 text-left">
                          <span className="text-light-cyan font-semibold">
                            {daos.tvl.tvlStrategies.ETHx.toFixed(2)}&nbsp;
                          </span>
                          ETH Restaked
                        </div>
                        <div className="text-sm border-1 border-[#a0a0a0] py-2 px-2 w-full mb-2 text-left">
                          <span className="text-light-cyan font-semibold">
                            {daos.tvl.tvlStrategies.Eigen.toFixed(2)}&nbsp;
                          </span>
                          EIGEN Restaked
                        </div>
                      </div>
                    </div>
                  ))}
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
                {isDataLoading && (
                  <div className="flex items-center justify-center my-4">
                    <BallTriangle
                      height={70}
                      width={70}
                      radius={5}
                      color="#FFFFFF"
                      ariaLabel="ball-triangle-loading"
                      wrapperStyle={{}}
                      wrapperClass=""
                      visible={true}
                    />
                  </div>
                )}
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
      ) : (
        ""
      )} */}
    </div>
  );
}

export default DelegateInfo;
