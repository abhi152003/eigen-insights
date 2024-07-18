"use client";
import React, { useEffect, useState } from "react";
// import { Bar, Pie, Doughnut } from 'react-chartjs-2';
// import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

import { Doughnut, Pie } from "react-chartjs-2";
import { Chart, ArcElement, Title, Tooltip } from "chart.js";
import { formatEther } from "ethers";
import { Oval, ThreeCircles } from "react-loader-spinner";
import "../../app/globals.css";
import { IoSearchSharp } from "react-icons/io5";
import { useAccount } from "wagmi";

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

Chart.register(ArcElement, Title, Tooltip);

function Analytics() {
  const [totalOperators, setTotalOperators] = useState(0);
  const [totalAVSs, setTotalAVSs] = useState(0);
  const [totalTVL, setTotalTVL] = useState(0);
  const [totalStakers, setTotalStakers] = useState(0);
  const [totalRestaking, setTotalRestaking] = useState(0);
  const [restakeTVL, setRestakeTVL] = useState({});
  const [avsOperators, setAVSOperators] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(10);
  const [total, setTotal] = useState(0);
  const [isPageLoading, setIsPageLoading] = useState(true);

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
        setRestakeTVL(restakeTVL.tvlStrategies);
        setAVSOperators(avsOperators);
        setIsDataFetched(true); // Set the flag to true after fetching data
        setIsPageLoading(false);
      } catch (error) {
        console.log(error);
      }
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

  // // Create labels and data arrays
  // const labels = filteredData.map(([key, value]) => key);
  // const dataValues = filteredData.map(([key, value]) => value);
  const filteredData = Object.entries(restakeTVL)
    .filter(([key, value]) => value !== 0 && key !== "Eigen")
    .map(([key, value]) => [key, value as number]);

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
    labels: filteredOperatorsData.map(([label]) => label),
    datasets: [
      {
        data: filteredOperatorsData.map(([_, value]) => value),
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
  
  const { address } = useAccount();
  
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

  // Define the data for the Pie chart
  // const restakeData = {
  //   labels: labels,
  //   datasets: [
  //     {
  //       label: "TVL Strategies",
  //       data: dataValues,
  //       backgroundColor: [
  //         "rgba(255, 99, 132, 0.8)", // Bright pink
  //         "rgba(54, 162, 235, 0.8)", // Bright blue
  //         "rgba(255, 206, 86, 0.8)", // Bright yellow
  //         "rgba(75, 192, 192, 0.8)", // Bright teal
  //         "rgba(153, 102, 255, 0.8)", // Bright purple
  //         "rgba(255, 159, 64, 0.8)", // Bright orange
  //         "rgba(46, 204, 113, 0.8)", // Bright green
  //         "rgba(52, 152, 219, 0.8)", // Another blue shade
  //         "rgba(155, 89, 182, 0.8)", // Another purple shade
  //         "rgba(241, 196, 15, 0.8)", // Another yellow shade
  //         "rgba(231, 76, 60, 0.8)", // Bright red
  //         "rgba(26, 188, 156, 0.8)", // Another teal shade
  //       ],
  //       borderColor: [
  //         "rgba(255, 99, 132, 1)",
  //         "rgba(54, 162, 235, 1)",
  //         "rgba(255, 206, 86, 1)",
  //         "rgba(75, 192, 192, 1)",
  //         "rgba(153, 102, 255, 1)",
  //         "rgba(255, 159, 64, 1)",
  //         "rgba(46, 204, 113, 1)",
  //         "rgba(52, 152, 219, 1)",
  //         "rgba(155, 89, 182, 1)",
  //         "rgba(241, 196, 15, 1)",
  //         "rgba(231, 76, 60, 1)",
  //         "rgba(26, 188, 156, 1)",
  //       ],
  //       borderWidth: 2,
  //     },
  //   ],
  // };

  // const avsOperatorsData = {
  //   labels: avsOperators.map(({ name }) => name),
  //   datasets: [
  //     {
  //       data: avsOperators.map(({ operatorsCount }) => operatorsCount),
  //       backgroundColor: [
  //         "rgba(255, 99, 132, 0.8)",
  //         "rgba(54, 162, 235, 0.8)",
  //         "rgba(255, 206, 86, 0.8)",
  //         "rgba(75, 192, 192, 0.8)",
  //         "rgba(153, 102, 255, 0.8)",
  //         "rgba(255, 159, 64, 0.8)",
  //         "rgba(46, 204, 113, 0.8)",
  //         "rgba(52, 152, 219, 0.8)",
  //         "rgba(155, 89, 182, 0.8)",
  //         "rgba(241, 196, 15, 0.8)",
  //         "rgba(231, 76, 60, 0.8)",
  //         "rgba(26, 188, 156, 0.8)",
  //       ],
  //       borderColor: [
  //         "rgba(255, 99, 132, 1)",
  //         "rgba(54, 162, 235, 1)",
  //         "rgba(255, 206, 86, 1)",
  //         "rgba(75, 192, 192, 1)",
  //         "rgba(153, 102, 255, 1)",
  //         "rgba(255, 159, 64, 1)",
  //         "rgba(46, 204, 113, 1)",
  //         "rgba(52, 152, 219, 1)",
  //         "rgba(155, 89, 182, 1)",
  //         "rgba(241, 196, 15, 1)",
  //         "rgba(231, 76, 60, 1)",
  //         "rgba(26, 188, 156, 1)",
  //       ],
  //       borderWidth: 2,
  //     },
  //   ],
  // };

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
      <div className="flex bg-white text-black rounded-lg shadow-sm overflow-hidden">
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
        className={`flex-1 p-4 ${!isLast ? "border-r border-gray-200" : ""} ${
          isFirst ? "pl-6" : ""
        } ${isLast ? "pr-6" : ""}`}
      >
        <div className="text-sm text-gray-600">{label}</div>
        <div className="font-bold text-lg text-black">
          {parseFloat(value.toFixed(2)).toLocaleString()}
        </div>
      </div>
    );
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
          {/* <div className='flex items-center justify-center mt-7'>
            <div className='flex gap-x-40 text-center'>
              <div className='w-96 h-96'>
                  <h1 className='pt-5 pb-5'>Operators Distribution in AVSs</h1>
                  <Doughnut data={avsOperatorsData} options={{cutout: '95%'}}  />
              </div>
              <div className='w-96 h-96'>
                  <h1 className='pt-5 pb-5'>Restaking TVL Distribution</h1>
                  <Doughnut data={restakeData} options={{cutout: '95%'}} />
              </div>
            </div>
          </div> */}

          <div>
            <h1 className="mt-7 text-[2.25rem] font-semibold	">
              TVL Restaking Distribution
            </h1>
            <div className="flex justify-center mt-5">
              {filteredData.length > 0 ? (
                <div className="w-full max-w-full md:max-w-5xl bg-gray-800 rounded-lg shadow-lg overflow-hidden mx-auto px-4">
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold">Total</h2>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {totalRestaking.toLocaleString(undefined, {
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
                                          chartData.datasets[0].backgroundColor
                                            .length
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
                          <Pie data={chartData} options={tvlChartOptions} />
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

          <div>
            <h1 className="mt-7 text-[2.25rem]  font-semibold	">
              Operators Distribution
            </h1>
            <div className="flex justify-center mt-5">
              {filteredOperatorsData.length > 0 ? (
                <div className="w-full max-w-full md:max-w-5xl bg-gray-800 rounded-lg shadow-lg overflow-hidden mx-auto px-4">
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
                    <div className="flex flex-col md:flex-row gap-x-40">
                      <div className="w-full md:w-1/2 pr-10">
                        <div className="space-y-2">
                          {filteredOperatorsData.map(
                            ([label, value], index) => (
                              <div
                                key={label}
                                className={`flex justify-between items-center rounded-md ${
                                  operatorsHoveredIndex === index
                                    ? "bg-gray-600"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center">
                                  <div
                                    className="w-4 h-4 rounded-full mr-1"
                                    style={{
                                      backgroundColor:
                                        chartData.datasets[0].backgroundColor[
                                          index %
                                            chartData.datasets[0]
                                              .backgroundColor.length
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
                            )
                          )}
                        </div>
                      </div>
                      <div className="w-full md:w-1/2 flex items-center justify-center mt-6 md:mt-0">
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
          </div>

          <div className="mt-10">
            <h1 className="mt-10 text-[1.25rem] font-semibold	">
              All Withdrawals
            </h1>

            <div className="flex">
              <div className="searchBox searchShineWidthOfAVSs mb-5 mt-5">
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
                className="border border-white rounded-lg h-8 px-2 justify-center mt-6 ml-10"
              >
                Get All My Withdrawals
              </button>
            </div>

            <div className="mx-auto py-8 overflow-x-auto">
              <table className="w-full border-collapse text-center text-white rounded-md">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="py-2 px-4 border border-gray-700">Block</th>
                    <th className="py-2 px-4 border border-gray-700">Staker</th>
                    <th className="py-2 px-4 border border-gray-700">
                      Is Completed?
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
                      className="bg-gray-900 hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-2 px-4 border border-gray-700 text-sm">
                        {withdrawal.createdAtBlock}
                      </td>
                      <td className="py-2 px-4 border border-gray-700 text-sm">
                        {withdrawal.stakerAddress}
                      </td>
                      <td className="py-2 px-4 border border-gray-700 text-sm">
                        {withdrawal.isCompleted ? "Yes" : "No"}
                      </td>
                      <td className="py-2 px-4 border border-gray-700 text-sm">
                        {withdrawal.delegatedTo}
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
                  className="px-4 py-2 mr-2 bg-gray-700 text-gray-100 rounded hover:bg-medium-blue disabled:bg-gray-800 disabled:text-gray-500 transition-colors"
                >
                  First
                </button>
                <button
                  disabled={skip === 0}
                  onClick={() => handlePageChange(skip / take)}
                  className="px-4 py-2 mr-2 bg-gray-700 text-gray-100 rounded hover:bg-light-blue disabled:bg-gray-800 disabled:text-gray-500 transition-colors"
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
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
