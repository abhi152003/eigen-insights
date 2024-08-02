"use client";
import { gql, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { IoCopy, IoSearchSharp } from "react-icons/io5";
import { useAccount } from "wagmi";
import copy from "copy-to-clipboard";
import toast, { Toaster } from "react-hot-toast";
import { formatEther } from "ethers";
import client from "../utils/avsExplorerClient";

const GET_WITHDRAWALS = gql`
  query GetWithdrawals($skip: Int!, $first: Int!, $where: Withdrawal_filter) {
    withdrawals(
      skip: $skip
      first: $first
      orderBy: queuedBlockNumber
      orderDirection: desc
      where: $where
    ) {
      staker {
        id
      }
      completedBlockNumber
      queuedBlockNumber
      completedBlockTimestamp
      queuedBlockTimestamp
      completedTransactionHash
      queuedTransactionHash
      strategies {
        share
        strategy {
          tokenSymbol
        }
      }
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

interface Withdrawal {
  createdAtBlock: number;
  delegatedTo: string;
  isCompleted: boolean;
  stakerAddress: string;
  shares: Share[];
  delay: WithdrawalDelay;
}

interface Share {
  strategyAddress: string;
  shares: string;
}

interface WithdrawalQueryResult {
  withdrawals: Array<{
    staker: { id: string };
    completedBlockNumber: string | null;
    queuedBlockNumber: string;
    strategies: Array<{
      share: string;
      strategy: { tokenSymbol: string };
    }>;
  }>;
}

type WithdrawalQueryVariables = {
  skip: number;
  first: number;
  where?: { staker_: { id: string } };
};

type WithdrawalDelay = {
  days: number;
  label: string;
};

function Withdrawals() {
  const { address } = useAccount();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Withdrawal[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [take] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    loading: withdrawalsLoading,
    error: withdrawalsError,
    data: withdrawalsData,
    fetchMore,
    refetch,
  } = useQuery<WithdrawalQueryResult, WithdrawalQueryVariables>(
    GET_WITHDRAWALS,
    {
      variables: { skip, first: take },
      context: {
        subgraph: "avs",
      },
    }
  );

  const getWithdrawalDelay = (strategy: string): WithdrawalDelay => {
    if (strategy.toLowerCase() === "beigen") {
      return { days: 24, label: "24 days" };
    }
    return { days: 7, label: "7 days" };
  };

  useEffect(() => {
    if (withdrawalsData) {
      const formattedWithdrawals = withdrawalsData.withdrawals.map(
        (withdrawal) => ({
          createdAtBlock: parseInt(withdrawal.queuedBlockNumber),
          stakerAddress: withdrawal.staker.id,
          isCompleted: !!withdrawal.completedBlockNumber,
          delegatedTo: withdrawal.staker.id,
          shares: withdrawal.strategies.map((strategy) => ({
            shares: strategy.share,
            strategyAddress: strategy.strategy.tokenSymbol,
          })),
          delay: getWithdrawalDelay(
            withdrawal.strategies[0]?.strategy.tokenSymbol || ""
          ),
        })
      );
      setWithdrawals(formattedWithdrawals);
      setHasMore(formattedWithdrawals.length === take);
      setIsPageLoading(false);
    }
  }, [withdrawalsData, take]);

  const handlePageChange = (direction: "next" | "prev") => {
    if (direction === "next" && hasMore) {
      const newSkip = skip + take;
      setSkip(newSkip);
      setCurrentPage(currentPage + 1);
      fetchMore({
        variables: { skip: newSkip, first: take },
        updateQuery: (_, { fetchMoreResult }) => {
          if (!fetchMoreResult) return { withdrawals: [] };
          return fetchMoreResult;
        },
      });
    } else if (direction === "prev" && skip > 0) {
      const newSkip = Math.max(0, skip - take);
      setSkip(newSkip);
      setCurrentPage(currentPage - 1);
      fetchMore({
        variables: { skip: newSkip, first: take },
        updateQuery: (_, { fetchMoreResult }) => {
          if (!fetchMoreResult) return { withdrawals: [] };
          return fetchMoreResult;
        },
      });
    }
  };

  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
    setSearchPage(1);

    if (query.length > 0) {
      setIsSearching(true);
      setIsPageLoading(true);
      try {
        const { data } = await client.query<
          WithdrawalQueryResult,
          WithdrawalQueryVariables
        >({
          query: GET_WITHDRAWALS,
          variables: {
            skip: 0,
            first: take,
            where: { staker_: { id: query.toLowerCase() } },
          },
          context: {
            subgraph: "avs",
          },
        });

        if (data && data.withdrawals) {
          const formattedWithdrawals = data.withdrawals.map((withdrawal) => ({
            createdAtBlock: parseInt(withdrawal.queuedBlockNumber),
            stakerAddress: withdrawal.staker.id,
            isCompleted: !!withdrawal.completedBlockNumber,
            delegatedTo: withdrawal.staker.id,
            shares: withdrawal.strategies.map((strategy) => ({
              shares: strategy.share,
              strategyAddress: strategy.strategy.tokenSymbol,
            })),
            delay: getWithdrawalDelay(
              withdrawal.strategies[0]?.strategy.tokenSymbol || ""
            ),
          }));
          setWithdrawals(formattedWithdrawals);
          setHasMore(formattedWithdrawals.length === take);
        } else {
          setWithdrawals([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error("Search error:", error);
        setWithdrawals([]);
        setHasMore(false);
      } finally {
        setIsPageLoading(false);
      }
    } else {
      setIsSearching(false);
      setIsPageLoading(true);
      setSkip(0);
      setCurrentPage(1);

      try {
        const { data } = await refetch({
          skip: 0,
          first: take,
          where: undefined, // Remove any previous search filter
        });

        if (data && data.withdrawals) {
          const formattedWithdrawals = data.withdrawals.map((withdrawal) => ({
            createdAtBlock: parseInt(withdrawal.queuedBlockNumber),
            stakerAddress: withdrawal.staker.id,
            isCompleted: !!withdrawal.completedBlockNumber,
            delegatedTo: withdrawal.staker.id,
            shares: withdrawal.strategies.map((strategy) => ({
              shares: strategy.share,
              strategyAddress: strategy.strategy.tokenSymbol,
            })),
            delay: getWithdrawalDelay(
              withdrawal.strategies[0]?.strategy.tokenSymbol || ""
            ),
          }));
          setWithdrawals(formattedWithdrawals);
          setHasMore(formattedWithdrawals.length === take);
        } else {
          setWithdrawals([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error refetching initial data:", error);
        setWithdrawals([]);
        setHasMore(false);
      } finally {
        setIsPageLoading(false);
      }
    }
  };

  const handleWithdrawalAddress = async () => {
    if (address) {
      handleSearchChange(address.toLowerCase());
    }
  };

  const handleCopy = (addr: string) => {
    copy(addr);
    toast("Address Copied 🎊");
  };

  const weiToEth = (value: string) => {
    return parseFloat(formatEther(value));
  };

  return (
    <div className="">
      <h1 className="ml-3 mt-10 text-2xl font-semibold">All Withdrawals</h1>

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
              {/* <th className="py-2 px-4 border border-gray-700">Delegated To</th> */}
              <th className="py-2 px-4 border border-gray-700">Shares(ETH)</th>
              <th className="py-2 px-4 border border-gray-700">Strategy</th>
              <th className="py-2 px-4 border border-gray-700">
                Withdrawal Delay
              </th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.length === 0 && (
              <div className="flex items-center justify-center">
                <span className="text-center">No Data Available</span>
              </div>
            )}
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
                {/* <td className="py-2 px-4 border border-gray-700 text-sm text-light-cyan">
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
                </td> */}
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
                <td className="py-2 px-4 border border-gray-700 text-sm">
                  {withdrawal.delay.label}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isSearching && (
          <div className="flex justify-center mt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange("prev")}
              className="px-4 py-2 mr-2 bg-gray-700 text-gray-100 rounded hover:bg-light-blue disabled:bg-gray-800 disabled:text-gray-500 transition-colors cursor-pointer"
            >
              Prev
            </button>
            <span className="px-4 py-2 mr-2 text-gray-300">
              Page {currentPage}
            </span>
            <button
              disabled={!hasMore}
              onClick={() => handlePageChange("next")}
              className="px-4 py-2 mr-2 bg-gray-700 text-gray-100 rounded hover:bg-light-blue disabled:bg-gray-800 disabled:text-gray-500 transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Withdrawals;
