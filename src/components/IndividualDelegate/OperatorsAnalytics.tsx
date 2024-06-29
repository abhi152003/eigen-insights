import React, { useMemo, useState } from "react";
import { ThreeCircles } from "react-loader-spinner";
import { Grid, CheckCircle, Clock, X } from "lucide-react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  Check,
  AlertTriangle,
  Wrench,
} from "lucide-react";

import { gql, useQuery } from '@apollo/client';

const GET_DATA = gql`
  query MyQuery {
  avss(where: {id: "0x870679e138bcdf293b7ff14dd44b70fc97e12fc0"}) {
    registrationsCount
    registrations(where: {}, orderBy: registeredTimestamp, orderDirection: asc) {
      status
      registeredTimestamp
      operator {
        id
        totalShares
      }
    }
  }
}
`;

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

interface OperatorData {
  __typename: string;
  status: number;
  registeredTimestamp: string;
  operator: {
    __typename: string;
    id: string;
    totalShares: string;
  };
}

interface ChartDataPoint {
  x: number;
  y: number;
}


function OperatorsAnalytics({ props }: { props: Type }) {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const { loading, error, data } = useQuery(GET_DATA);

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error("GraphQL Error:", error);
    return <p>Error: {error.message}</p>;
  }

  console.log("Data from GraphQL:", data.avss[0].registrations);


  const processedData = data.avss[0].registrations.map((item: { registeredTimestamp: string; operator: { totalShares: string; }; }) => ({
    timestamp: parseInt(item.registeredTimestamp),
    shares: parseFloat(item.operator.totalShares) / 1e18 // Convert Wei to ETH
  })).sort((a: { timestamp: number; }, b: { timestamp: number; }) => a.timestamp - b.timestamp);

  // Convert timestamps to days since the first timestamp
  const startDate = new Date(processedData[0].timestamp * 1000);
  const chartData: ChartDataPoint[] = processedData.map((item: { timestamp: number; shares: any; }) => ({
    x: Math.floor((new Date(item.timestamp * 1000).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
    y: item.shares
  }));

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Operator Shares Over Time',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Days Since First Registration'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Total Shares (ETH)'
        },
        ticks: {
          callback: function(value: number) {
            return value.toLocaleString();
          }
        }
      }
    }
  };

  const chartDataConfig = {
    datasets: [
      {
        label: 'Total Shares',
        data: chartData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  return (
    // <div className="flex justify-center">
    //   {/* {isPageLoading && (
    //     <div className="flex items-center justify-center pt-40">
    //       <ThreeCircles
    //         visible={true}
    //         height="50"
    //         width="50"
    //         color="#FFFFFF"
    //         ariaLabel="three-circles-loading"
    //         wrapperStyle={{}}
    //         wrapperClass=""
    //       />
    //     </div>
    //     )} */}

    //     <div className="inline-flex space-x-2 p-2 bg-gray-100 rounded-lg me-16">
    //       {statuses.map((status, index) => (
    //         <button>
    //           <StatusItem key={index} {...status} />
    //         </button>
    //       ))}
    //     </div>

    //     <div className="bg-white rounded-lg shadow-md p-6">
    //       <div className="flex space-x-4 mb-4">
    //         {newStatuses.map((status, index) => (
    //           <NewStatusItem key={index} {...status} />
    //         ))}
    //       </div>
    //       <div className="relative mb-4">
    //         <input
    //           type="text"
    //           placeholder="Search validator name or pool id..."
    //           className="w-full px-4 py-2 border border-gray-300 rounded-lg pl-10"
    //           value={searchTerm}
    //           onChange={(e) => setSearchTerm(e.target.value)}
    //         />
    //         <Search
    //           className="absolute left-3 top-2.5 text-gray-400"
    //           size={20}
    //         />
    //       </div>
    //       <table className="w-full">
    //         <thead>
    //           <tr className="bg-gray-50 text-left">
    //             <th className="py-2 px-4">Validator</th>
    //             <th className="py-2 px-4">Commission</th>
    //             <th className="py-2 px-4">APY</th>
    //             <th className="py-2 px-4">Block Performance</th>
    //             <th className="py-2 px-4">Chunk Performance</th>
    //             <th className="py-2 px-4">Pool Size</th>
    //             <th className="py-2 px-4">Size Change</th>
    //             <th className="py-2 px-4">Users</th>
    //             <th className="py-2 px-4">Stake Ratio</th>
    //             <th className="py-2 px-4">Warnings</th>
    //             <th className="py-2 px-4">Status</th>
    //           </tr>
    //         </thead>
    //         <tbody>
    //           {validators.map((validator, index) => (
    //             <ValidatorItem key={index} {...validator} />
    //           ))}
    //         </tbody>
    //       </table>
    //     </div>
    // </div>
    <div className="flex justify-center w-full">
      {/* <div className="flex flex-col items-center space-y-6 w-full max-w-7xl px-4">
        <div className="inline-flex space-x-2 p-2 bg-gray-100 rounded-lg me-20">
          {newstatuses.map((status, index) => (
              <StatusItem {...status} key={index} />
          ))}
        </div>

        <div className="bg-white text-black rounded-lg shadow-md p-6 w-full overflow-hidden me-16">
          <div className="flex space-x-4 mb-4 overflow-x-auto">
            {newStatuses.map((status, index) => (
              <button key={index} onClick={() => setActiveFilter(status.label)}>
                <NewStatusItem icon={undefined} key={index} {...status} />
              </button>
            ))}
          </div>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search validator name or pool id..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg pl-10 text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-black">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="py-2 px-4 whitespace-nowrap">Validator</th>
                  <th className="py-2 px-4 whitespace-nowrap">Commission</th>
                  <th className="py-2 px-4 whitespace-nowrap">APY</th>
                  <th className="py-2 px-4 whitespace-nowrap">Block Performance</th>
                  <th className="py-2 px-4 whitespace-nowrap">Chunk Performance</th>
                  <th className="py-2 px-4 whitespace-nowrap">Pool Size</th>
                  <th className="py-2 px-4 whitespace-nowrap">Size Change</th>
                  <th className="py-2 px-4 whitespace-nowrap">Users</th>
                  <th className="py-2 px-4 whitespace-nowrap">Stake Ratio</th>
                  <th className="py-2 px-4 whitespace-nowrap">Warnings</th>
                  <th className="py-2 px-4 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredValidators.map((validator, index) => (
                  <ValidatorItem key={index} {...validator} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div> */}
      <div style={{ width: '100%', height: '400px' }}>
        {/* <Line options={chartOptions} data={chartDataConfig} /> */}
      </div>
    </div>
  );
}

export default OperatorsAnalytics;
