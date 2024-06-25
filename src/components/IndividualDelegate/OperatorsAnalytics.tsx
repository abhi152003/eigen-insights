import React, { useState } from 'react'
import { ThreeCircles } from 'react-loader-spinner'
import { Grid, CheckCircle, Clock, X } from 'lucide-react';
import { Search, ChevronUp, ChevronDown, Check, AlertTriangle, Wrench } from 'lucide-react';

interface StatusItemProps {
  label: string;
  count: number;
  color: string;
  isActive?: boolean;
}

const NewStatusItem: React.FC<StatusItemProps> = ({ label, count, color, isActive }) => (
  <div className={`flex items-center space-x-2 px-3 py-1 ${isActive ? 'border-b-2 border-green-500' : ''}`}>
    <span className="font-medium text-gray-700">{label}</span>
    <span className={`font-semibold ${color}`}>{count}</span>
  </div>
);

interface ValidatorItemProps {
  name: string;
  poolId: string;
  commission: string;
  apy: string;
  blockPerformance: string;
  chunkPerformance: string;
  poolSize: number;
  sizeChange: number;
  users: number;
  stakeRatio: string;
  warnings: 'none' | 'minor' | 'major';
  status: 'Active' | 'Proposal' | 'Kickout' | 'Idle';
}

const ValidatorItem: React.FC<ValidatorItemProps> = ({ name, poolId, commission, apy, blockPerformance, chunkPerformance, poolSize, sizeChange, users, stakeRatio, warnings, status }) => {
  const getWarningIcon = () => {
    switch (warnings) {
      case 'minor': return <Wrench className="text-yellow-500" size={16} />;
      case 'major': return <AlertTriangle className="text-red-500" size={16} />;
      default: return <Check className="text-green-500" size={16} />;
    }
  };

  return (
    <tr className="border-b border-gray-200">
      <td className="py-2 px-4 flex items-center space-x-2">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-800 font-bold">
          {name[0]}
        </div>
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-sm text-gray-500">{poolId}</div>
        </div>
      </td>
      <td className="py-2 px-4">{commission}</td>
      <td className="py-2 px-4">{apy}</td>
      <td className="py-2 px-4">{blockPerformance}</td>
      <td className="py-2 px-4">{chunkPerformance}</td>
      <td className="py-2 px-4">{poolSize.toLocaleString()} Ⓝ</td>
      <td className="py-2 px-4 flex items-center">
        {sizeChange}
        {sizeChange > 0 ? <ChevronUp className="text-green-500" size={16} /> : <ChevronDown className="text-red-500" size={16} />}
      </td>
      <td className="py-2 px-4">{users}</td>
      <td className="py-2 px-4">{stakeRatio}</td>
      <td className="py-2 px-4">{getWarningIcon()}</td>
      <td className="py-2 px-4">
        <span className={`px-2 py-1 rounded-full text-xs ${status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {status}
        </span>
      </td>
    </tr>
  );
};

interface StatusItemProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
}

const StatusItem: React.FC<StatusItemProps> = ({ icon, label, count, color }) => (
    <div className="flex flex-col items-center space-y-1 px-4 py-2 bg-white rounded-lg shadow w-50">
      <div className={`p-1 rounded-full ${color}`}>
        {icon}
      </div>
      <div className="text-xs font-semibold text-black">{label}</div>
      <div className="text-xs text-gray-500">{count} nodes</div>
    </div>
);

function OperatorsAnalytics() {
  const [isPageLoading, setIsPageLoading] = useState(true);

  const statuses = [
    { icon: <Grid size={24} />, label: 'All', count: 232, color: 'bg-blue-100 text-blue-600' },
    { icon: <CheckCircle size={24} />, label: 'Active', count: 219, color: 'bg-green-100 text-green-600' },
    { icon: <Clock size={24} />, label: 'Proposal', count: 9, color: 'bg-yellow-100 text-yellow-600' },
    { icon: <AlertTriangle size={24} />, label: 'Kickout', count: 4, color: 'bg-red-100 text-red-600' },
    { icon: <X size={24} />, label: 'Idle', count: 0, color: 'bg-gray-100 text-gray-600' },
  ];

  const [searchTerm, setSearchTerm] = useState('');

  const newStatuses: StatusItemProps[] = [
    {
        label: 'All', count: 232, color: 'text-blue-600',
        icon: undefined
    },
    {
        label: 'Active', count: 219, color: 'text-green-600', isActive: true,
        icon: undefined
    },
    {
        label: 'Proposal', count: 9, color: 'text-yellow-600',
        icon: undefined
    },
    {
        label: 'Kickout', count: 4, color: 'text-red-600',
        icon: undefined
    },
    {
        label: 'Idle', count: 0, color: 'text-gray-600',
        icon: undefined
    },
  ];

  const validators: ValidatorItemProps[] = [
    { name: 'I am CRYPTO BRO', poolId: 'iamcryptobro.poolv1.near', commission: '0.0%', apy: '8.9%', blockPerformance: '100.0%', chunkPerformance: '100.0%', poolSize: 30520, sizeChange: 5, users: 115, stakeRatio: '0.01%', warnings: 'none', status: 'Active' },
    { name: 'Swissstar', poolId: 'swissstar.poolv1.near', commission: '0.0%', apy: '8.9%', blockPerformance: '100.0%', chunkPerformance: '83.3%', poolSize: 40764, sizeChange: 0, users: 40, stakeRatio: '0.01%', warnings: 'minor', status: 'Active' },
    { name: 'near-bitManna', poolId: 'bitmanna.poolv1.near', commission: '0.0%', apy: '8.9%', blockPerformance: '100.0%', chunkPerformance: '0.0%', poolSize: 43550, sizeChange: -57, users: 162, stakeRatio: '0.01%', warnings: 'major', status: 'Active' },
    // Add more validators as needed
  ];
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
    <div className="flex justify-center">
    <div className="flex flex-col items-center space-y-6">
      <div className="inline-flex space-x-2 p-2 bg-gray-100 rounded-lg">
        {statuses.map((status, index) => (
          <button key={index}>
            <StatusItem {...status} />
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 w-full">
        <div className="flex space-x-4 mb-4">
          {newStatuses.map((status, index) => (
            <NewStatusItem key={index} {...status} />
          ))}
        </div>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search validator name or pool id..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            className="absolute left-3 top-2.5 text-gray-400"
            size={20}
          />
        </div>
        <table className="w-full text-black">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="py-2 px-4">Validator</th>
              <th className="py-2 px-4">Commission</th>
              <th className="py-2 px-4">APY</th>
              <th className="py-2 px-4">Block Performance</th>
              <th className="py-2 px-4">Chunk Performance</th>
              <th className="py-2 px-4">Pool Size</th>
              <th className="py-2 px-4">Size Change</th>
              <th className="py-2 px-4">Users</th>
              <th className="py-2 px-4">Stake Ratio</th>
              <th className="py-2 px-4">Warnings</th>
              <th className="py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {validators.map((validator, index) => (
              <ValidatorItem key={index} {...validator} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  );
}

export default OperatorsAnalytics