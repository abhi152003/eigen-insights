"use client";
import React, { useEffect, useState } from "react";
import { Doughnut, Pie } from "react-chartjs-2";
import { Chart, ArcElement, Title } from "chart.js";
import { formatEther } from "ethers";
import { Oval, ThreeCircles } from "react-loader-spinner";
import "../../app/globals.css";
import { IoSearchSharp } from "react-icons/io5";
import { useAccount } from "wagmi";
import { gql, useQuery } from "@apollo/client";
import { IoCopy } from "react-icons/io5";
import copy from "copy-to-clipboard";
import toast, { Toaster } from "react-hot-toast";
import LeaderboardSkeleton from "../Skeletons/LeaderboardSkeleton";

import { FaChevronDown, FaCircleInfo, FaPlus } from "react-icons/fa6";
import { Tooltip } from "@nextui-org/react";

import { formatDistanceToNow, formatDistanceToNowStrict } from "date-fns";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  PieChartSkeleton,
  DataListSkeleton,
} from "../Skeletons/PieChartSkeleton";

// Define the type for our data
type ClaimData = {
  amount: string;
  account: string;
  blockTimestamp: string;
  transactionHash: string;
};
// Define a type for the TVL data
type TVLData = {
  [key: string]: number;
  "Native ETH": number;  // Now required instead of optional
};

// Props type for our component
type LeaderboardProps = {
  data: ClaimData[];
};

interface Share {
  strategyAddress: string;
  shares: string;
}

interface Withdrawal {
  createdAtBlock: number;
  delegatedTo: string;
  isCompleted: boolean;
  stakerAddress: string;
  shares: Share[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ data }) => {

  // Sort the data by amount (descending order)
  const sortedData = [...data].sort((a, b) => {
    const amountA = BigInt(a.amount);
    const amountB = BigInt(b.amount);
    if (amountA < amountB) return 1;
    if (amountA > amountB) return -1;
    return 0;
  });

  const handleCopy = (addr: any) => {
    copy(addr);
    toast("Address Copied 🎊");
  };

  return (
    <div className="bg-[#1f2937] text-white p-6 rounded-lg shadow-lg mt-4">
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
      <h2 className="text-2xl font-bold mb-4 text-white flex items-center">
        Airdrop Leaderboard 🎁🎊
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a3955]">
              <th className="px-4 py-2 text-left flex gap-2">
              <span className="pt-[19px]">Rank</span>
              <span>
              <Tooltip
                content={
                  <div className="font-poppins p-2 bg-medium-blue text-white rounded-md max-w-[20vw]">
                    <span className="text-sm">Based on the amount of ETH won by staker</span>
                  </div>
                }
                showArrow
                placement="right"
                delay={1}
              >
                <span className="px-2">
                  <FaCircleInfo className="cursor-pointer text-[#A7DBF2]" />
                </span>
              </Tooltip></span>
              </th>
              <th className="px-4 py-2 text-left">Account</th>
              <th className="px-4 py-2 text-right">Amount (ETH)</th>
              <th className="px-4 py-2 text-right">Claimed</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr
                key={item.transactionHash}
                className="border-b border-[#2a3955] hover:bg-[#1c2d4a] transition-colors"
              >
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <a
                      href={`https://etherscan.io/address/${item.account}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-light-cyan hover:underline"
                    >
                      <span>
                        {`${item.account.slice(0, 6)}...${item.account.slice(
                          -4
                        )}`}
                      </span>
                    </a>
                    <span
                      className="ml-2 cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleCopy(item.account);
                      }}
                      title="Copy"
                    >
                      <IoCopy size={16} color="#ffffff" />
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 text-right">
                  {(Number(BigInt(item.amount)) / 1e18).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right">
                  {formatDistanceToNowStrict(
                    new Date(parseInt(item.blockTimestamp) * 1000),
                    { addSuffix: true }
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    // <div className="bg-[#1f2937] text-white p-6 rounded-lg shadow-lg mt-4">
    //   <div className="h-8 w-64 bg-gray-700 rounded mb-4 animate-pulse"></div>
    //   <div className="overflow-x-auto animate-pulse">
    //     <table className="w-full">
    //       <thead>
    //         <tr className="border-b border-[#2a3955]">
    //           <th className="px-4 py-2 text-left">
    //             <div className="h-4 w-16 bg-gray-700 rounded"></div>
    //           </th>
    //           <th className="px-4 py-2 text-left">
    //             <div className="h-4 w-24 bg-gray-700 rounded"></div>
    //           </th>
    //           <th className="px-4 py-2 text-right">
    //             <div className="h-4 w-20 bg-gray-700 rounded ml-auto"></div>
    //           </th>
    //           <th className="px-4 py-2 text-right">
    //             <div className="h-4 w-20 bg-gray-700 rounded ml-auto"></div>
    //           </th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {[...Array(10)].map((_, index) => (
    //           <tr key={index} className="border-b border-[#2a3955]">
    //             <td className="px-4 py-2">
    //               <div className="h-4 w-8 bg-gray-700 rounded"></div>
    //             </td>
    //             <td className="px-4 py-2">
    //               <div className="flex items-center">
    //                 <div className="h-4 w-32 bg-gray-700 rounded"></div>
    //                 <div className="h-4 w-4 bg-gray-700 rounded-full ml-2"></div>
    //               </div>
    //             </td>
    //             <td className="px-4 py-2 text-right">
    //               <div className="h-4 w-16 bg-gray-700 rounded ml-auto"></div>
    //             </td>
    //             <td className="px-4 py-2 text-right">
    //               <div className="h-4 w-24 bg-gray-700 rounded ml-auto"></div>
    //             </td>
    //           </tr>
    //         ))}
    //       </tbody>
    //     </table>
    //   </div>
    // </div>
  );
};

const GET_DATA = gql`
  query MyQuery {
    claimeds(orderBy: amount, orderDirection: desc, first: 10) {
      amount
      account
      blockTimestamp
      transactionHash
    }
  }
`;

const strategyNames: { [key: string]: string } = {
  "0x93c4b944d05dfe6df7645a86cd2206016c51564d": "stETH",
  "0x7ca911e83dabf90c90dd3de5411a10f1a6112184": "wBETH",
  "0xbeac0eeeeeeeeeeeeeeeeeeeeeeeeeeeeeebeac0": "BeaconChain",
  "0x57ba429517c3473b6d34ca9acd56c0e735b94c02": "osETH",
  "0x0fe4f44bee93503346a3ac9ee5a26b130a5796d6": "swETH",
  "0x1bee69b7dfffa4e2d53c2a2df135c388ad25dcd2": "rETH",
  "0x9d7ed45ee2e8fc5482fa2428f15c971e6369011d": "ETHx",
  "0x54945180db7943c0ed0fee7edab2bd24620256bc": "cbETH",
  "0x13760f50a9d7377e4f20cb8cf9e4c26586c658ff": "ankrETH",
  "0xa4c637e0f704745d182e4d38cab7e7485321d059": "oETH",
  "0xacb55c530acdb2849e6d4f36992cd8c9d50ed8f7": "Eigen",
  "0x298afb19a105d59e74658c4c334ff360bade6dd2": "mETH",
  "0x8ca7a5d6f3acd3a7a8bc468a8cd0fb14b6bd28b6": "sfrxETH",
  "0xae60d8180437b5c34bb956822ac2710972584473": "LST ETH",
};

Chart.register(ArcElement, Title);

function Analytics() {
  const [totalOperators, setTotalOperators] = useState(0);
  const [totalAVSs, setTotalAVSs] = useState(0);
  const [totalTVL, setTotalTVL] = useState(0);
  const [totalStakers, setTotalStakers] = useState(0);
  const [totalRestaking, setTotalRestaking] = useState(0);
  const [avsOperators, setAVSOperators] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(10);
  const [total, setTotal] = useState(0);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [airDrop, setAirDrop] = useState();
  const { address, isConnected } = useAccount();
  const [restakeTVL, setRestakeTVL] = useState<TVLData>({ "Native ETH": 0 });


  const { loading, error, data } = useQuery(GET_DATA, {
    context: {
      subgraph: "airdrop", // Specify which subgraph to use
    },
  });

  useEffect(() => {
    if (data) {
      console.log(data.claimeds);
      setAirDrop(data.claimeds);
    }
  }, [data]);

  const [isLoading, setIsLoading] = useState(true);

  const [sortedOperatorsData, setSortedOperatorsData] = useState<
    [string, number][]
  >([]);
  const [tvlPercentageData, setTVLPercentageData] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    if (Object.keys(restakeTVL).length > 0 && totalRestaking > 0) {
      const percentages = Object.entries(restakeTVL).reduce<
        Record<string, number>
      >((acc, [key, value]) => {
        if (typeof value === "number") {
          const percentage = (value / totalRestaking) * 100;
          acc[key] = parseFloat(percentage.toFixed(2));
        }
        return acc;
      }, {});
      setTVLPercentageData(percentages);
    }
  }, [restakeTVL, totalRestaking]);

  useEffect(() => {
    if (avsOperators.length > 0) {
      const sortedData = avsOperators
        .filter(({ operatorsCount }) => operatorsCount !== 0)
        .map(
          ({ name, operatorsCount }) =>
            [name, operatorsCount] as [string, number]
        )
        .sort((a, b) => b[1] - a[1]);
      setSortedOperatorsData(sortedData);
    }
  }, [avsOperators]);

  useEffect(() => {
    const fetchData = async () => {
      if (isDataFetched) return; // Data has already been fetched, exit the function

      const options = { method: "GET" };
      try {
        const totalTVLRes = await fetch(
          "https://api.eigenexplorer.com/metrics/tvl",
          options
        );
        const restakeRes = await fetch(
          "https://api.eigenexplorer.com/metrics/tvl/restaking",
          options
        );
        const avsOperatorsRes = await fetch("/api/get-avs-operators");
        const metricsRes = await fetch(
          "https://api.eigenexplorer.com/metrics",
          options
        );

        const metricsData = await metricsRes.json();
        const restakeTVL = await restakeRes.json();
        const avsOperators = await avsOperatorsRes.json();

        setTotalTVL(metricsData.tvl);
        setTotalOperators(metricsData.totalOperators);
        setTotalAVSs(metricsData.totalAvs);
        setTotalStakers(metricsData.totalStakers);
        setTotalRestaking(metricsData.tvlRestaking);
        const updatedRestakeTVL: TVLData = {
          ...restakeTVL.tvlStrategies,
          "Native ETH": metricsData.tvlBeaconChain
        };
        setRestakeTVL(updatedRestakeTVL);
        setAVSOperators(avsOperators);
        setIsDataFetched(true); // Set the flag to true after fetching data
        setIsPageLoading(false);

      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [skip, take]);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const withdrawlsRes = await fetch(
        `https://api.eigenexplorer.com/withdrawals?skip=${skip}&take=${take}`,
        options
      );
      const withdrawlsData = await withdrawlsRes.json();
      console.log(withdrawlsData);
      setWithdrawals(withdrawlsData.data);
      setTotal(withdrawlsData.meta.total);
      setIsPageLoading(false);
    };

    fetchWithdrawals();
  }, [skip, take]);

  const handlePageChange = (page: number) => {
    setSkip((page - 1) * take);
  };

  const weiToEth = (value: string) => {
    return parseFloat(formatEther(value));
  };

  const totalPages = Math.ceil(total / take);

  // Create labels and data arrays
  // const labels = filteredData.map(([key, value]) => key);
  // const dataValues = filteredData.map(([key, value]) => value);

  type FilteredData = [string, number];
  // const filteredData: FilteredData[] = Object.entries(restakeTVL)
  // .filter((entry): entry is [string, number] =>
  //   typeof entry[1] === 'number' && entry[1] !== 0 && entry[0] !== "Eigen"
  // )
  // .map(([key, value]): FilteredData => [key, value])
  // .sort((a, b) => b[1] - a[1]);

  const filteredData: [string, number, number][] = Object.entries(restakeTVL)
    .filter(
      (entry): entry is [string, number] =>
        typeof entry[1] === "number" && entry[1] !== 0 && entry[0] !== "Eigen"
    )
    .map(([key, value]): [string, number, number] => [
      key,
      value,
      tvlPercentageData[key] || 0,
    ])
    .sort((a, b) => b[1] - a[1]);
  const totalTVLWithNative = totalRestaking + (restakeTVL["Native ETH"] || 0);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [operatorsHoveredIndex, setOperatorsHoveredIndex] = useState<
    number | null
  >(null);

  console.log(avsOperators);

  const filteredOperatorsData = avsOperators
    .filter(({ operatorsCount }) => operatorsCount !== 0)
    .map(({ name, operatorsCount }) => [name, operatorsCount as number]);

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

  const operatorsChartData = {
    labels: sortedOperatorsData.map(([label]) => label),
    datasets: [
      {
        data: sortedOperatorsData.map(([_, value]) => value),
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

  const tvlChartOptions = {
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

  const operatorsChartOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    onHover: (event: any, chartElement: any) => {
      if (chartElement.length > 0) {
        setOperatorsHoveredIndex(chartElement[0].index);
      } else {
        setOperatorsHoveredIndex(null);
      }
    },
  };

  const [searchQuery, setSearchQuery] = useState("");



  const handleWithdrawalAddress = async () => {
    if (address) {
      setSearchQuery(address);
    }

    try {
      const res = await fetch(`/api/search-withdrawal-data?address=${address}`);
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      const data = await res.json();
      console.log("dataaaaaaaaa", data);
      setWithdrawals(data);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleSearchChange = async (query: string) => {
    // console.log("query: ", query.length);
    // console.log("queryyyyyyyy",query)
    setSearchQuery(query);

    if (query.length > 0) {
      // console.log("Delegate data: ", query, delegateData);
      // console.log(delegateData);

      try {
        const res = await fetch(`/api/search-withdrawal-data?address=${query}`);
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        const data = await res.json();
        console.log("dataaaaaaaaa", data);
        setWithdrawals(data);
      } catch (error) {
        console.error("Search error:", error);
      }
    } else {
      // console.log("in else");
      console.log("data not comingggggg");
      // setDelegateData({ ...delegateData, delegates: tempData.delegates });
    }
  };

  interface AnalyticsSummaryProps {
    totalTVL: number;
    totalOperators: number;
    totalAVSs: number;
    totalStakers: number;
    totalRestaking: number;
  }

  const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({
    totalTVL,
    totalOperators,
    totalAVSs,
    totalStakers,
    totalRestaking,
  }) => {
    return (
      <div className="flex bg-[#1F2937] text-white rounded-lg shadow-sm overflow-hidden">
        <SummaryItem label="TVL(ETH)" value={totalTVL} isFirst={true} />
        <SummaryItem label="Total Operators" value={totalOperators} />
        <SummaryItem label="Total AVSs" value={totalAVSs} />
        <SummaryItem label="Total Stakers" value={totalStakers} />
        <SummaryItem
          label="TVL Restaking(ETH)"
          value={totalRestaking}
          isLast={true}
        />
      </div>
    );
  };

  interface SummaryItemProps {
    label: string;
    value: number;
    isFirst?: boolean;
    isLast?: boolean;
  }

  const SummaryItem: React.FC<SummaryItemProps> = ({
    label,
    value,
    isFirst = false,
    isLast = false,
  }) => {
    return (
      <div
        className={`flex-1 p-4 ${!isLast ? "border-r border-gray-200" : ""} ${isFirst ? "pl-6" : ""
          } ${isLast ? "pr-6" : ""}`}
      >
        <div className="text-sm text-white">{label}</div>
        <div className="font-bold text-lg text-white">
          {parseFloat(value.toFixed(2)).toLocaleString()}
        </div>
      </div>

      // <div
      //   className={`flex-1 p-4 animate-pulse ${
      //     !isLast ? "border-r border-gray-200" : ""
      //   } ${isFirst ? "pl-6" : ""} ${isLast ? "pr-6" : ""}`}
      // >
      //   <div className="h-4 w-16 bg-gray-300 rounded mb-2"></div>
      //   <div className="h-6 w-24 bg-gray-300 rounded"></div>
      // </div>
    );
  };

  if (loading) return <div className="flex items-center justify-center"></div>;
  if (error) {
    console.error("GraphQL Error:", error);
    return <p>Error: {error.message}</p>;
  }

  const handleCopy = (addr: any) => {
    copy(addr);
    toast("Address Copied 🎊");
  };

  return (
    <div className="p-20 -mt-20">
      {/* <h1 className="text-5xl text-center pb-7">Analytics</h1> */}
      {isPageLoading && (
        <div className="flex items-center justify-center pt-40">
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
      {!isPageLoading && (
        <div>
          <AnalyticsSummary
            totalTVL={totalTVL}
            totalOperators={totalOperators}
            totalAVSs={totalAVSs}
            totalStakers={totalStakers}
            totalRestaking={totalRestaking}
          />
          {airDrop && <Leaderboard data={airDrop} />}

          <div>
            {isLoading ? (
              <div className="w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden mx-auto px-4 mt-4">
                <div className="p-4">
                  <div className="flex justify-between items-center animate-pulse">
                    <Skeleton width={100} />
                    <Skeleton width={150} />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-x-40 animate-pulse">
                    <DataListSkeleton />
                    <PieChartSkeleton />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center mt-4">
                {filteredData.length > 0 ? (
                  <div className="w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden mx-auto px-4">
                    <h1 className="ml-2 mt-6 mb-1 text-2xl font-bold">
                      TVL Restaking Distribution
                    </h1>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Total</h2>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {(totalRestaking + restakeTVL["Native ETH"]).toLocaleString(undefined, {
                              maximumFractionDigits: 2,
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
                            {filteredData.map(
                              ([label, value]: any, index: number | null) => (
                                <div
                                  key={label}
                                  className={`flex justify-between items-center rounded-md ${hoveredIndex === index ? "bg-gray-600" : ""
                                    }`}
                                >
                                  <div className="flex items-center">
                                    <div
                                      className="w-4 h-4 rounded-full mr-1"
                                      style={{
                                        backgroundColor:
                                          chartData.datasets[0].backgroundColor[
                                          index
                                            ? index
                                            : 0 %
                                            chartData.datasets[0]
                                              .backgroundColor.length
                                          ],
                                      }}
                                    ></div>
                                    <span>{label}</span>
                                  </div>
                                  {/* Add a flex container with justification and gap for spacing */}
                                  <div className="flex justify-end items-center gap-4">
                                    {" "}
                                    {/* Increased gap from 4 to 6 */}
                                    {/* Add min-width to create consistent column widths */}
                                    <span className="font-semibold min-w-[100px] text-right">
                                      {value.toLocaleString(undefined, {
                                        maximumFractionDigits: 2,
                                      })}
                                    </span>
                                    {/* Add min-width to percentage column as well */}
                                    <span className="font-semibold min-w-[60px] text-right">
                                      {((value / totalTVLWithNative) * 100).toFixed(
                                        2
                                      )}
                                      %
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                        <div className="w-full md:w-1/2 flex items-center justify-center mt-6 md:mt-0">
                          <div style={{ width: "300px", height: "300px" }}>
                            <Pie data={chartData} options={tvlChartOptions} />
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

          {/* Operators Distribution */}
          <div>
            {isLoading ? (
              <div className="w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden mx-auto px-4 mt-4">
                <div className="p-4">
                  <div className="flex justify-between items-center animate-pulse">
                    <Skeleton width={100} />
                    <Skeleton width={150} />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-x-40 animate-pulse">
                    <DataListSkeleton />
                    <PieChartSkeleton />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center mt-4">
                {sortedOperatorsData.length > 0 ? (
                  <div className="w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden mx-auto px-4">
                    <h1 className="ml-2 mt-6 mb-1 text-2xl font-bold">
                      Operator Distribution
                    </h1>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Total</h2>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {totalOperators} Operators
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row gap-x-10">
                        <div className="w-full md:w-3/5">
                          <div className="space-y-2">
                            {sortedOperatorsData.map(([label, value], index) => (
                              <div
                                key={label}
                                className={`flex items-center rounded-md ${operatorsHoveredIndex === index ? "bg-gray-600" : ""
                                  }`}
                              >
                                <div className="flex items-center flex-grow min-w-0 mr-4">
                                  <div
                                    className="w-4 h-4 rounded-full mr-2 flex-shrink-0"
                                    style={{
                                      backgroundColor:
                                        operatorsChartData.datasets[0].backgroundColor[
                                        index % operatorsChartData.datasets[0].backgroundColor.length
                                        ],
                                    }}
                                  ></div>
                                  <span className="truncate" title={label}>
                                    {label}
                                  </span>
                                </div>
                                <div className="flex justify-end items-center gap-4 flex-shrink-0">
                                  <span className="font-semibold text-right w-20">
                                    {value.toLocaleString(undefined, {
                                      maximumFractionDigits: 0,
                                    })}
                                  </span>
                                  <span className="font-semibold text-right w-20">
                                    {((value / totalOperators) * 100).toFixed(2)}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="w-full md:w-2/5 flex items-center justify-center mt-6 md:mt-0">
                          <div style={{ width: "300px", height: "300px" }}>
                            <Pie
                              data={operatorsChartData}
                              options={operatorsChartOptions}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>No Operators</p>
                )}
              </div>
            )}
          </div>

          <div className="">
            <h1 className="ml-3 mt-10 text-2xl font-semibold">
              All Withdrawals
            </h1>

            <div className="flex items-center">
              <div className="searchBox my-3">
                <input
                  className="searchInput"
                  type="text"
                  name=""
                  placeholder="Search by Address"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                <button className="searchButton">
                  <IoSearchSharp className="iconExplore" />
                </button>
              </div>
              <button
                onClick={handleWithdrawalAddress}
                className="border border-white rounded-lg px-2 justify-center ml-5 py-2"
              >
                Get All My Withdrawals
              </button>
            </div>

            <div className="mx-auto py-3 overflow-x-auto">
              <table className="w-full border-collapse text-center text-white rounded-md">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="py-2 px-4 border border-gray-700">Block</th>
                    <th className="py-2 px-4 border border-gray-700">Staker</th>
                    <th className="py-2 px-4 border border-gray-700">
                      Is Completed ?
                    </th>
                    <th className="py-2 px-4 border border-gray-700">
                      Delegated To
                    </th>
                    <th className="py-2 px-4 border border-gray-700">
                      Shares(ETH)
                    </th>
                    <th className="py-2 px-4 border border-gray-700">
                      Strategy
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((withdrawal, index) => (
                    <tr
                      key={index}
                      className="bg-gray-800 hover:bg-gray-900 transition-colors"
                    >
                      <td className="py-2 px-4 border border-gray-700 text-sm">
                        {withdrawal.createdAtBlock}
                      </td>
                      <td className="py-2 px-4 border border-gray-700 text-sm text-light-cyan">
                        <div className="flex items-center justify-center">
                          <span className="text-center">
                            {withdrawal.stakerAddress.slice(0, 6)}....
                            {withdrawal.stakerAddress.slice(-3)}
                          </span>
                          <span
                            className="ml-2 cursor-pointer text-center"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleCopy(withdrawal.stakerAddress);
                            }}
                            title="Copy"
                          >
                            <IoCopy size={14} color="#ffffff" />
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-4 border border-gray-700 text-sm">
                        {withdrawal.isCompleted ? "Yes" : "No"}
                      </td>
                      <td className="py-2 px-4 border border-gray-700 text-sm text-light-cyan">
                        <div className="flex items-center justify-center">
                          <span>
                            {withdrawal.delegatedTo.slice(0, 6)}....
                            {withdrawal.delegatedTo.slice(-3)}
                          </span>
                          <span
                            className="ml-2 cursor-pointer"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleCopy(withdrawal.delegatedTo);
                            }}
                            title="Copy"
                          >
                            <IoCopy size={14} color="#ffffff" />
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-4 border border-gray-700 text-sm">
                        {withdrawal.shares.map((share, index) => (
                          <div key={index}>{weiToEth(share.shares)}</div>
                        ))}
                      </td>
                      <td className="py-2 px-4 border border-gray-700">
                        {withdrawal.shares.map((share, index) => (
                          <div key={index}>
                            {strategyNames[share.strategyAddress] ||
                              share.strategyAddress}
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-center mt-4">
                <button
                  disabled={skip === 0}
                  onClick={() => handlePageChange(1)}
                  className="px-4 py-2 mr-2 bg-gray-700 text-gray-100 rounded hover:bg-medium-blue disabled:bg-gray-800 disabled:text-gray-500 transition-colors cursor-pointer"
                >
                  First
                </button>
                <button
                  disabled={skip === 0}
                  onClick={() => handlePageChange(skip / take)}
                  className={`px-4 py-2 mr-2 bg-gray-700 text-gray-100 rounded hover:bg-light-blue disabled:bg-gray-800 disabled:text-gray-500 transition-colors 
                    ${skip === 0 ? "cursor-pointer" : ""}`}
                >
                  Prev
                </button>
                <span className="px-4 py-2 mr-2 text-gray-300">
                  Page {skip / take + 1} of {totalPages}
                </span>
                <button
                  disabled={skip + take >= total}
                  onClick={() => handlePageChange(skip / take + 2)}
                  className="px-4 py-2 mr-2 bg-gray-700 text-gray-100 rounded hover:bg-light-blue disabled:bg-gray-800 disabled:text-gray-500 transition-colors"
                >
                  Next
                </button>
                <button
                  disabled={skip + take >= total}
                  onClick={() => handlePageChange(totalPages)}
                  className="px-4 py-2 bg-gray-700 text-gray-100 rounded hover:bg-light-blue disabled:bg-gray-800 disabled:text-gray-500 transition-colors"
                >
                  Last
                </button>
              </div>
            </div>

            {/* <div className="mx-auto py-3 overflow-x-auto animate-pulse">
              <table className="w-full border-collapse text-center text-white rounded-md">
                <thead>
                  <tr className="bg-gray-800">
                    {[
                      "Block",
                      "Staker",
                      "Is Completed ?",
                      "Delegated To",
                      "Shares(ETH)",
                      "Strategy",
                    ].map((header) => (
                      <th
                        key={header}
                        className="py-2 px-4 border border-gray-700"
                      >
                        <div className="h-4 bg-gray-700 rounded w-16 mx-auto"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(10)].map((_, index) => (
                    <tr key={index} className="bg-gray-900">
                      <td className="py-2 px-4 border border-gray-700 text-sm">
                        <div className="h-4 bg-gray-700 rounded w-16 mx-auto"></div>
                      </td>
                      <td className="py-2 px-4 border border-gray-700 text-sm text-light-cyan">
                        <div className="flex items-center justify-center">
                          <div className="h-4 bg-gray-700 rounded w-24"></div>
                          <div className="ml-2 h-4 w-4 bg-gray-700 rounded-full"></div>
                        </div>
                      </td>
                      <td className="py-2 px-4 border border-gray-700 text-sm">
                        <div className="h-4 bg-gray-700 rounded w-8 mx-auto"></div>
                      </td>
                      <td className="py-2 px-4 border border-gray-700 text-sm text-light-cyan">
                        <div className="flex items-center justify-center">
                          <div className="h-4 bg-gray-700 rounded w-24"></div>
                          <div className="ml-2 h-4 w-4 bg-gray-700 rounded-full"></div>
                        </div>
                      </td>
                      <td className="py-2 px-4 border border-gray-700 text-sm">
                        <div className="h-4 bg-gray-700 rounded w-16 mx-auto"></div>
                      </td>
                      <td className="py-2 px-4 border border-gray-700">
                        <div className="h-4 bg-gray-700 rounded w-20 mx-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-center mt-4">
                {["First", "Prev", "Page X of Y", "Next", "Last"].map(
                  (btn, index) => (
                    <div
                      key={index}
                      className={`px-4 py-2 ${
                        index !== 2 ? "mr-2" : ""
                      } bg-gray-700 text-gray-100 rounded`}
                    >
                      <div
                        className={`h-4 bg-gray-600 rounded ${
                          index === 2 ? "w-24" : "w-16"
                        }`}
                      ></div>
                    </div>
                  )
                )}
              </div>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
