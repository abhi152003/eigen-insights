// import { useRouter } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import React, { ChangeEvent, useState, useEffect } from "react";
import {
  InfinitySpin,
  Oval,
  RotatingLines,
  ThreeCircles,
} from "react-loader-spinner";
import { useAccount } from "wagmi";
import { useNetwork } from "wagmi";
import EILogo from "@/assets/images/daos/eigen_logo.png";
import Image from "next/image";
import { gql, useQuery } from "@apollo/client";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";

// Register ChartJS modules
ChartJS.register(Title, Tooltip, Legend, ArcElement);

interface userInfoProps {
  description: string;
  onSaveButtonClick: (description?: string) => Promise<void>;
  isLoading: boolean;
  descAvailable: boolean;
  isDelegate: boolean;
  isSelfDelegate: boolean;
  daoName: string;
  operatorData: any;
  restakedData: any;
}

const GET_DATA = gql`
  query MyQuery($stakerId: String!) {
    staker(id: $stakerId) {
      id
      stakesCount
      totalEigenShares
      totalShares
      totalEigenWithdrawalsShares
      totalWithdrawalsShares
      withdrawalsCount
      stakes {
        strategy {
          tokenSymbol
        }
        shares
      }
    }
  }
`;

function UserInfo({
  description,
  onSaveButtonClick,
  isLoading,
  descAvailable,
  isDelegate,
  isSelfDelegate,
  daoName,
  operatorData,
  restakedData,
}: userInfoProps) {
  // const { address } = useAccount();
  const address = "0x176f3dab24a159341c0509bb36b833e7fdd0a132";
  // const address = "0x5e349eca2dc61abcd9dd99ce94d04136151a09ee";
  // const [description, setDescription] = useState(
  //   "Type your description here..."
  // );
  const [isEditing, setEditing] = useState(false);
  const [tempDesc, setTempDesc] = useState("");
  const [desc, setDesc] = useState<string>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  console.log("restaked", restakedData);
  console.log("restaked length", restakedData?.deposits.length);
  const restakedPoints = calculateRestakedPoints(restakedData);
  console.log("Total restaked points:", restakedPoints);

  const {
    loading: queryLoading,
    error,
    data,
  } = useQuery(GET_DATA, {
    variables: { stakerId: address.toLowerCase() },
    context: {
      subgraph: "avs", // Specify which subgraph to use
    },
  });

  const handleDescChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setTempDesc(event.target.value);
    console.log("Temp Desc", event.target.value);
  };

  const handleSaveClick = async () => {
    setLoading(true);
    console.log("Desc", tempDesc);
    await onSaveButtonClick(tempDesc);
    setEditing(false);
    setLoading(false);
  };

  interface Token {
    symbol: string;
  }

  interface Transaction {
    amount: string;
    timestamp: string;
    token: Token;
  }

  interface StakerData {
    deposits: Transaction[];
    withdraws: Transaction[];
  }

  function calculateRestakedPoints(stakerData: StakerData): number {
    const currentTimestamp = Math.floor(Date.now() / 1000); // Current Unix timestamp
    let totalPoints = 0;

    // Create a map to store deposits by token symbol
    const depositMap: { [key: string]: Transaction[] } = {};

    // Process deposits
    stakerData?.deposits.forEach((deposit) => {
      // Exclude EIGEN token deposits
      if (deposit.token.symbol !== "EIGEN") {
        if (!depositMap[deposit.token.symbol]) {
          depositMap[deposit.token.symbol] = [];
        }
        depositMap[deposit.token.symbol].push(deposit);
      }
    });

    // Process withdrawals and calculate points
    stakerData?.withdraws.forEach((withdraw) => {
      // Exclude EIGEN token withdrawals
      if (withdraw.token.symbol !== "EIGEN") {
        const deposits = depositMap[withdraw.token.symbol];
        if (deposits && deposits.length > 0) {
          let remainingWithdrawAmount = parseFloat(withdraw.amount);
          const withdrawTimestamp = parseInt(withdraw.timestamp);

          while (remainingWithdrawAmount > 0 && deposits.length > 0) {
            const deposit = deposits[0];
            const depositAmount = parseFloat(deposit.amount);
            const startTime = parseInt(deposit.timestamp);
            const duration = (withdrawTimestamp - startTime) / 3600; // Duration in hours

            if (depositAmount <= remainingWithdrawAmount) {
              // Full deposit is withdrawn
              const points = (depositAmount / 1e18) * duration;
              totalPoints += points;
              remainingWithdrawAmount -= depositAmount;
              deposits.shift(); // Remove this deposit as it's fully processed
            } else {
              // Partial deposit is withdrawn
              const withdrawnAmount = remainingWithdrawAmount;
              const points = (withdrawnAmount / 1e18) * duration;
              totalPoints += points;
              deposit.amount = (
                depositAmount - remainingWithdrawAmount
              ).toString();
              remainingWithdrawAmount = 0;
            }
          }
        }
      }
    });

    // Process remaining deposits (those without withdrawals)
    Object.values(depositMap).forEach((deposits) => {
      deposits.forEach((deposit) => {
        const startTime = parseInt(deposit.timestamp);
        const duration = (currentTimestamp - startTime) / 3600; // Duration in hours
        const amount = parseFloat(deposit.amount) / 1e18; // Convert from Wei to ETH
        console.log(duration, amount);
        // Calculate points for this stake
        const points = amount * duration;
        totalPoints += points;
      });
    });

    return totalPoints;
  }

  if (queryLoading)
    return (
      <div className="flex items-center justify-center">
        <ThreeCircles
          visible={true}
          height="50"
          width="50"
          color="#FFFFFF"
          ariaLabel="three-circles-loading"
          wrapperStyle={{}}
        />
      </div>
    );
  if (error) {
    console.error("GraphQL Error:", error);
    return <p>Error: {error.message}</p>;
  }

  if (data) {
    console.log("dataaaa", data.staker);
  }

  const processData = (data: { staker: { totalShares: string; totalEigenShares: string; stakes: any[]; }; }) => {
    if (!data || !data.staker) return [];

    const totalShares = parseFloat(data.staker.totalShares) / 1e18;
    const totalEigenShares = parseFloat(data.staker.totalEigenShares) / 1e18;

    return data.staker.stakes
      .filter(stake => stake.strategy.tokenSymbol !== 'bEIGEN') // Exclude Eigen
      .map(stake => {
        const tokenSymbol = stake.strategy.tokenSymbol;
        const shares = parseFloat(stake.shares) / 1e18;
        
        return [tokenSymbol, shares];
      });
  };

  const stakedData = processData(data);
  const totalStaked = stakedData.reduce((sum, [_, value]) => sum + value, 0);

  const chartData = {
    labels: stakedData.map(([label, _]) => label),
    datasets: [
      {
        data: stakedData.map(([_, value]) => value),
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
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { display: false },
    },
    onHover: (_event: any, chartElement: { index: any }[]) => {
      setHoveredIndex(chartElement[0]?.index ?? null);
    },
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-3 py-1 min-h-10 justify-center">
        <div className="text-white w-[200px] flex flex-col gap-[10px] items-center border-[0.5px] border-[#D9D9D9] rounded-xl p-4 tvlDiv">
          <Image
            src={EILogo}
            alt="EigenLayer Logo"
            width={60}
            height={60}
            style={{ width: "53px", height: "53px" }}
            className="rounded-full"
          />
          <div className="text-light-cyan font-semibold">
            {(data?.staker?.totalShares / 1e18).toFixed(2)}
          </div>
          <div>Total ETH Restaked</div>
        </div>
        <div className="text-white w-[200px] flex flex-col gap-[10px] items-center border-[0.5px] border-[#D9D9D9] rounded-xl p-4 tvlDiv">
          <Image
            src={EILogo}
            alt="EigenLayer Logo"
            width={60}
            height={60}
            style={{ width: "53px", height: "53px" }}
            className="rounded-full"
          />
          <div className="text-light-cyan font-semibold">
            {(data?.staker?.totalEigenShares / 1e18).toFixed(2)}
          </div>
          <div>Total EIGEN Restaked</div>
        </div>
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
            {restakedPoints?.toFixed(2)}
          </div>
          <div>Restaked Points</div>
        </div>
      </div>

      <div className="flex justify-center mt-5 pe-16 w-full">
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden px-4 w-full">
          <div className="p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Total</h2>
              <p className="text-2xl font-bold">
                {totalStaked?.toLocaleString(undefined, {
                  maximumFractionDigits: 3,
                })}{" "}
                ETH
              </p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-x-40">
              <div className="w-full md:w-1/2 pr-10">
                <div className="space-y-2">
                  {stakedData?.map(([label, value], index) => (
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
                              chartData.datasets[0].backgroundColor[index],
                          }}
                        />
                        <span>{label}</span>
                      </div>
                      <div className="flex justify-end items-center gap-6 flex-1">
                        <div className="min-w-[80px] text-right font-semibold">
                          {value.toFixed(2)}
                        </div>
                        <div className="min-w-[60px] text-right font-semibold">
                          {((value / totalStaked) * 100).toFixed(2)}%
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
      </div>
    </div>
  );
}

export default UserInfo;
