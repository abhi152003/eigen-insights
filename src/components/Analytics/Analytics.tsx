'use client'
import React, { useEffect, useState } from 'react'
// import { Bar, Pie, Doughnut } from 'react-chartjs-2';
// import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Title, Tooltip} from 'chart.js';
import { formatEther } from 'ethers';
import { Oval } from 'react-loader-spinner';
import '../../app/globals.css'

interface Share {
  strategyAddress: string;
  shares: string}

interface Withdrawal {
  createdAtBlock: number;
  delegatedTo: string;
  isCompleted: boolean;
  stakerAddress: string;
  shares: Share[];
}

const strategyNames: { [key: string]: string } = {
  "0x93c4b944d05dfe6df7645a86cd2206016c51564d" : "stETH",
  "0x7ca911e83dabf90c90dd3de5411a10f1a6112184" : "wBETH",
  "0xbeac0eeeeeeeeeeeeeeeeeeeeeeeeeeeeeebeac0" : "BeaconChain",
  "0x57ba429517c3473b6d34ca9acd56c0e735b94c02" : "osETH",
  "0x0fe4f44bee93503346a3ac9ee5a26b130a5796d6" : "swETH",
  "0x1bee69b7dfffa4e2d53c2a2df135c388ad25dcd2" : "rETH",
  "0x9d7ed45ee2e8fc5482fa2428f15c971e6369011d" : "ETHx",
  "0x54945180db7943c0ed0fee7edab2bd24620256bc" : "cbETH",
  "0x13760f50a9d7377e4f20cb8cf9e4c26586c658ff" : "ankrETH",
  "0xa4c637e0f704745d182e4d38cab7e7485321d059" : "oETH",
  "0xacb55c530acdb2849e6d4f36992cd8c9d50ed8f7":  "Eigen",
  "0x298afb19a105d59e74658c4c334ff360bade6dd2" : "mETH",
  "0x8ca7a5d6f3acd3a7a8bc468a8cd0fb14b6bd28b6" : "sfrxETH",
  "0xae60d8180437b5c34bb956822ac2710972584473" : "LST ETH"
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
    const fetchData = async() => {
        if (isDataFetched) return; // Data has already been fetched, exit the function

        const options = {method: 'GET'};
        try {
          const totalTVLRes = await fetch('https://api.eigenexplorer.com/metrics/tvl', options)
          const restakeRes = await fetch('https://api.eigenexplorer.com/metrics/tvl/restaking', options)
          const avsOperatorsRes = await fetch('/api/get-avs-operators')
          const metricsRes = await fetch('https://api.eigenexplorer.com/metrics', options)

          const metricsData = await metricsRes.json()
          const restakeTVL = await restakeRes.json()
          const avsOperators = await avsOperatorsRes.json()
          
          setTotalTVL(metricsData.tvl)
          setTotalOperators(metricsData.totalOperators)
          setTotalAVSs(metricsData.totalAvs)
          setTotalStakers(metricsData.totalStakers)
          setTotalRestaking(metricsData.tvlRestaking)
          setRestakeTVL(restakeTVL.tvlStrategies)
          setAVSOperators(avsOperators)
          setIsDataFetched(true); // Set the flag to true after fetching data
          setIsPageLoading(false)
        } catch (error) {
          console.log(error)
        }
    }

    fetchData()
  }, [skip, take])

  useEffect(() => {
    const fetchWithdrawals = async () => {
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const withdrawlsRes = await fetch(`https://api.eigenexplorer.com/withdrawals?skip=${skip}&take=${take}`, options);
      const withdrawlsData = await withdrawlsRes.json();
      console.log(withdrawlsData)
      setWithdrawals(withdrawlsData.data);
      setTotal(withdrawlsData.meta.total);
      setIsPageLoading(false)
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

  const filteredData = Object.entries(restakeTVL).filter(([key, value]) => value !== 0 && key !== "Eigen");

  // Create labels and data arrays
  const labels = filteredData.map(([key, value]) => key);
  const dataValues = filteredData.map(([key, value]) => value);
  
  // Define the data for the Pie chart
  const restakeData = {
    labels: labels,
    datasets: [
      {
        label: 'TVL Strategies',
        data: dataValues,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',    // Bright pink
          'rgba(54, 162, 235, 0.8)',    // Bright blue
          'rgba(255, 206, 86, 0.8)',    // Bright yellow
          'rgba(75, 192, 192, 0.8)',    // Bright teal
          'rgba(153, 102, 255, 0.8)',   // Bright purple
          'rgba(255, 159, 64, 0.8)',    // Bright orange
          'rgba(46, 204, 113, 0.8)',    // Bright green
          'rgba(52, 152, 219, 0.8)',    // Another blue shade
          'rgba(155, 89, 182, 0.8)',    // Another purple shade
          'rgba(241, 196, 15, 0.8)',    // Another yellow shade
          'rgba(231, 76, 60, 0.8)',     // Bright red
          'rgba(26, 188, 156, 0.8)',    // Another teal shade
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',      
          'rgba(54, 162, 235, 1)',      
          'rgba(255, 206, 86, 1)',      
          'rgba(75, 192, 192, 1)',      
          'rgba(153, 102, 255, 1)',     
          'rgba(255, 159, 64, 1)',      
          'rgba(46, 204, 113, 1)',      
          'rgba(52, 152, 219, 1)',      
          'rgba(155, 89, 182, 1)',      
          'rgba(241, 196, 15, 1)',      
          'rgba(231, 76, 60, 1)',       
          'rgba(26, 188, 156, 1)',
        ],     
        borderWidth: 2
      }
    ]
  };

  const avsOperatorsData = {
    labels: avsOperators.map(({ name }) => name),
    datasets: [
      {
        data: avsOperators.map(({ operatorsCount }) => operatorsCount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(46, 204, 113, 0.8)',
          'rgba(52, 152, 219, 0.8)',
          'rgba(155, 89, 182, 0.8)',
          'rgba(241, 196, 15, 0.8)',
          'rgba(231, 76, 60, 0.8)',
          'rgba(26, 188, 156, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(46, 204, 113, 1)',
          'rgba(52, 152, 219, 1)',
          'rgba(155, 89, 182, 1)',
          'rgba(241, 196, 15, 1)',
          'rgba(231, 76, 60, 1)', 
          'rgba(26, 188, 156, 1)',
        ],     
        borderWidth: 2
      },
    ],
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
    totalRestaking 
  }) => {
    return (
      <div className="flex bg-white rounded-lg shadow-sm overflow-hidden">
        <SummaryItem label="TVL(ETH)" value={totalTVL} isFirst={true} />
        <SummaryItem label="Total Operators" value={totalOperators} />
        <SummaryItem label="Total AVSs" value={totalAVSs} />
        <SummaryItem label="Total Stakers" value={totalStakers} />
        <SummaryItem label="TVL Restaking(ETH)" value={totalRestaking} isLast={true} />
      </div>
    );
  };
  
  interface SummaryItemProps {
    label: string;
    value: number;
    isFirst?: boolean;
    isLast?: boolean;
  }

  const SummaryItem: React.FC<SummaryItemProps> = ({ label, value, isFirst = false, isLast = false }) => {
    return (
      <div className={`flex-1 p-4 ${!isLast ? 'border-r border-gray-200' : ''} ${isFirst ? 'pl-6' : ''} ${isLast ? 'pr-6' : ''}`}>
        <div className="text-sm text-gray-600">{label}</div>
        <div className="font-bold text-lg text-black">
          {parseFloat(value.toFixed(2)).toLocaleString()}
        </div>
      </div>
    );
  };
  
  return (
    <div className='p-20'>
      <h1 className='text-4xl text-center pb-7'>Analytics</h1>
      {isPageLoading && (
          <div className="flex items-center justify-center pt-10">
              <Oval
                  visible={true}
                  height="40"
                  width="40"
                  color="#0500FF"
                  secondaryColor="#cdccff"
                  ariaLabel="oval-loading"
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
          <div className='flex items-center justify-center mt-7'>
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
          </div>
          <div className='mt-10'>
            <div className="mx-auto py-8 overflow-x-auto">
                <h1 className='mt-10 mb-10'>All Withdrawals</h1>

                <table className="w-full border-collapse text-center text-white">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="py-2 px-4 border border-gray-700">Block</th>
                      <th className="py-2 px-4 border border-gray-700">Staker</th>
                      <th className="py-2 px-4 border border-gray-700">Is Completed?</th>
                      <th className="py-2 px-4 border border-gray-700">Delegated To</th>
                      <th className="py-2 px-4 border border-gray-700">Shares(ETH)</th>
                      <th className="py-2 px-4 border border-gray-700">Strategy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((withdrawal, index) => (
                      <tr key={index} className="bg-gray-900 hover:bg-gray-800 transition-colors">
                        <td className="py-2 px-4 border border-gray-700 text-sm">{withdrawal.createdAtBlock}</td>
                        <td className="py-2 px-4 border border-gray-700 text-sm">{withdrawal.stakerAddress}</td>
                        <td className="py-2 px-4 border border-gray-700 text-sm">{withdrawal.isCompleted ? 'Yes' : 'No'}</td>
                        <td className="py-2 px-4 border border-gray-700 text-sm">{withdrawal.delegatedTo}</td>
                        <td className="py-2 px-4 border border-gray-700 text-sm">
                          {withdrawal.shares.map((share, index) => (
                            <div key={index}>{weiToEth(share.shares)}</div>
                          ))}
                        </td>
                        <td className="py-2 px-4 border border-gray-700">
                          {withdrawal.shares.map((share, index) => (
                            <div key={index}>{strategyNames[share.strategyAddress] || share.strategyAddress}</div>
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
                    onClick={() => handlePageChange((skip / take) + 2)}
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
  )
}

export default Analytics;