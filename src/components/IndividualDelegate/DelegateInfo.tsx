import { useRouter } from "next-nprogress-bar";
import React, { useCallback, useEffect, useState } from "react";
import { LineWave } from "react-loader-spinner";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { toast } from "react-hot-toast";
import Image from "next/image";
import EILogo from "@/assets/images/daos/eigen_logo.png";
import copy from "copy-to-clipboard";

import { IoSearchSharp } from "react-icons/io5";
import "../../css/SearchShine.css";
import "../../css/DelegateInfo.css";
import "../../css/ImagePulse.css";
import "../../css/ExploreDAO.css";
import OperatorsAnalytics from "./OperatorsAnalytics";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  PieChartSkeleton,
  DataListSkeleton,
} from "../Skeletons/PieChartSkeleton";
import { gql, useQuery } from "@apollo/client";

import operators_logo from "@/assets/images/daos/Operator4.jpg";
import avss_logo from "@/assets/images/daos/AVSs3 New.png";
import restaker3 from "@/assets/images/logos/a_restaker3.png";
import eigenToken from "@/assets/images/logos/a_eigenToken2.png";
import ethlogo from "@/assets/images/logos/a_ethlogo1.png";
import restaker4 from "@/assets/images/logos/a_restaker4.png";
import restaker5 from "@/assets/images/logos/a_restaker5.png";
import LST1 from "@/assets/images/logos/a_ETHLocked.png";
import LST2 from "@/assets/images/logos/a_LST2.png";
import eigenToken3 from "@/assets/images/logos/a_eigenToken3.png";
import eigenToken4 from "@/assets/images/logos/a_eigenToken4.png";
import eigenToken2 from "@/assets/images/logos/a_eigenToken2 (3).png";

const GET_OPERATOR_AVSS = gql`
  query GetOperatorAvss($operatorId: String!) {
    operator(id: $operatorId) {
      id
      avsStatuses(where: { status: 1 }) {
        avs {
          id
          metadataURI
          registrationsCount
        }
        status
      }
    }
  }
`;

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalAvss, setTotalAvss] = useState(0);

  const {
    loading: graphLoading,
    error,
    data,
  } = useQuery(GET_OPERATOR_AVSS, {
    variables: { operatorId: props.individualDelegate },
    context: {
      subgraph: "avs",
    },
  });

  useEffect(() => {
    if (data && data.operator) {
      console.log(data.operator.avsStatuses.length);
      setTotalAvss(data.operator.avsStatuses.length);
    }
  });

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
        setIsLoading(false);
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

  const filteredData: FilteredData[] = Object.entries({
    ...delegateInfo.tvl.tvlStrategies,
    "Native ETH": delegateInfo.tvl.tvlBeaconChain,
  })
    .filter(
      (entry): entry is [string, number] =>
        typeof entry[1] === "number" && entry[1] !== 0 && entry[0] !== "Eigen"
    )
    .map(([key, value]): FilteredData => [key, value])
    .sort((a, b) => b[1] - a[1]);

  const labels = filteredData.map(([key, value]) => key);
  const dataValues = filteredData.map(([key, value]) => value);

  const totalEth =
    delegateInfo.tvl.tvlRestaking + delegateInfo.tvl.tvlBeaconChain;

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: dataValues,
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
          "#27ae60",
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
          "#27ae60",
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
    toast("Address Copied 🎊");
  };

  const formatTVL = (value: number): string => {
    if (!value) return "0";

    const absValue = Math.abs(value);

    const roundToTwo = (num: number): number => {
      return Math.round(num * 100) / 100;
    };

    if (absValue >= 1000000) {
      const millions = absValue / 1000000;
      return roundToTwo(millions).toFixed(2) + "m";
    } else if (absValue >= 1000) {
      const thousands = absValue / 1000;
      return roundToTwo(thousands).toFixed(2) + "k";
    }

    return roundToTwo(absValue).toFixed(2);
  };

  return (
    <div>
      <div className="pe-16">
        <div className="flex gap-3 py-1 min-h-10 justify-center">
          <div>
            <div className="text-white w-[200px] flex flex-col gap-[10px] items-center border-[0.5px] border-[#D9D9D9] rounded-xl p-4 tvlDiv">
              <Image
                src={eigenToken2}
                alt="Image not found"
                width={60}
                height={60}
                style={{ width: "53px", height: "53px", objectFit: "cover" }}
                className="rounded-full img1"
              />
              <div className="text-light-cyan font-semibold">
                {delegateInfo?.totalStakers
                  ? formatTVL(Number(delegateInfo?.totalStakers))
                  : 0}
                &nbsp;
              </div>
              <div>Total Stakers</div>
            </div>
          </div>
          <div>
            <div className="text-white w-[200px] flex flex-col gap-[10px] items-center border-[0.5px] border-[#D9D9D9] rounded-xl p-4 tvlDiv">
              <Image
                src={LST1}
                alt="Image not found"
                width={60}
                height={60}
                style={{ width: "53px", height: "53px", objectFit: "cover" }}
                className="rounded-full img2"
              />
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
            {props.daoDelegates === "avss" ? (
              <div className="w-[200px] flex flex-col gap-[10px] items-center text-white border-[0.5px] border-[#D9D9D9] rounded-xl p-4 tvlDiv">
                <Image
                  src={operators_logo}
                  alt="Image not found"
                  width={40}
                  height={40}
                  style={{ width: "53px", height: "53px" }}
                  className="rounded-full img3"
                />
                <div className="text-light-cyan font-semibold">
                  {delegateInfo?.totalOperators
                    ? formatTVL(Number(delegateInfo?.totalOperators))
                    : 0}
                  &nbsp;
                </div>
                <div>Total Operators</div>
              </div>
            ) : (
              <div className="w-[200px] flex flex-col gap-[10px] items-center text-white border-[0.5px] border-[#D9D9D9] rounded-xl p-4 tvlDiv">
                <Image
                  src={avss_logo}
                  alt="Image not found"
                  width={60}
                  height={60}
                  style={{ width: "53px", height: "53px", objectFit: "cover" }}
                  className="rounded-full img4"
                />
                <div className="text-light-cyan font-semibold">
                  {totalAvss}
                  &nbsp;
                </div>
                <div>Total AVSs</div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 py-1 min-h-10 justify-center">
          <div>
            <div className="w-[200px] flex flex-col gap-[10px] items-center text-white border-[0.5px] border-[#D9D9D9] rounded-xl p-4 tvlDiv">
              <Image
                src={LST2}
                alt="Image not found"
                width={80}
                height={80}
                style={{ width: "53px", height: "53px", objectFit: "fill" }}
                className="rounded-full img5"
              />
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
                src={eigenToken3}
                alt="Image not found"
                width={60}
                height={60}
                style={{ width: "53px", height: "53px", objectFit: "cover" }}
                className="rounded-full img6"
              />
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
                src={ethlogo}
                alt="Image not found"
                width={80}
                height={80}
                style={{ width: "53px", height: "53px", objectFit: "cover" }}
                className="rounded-full img7"
              />
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
            Description has not been provided
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="w-full max-w-full md:max-w-5xl bg-gray-800 rounded-lg shadow-lg overflow-hidden mx-auto px-4">
          <div className="p-4 animate-pulse">
            <div className="flex justify-between items-center">
              <Skeleton width={100} />
              <Skeleton width={150} />
            </div>
          </div>
          <div className="p-6 animate-pulse">
            <div className="flex flex-col md:flex-row gap-x-40">
              <DataListSkeleton />
              <PieChartSkeleton />
            </div>
          </div>
        </div>
      ) : (
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
                          key={index}
                          className={`flex justify-between items-center rounded-md ${
                            hoveredIndex === index ? "bg-gray-600" : ""
                          }`}
                        >
                          <div className="flex items-center flex-grow min-w-0 mr-4">
                            <div
                              className="w-4 h-4 rounded-full mr-2 flex-shrink-0"
                              style={{
                                backgroundColor:
                                  chartData.datasets[0].backgroundColor[
                                    index %
                                      chartData.datasets[0].backgroundColor
                                        .length
                                  ],
                              }}
                            ></div>
                            <span>{label}</span>
                          </div>
                          <div className="flex justify-end items-center gap-6 flex-1">
                            <div className="min-w-[80px] text-right font-semibold">
                              {value.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                            </div>
                            <div className="min-w-[60px] text-right font-semibold">
                              {((value / totalEth) * 100).toFixed(2)}%
                            </div>
                          </div>
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
            <p>No ETH staked</p>
          )}
        </div>
      )}
    </div>
  );
}

export default DelegateInfo;
