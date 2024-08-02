import { gql, useQuery } from '@apollo/client';
import React, { useState, useEffect } from 'react';
import copy from "copy-to-clipboard";
import toast from 'react-hot-toast';
import { IoCopy } from 'react-icons/io5';
import { formatDistanceToNowStrict } from 'date-fns';

const GET_DATA = gql`
  query MyQuery($first: Int!, $skip: Int!) {
    claimeds(orderBy: amount, orderDirection: desc, first: $first, skip: $skip) {
      amount
      account
      blockTimestamp
      transactionHash
    }
  }
`;

type ClaimData = {
  amount: string;
  account: string;
  blockTimestamp: string;
  transactionHash: string;
};

type LeaderboardProps = {
  data: ClaimData[];
  currentPage: number;
  onPageChange: (newPage: number) => void;
};

const ITEMS_PER_PAGE = 10;

const Leaderboard: React.FC<LeaderboardProps> = ({ data, currentPage, onPageChange }) => {
  const handleCopy = (addr: string) => {
    copy(addr);
    toast("Address Copied 🎊");
  };

  return (
    <div className="bg-[#1f2937] text-white p-6 rounded-lg shadow-lg mt-4">
      <h2 className="text-2xl font-bold mb-4 text-white flex items-center">
        Airdrop Leaderboard 🎁🎊
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a3955]">
              <th className="px-4 py-2 text-left">Rank</th>
              <th className="px-4 py-2 text-left">Account</th>
              <th className="px-4 py-2 text-right">Amount (EIGEN)</th>
              <th className="px-4 py-2 text-right">Claimed</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={item.transactionHash}
                className="border-b border-[#2a3955] hover:bg-[#1c2d4a] transition-colors"
              >
                <td className="px-4 py-2">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <a
                      href={`https://etherscan.io/address/${item.account}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-light-cyan hover:underline"
                    >
                      <span>
                        {`${item.account.slice(0, 6)}...${item.account.slice(-4)}`}
                      </span>
                    </a>
                    <span
                      className="ml-2 cursor-pointer"
                      onClick={() => handleCopy(item.account)}
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
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mr-2 bg-gray-700 text-gray-100 rounded hover:bg-light-blue disabled:bg-gray-800 disabled:text-gray-500 transition-colors cursor-pointer"
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={data.length < ITEMS_PER_PAGE}
          className="px-4 py-2 mr-2 bg-gray-700 text-gray-100 rounded hover:bg-light-blue disabled:bg-gray-800 disabled:text-gray-500 transition-colors cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};

function Airdrop() {
  const [currentPage, setCurrentPage] = useState(1);

  const { loading, error, data } = useQuery(GET_DATA, {
    variables: { first: ITEMS_PER_PAGE, skip: (currentPage - 1) * ITEMS_PER_PAGE },
    context: {
      subgraph: "airdrop",
    },
  });

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {data && data.claimeds && (
        <Leaderboard
          data={data.claimeds}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default Airdrop;