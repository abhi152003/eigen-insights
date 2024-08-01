import { useRouter } from "next-nprogress-bar";
import React, { useEffect, useState } from "react";
import { ThreeCircles } from "react-loader-spinner";
import Image from "next/image";
import { IoCopy, IoSearchSharp } from "react-icons/io5";
import copy from "copy-to-clipboard";
import toast, { Toaster } from "react-hot-toast";
import { gql, useQuery } from "@apollo/client";

import { FaChevronDown, FaCircleInfo, FaPlus } from "react-icons/fa6";
import { Tooltip } from "@nextui-org/react";

const GET_OPERATORS = gql`
  query GetAllOperators($avsAddress: String!) {
    quorums(where: { avs: $avsAddress }, first: 2) {
      operators(orderBy: totalWeight, orderDirection: desc, first: 900) {
        createdTimestamp
        operator {
          id
          metadataURI
          delegatorsCount
          totalShares
          totalEigenShares
          avsStatuses(where: { avs: $avsAddress }) {
            status
          }
        }
        totalWeight
      }
      quorum
      operatorsCount
    }
  }
`;

const GET_AVS_OPERATORS = gql`
  query GetAVSOperators($avsAddress: String!, $status: Int) {
    avsoperatorStatuses(
      where: { avs: $avsAddress, status: $status }
      orderBy: operator__totalShares
      orderDirection: desc
      first: 900
    ) {
      status
      operator {
        id
        metadataURI
        delegatorsCount
        registered
        totalShares
        totalEigenShares
      }
    }
  }
`;

const GET_DA_METRICS = gql`
  query GetDAMetrics($operatorId: String!) {
    eigenDaMetrics_collection {
      activeOperators(where: { id: $operatorId }) {
        id
        daSigningRate24h
        daSigningRate4W
        daSigningRate1W
      }
    }
  }
`;

interface Operator {
  quorum?: number;
  createdTimestamp?: string;
  operator: {
    id: string;
    metadataURI: string;
    delegatorsCount: number;
    totalShares: string;
    totalEigenShares: string;
    avsStatuses?: { status: number }[];
    registered?: number;
  };
  totalWeight?: string;
  daSigningRate?: string;
  status?: number;
}

interface OperatorRowProps {
  operator: Operator;
  router: ReturnType<typeof useRouter>;
  handleCopy: (address: string) => void;
  rank: string;
  daSigningRatePeriod: string;
}

const ITEMS_PER_PAGE = 20;

function Operators({ props }: { props: { individualDelegate: string } }) {
  const router = useRouter();
  const [allOperators, setAllOperators] = useState<Operator[]>([]);
  const [displayedOperators, setDisplayedOperators] = useState<Operator[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuorum, setSelectedQuorum] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [operatorCounts, setOperatorCounts] = useState<{
    [key: number]: number;
  }>({});
  const [operatorsInAllQuorums, setOperatorsInAllQuorums] = useState<
    Operator[]
  >([]);
  const [daSigningRatePeriod, setDaSigningRatePeriod] = useState<string>("24h");
  const [useAVSOperators, setUseAVSOperators] = useState(false);
  const [useAllOperatorsFallback, setUseAllOperatorsFallback] = useState(true);
  const [totalAVSOperatorsCount, setTotalAVSOperatorsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    loading: queryLoading,
    error,
    data,
  } = useQuery(GET_OPERATORS, {
    variables: { avsAddress: props.individualDelegate },
    notifyOnNetworkStatusChange: true,
    context: {
      subgraph: "avs",
    },
  });

  console.log("dataaaaaaaaaa", data);

  const {
    loading: avsQueryLoading,
    error: avsError,
    data: avsData,
  } = useQuery(GET_AVS_OPERATORS, {
    variables: {
      avsAddress: props.individualDelegate,
      status: 1, // Assuming we want active operators
    },
    context: {
      subgraph: "avs",
    },
  });

  console.log("fallbackkkkkkkkkkkk", avsData);

  useEffect(() => {
    if (data?.quorums) {
      const operators = data.quorums.flatMap((quorum: any) =>
        quorum.operators.map((op: any) => ({ ...op, quorum: quorum.quorum }))
      );
      setAllOperators(operators);

      const counts = data.quorums.reduce(
        (acc: { [key: number]: number }, quorum: any) => {
          acc[quorum.quorum] = quorum.operatorsCount;
          return acc;
        },
        {}
      );
      setOperatorCounts(counts);

      setLoading(false);
    }

    if (avsData?.avsoperatorStatuses) {
      const fallbackOperators = avsData.avsoperatorStatuses.map((op: any) => ({
        operator: op.operator,
        status: op.status,
      }));
      setTotalAVSOperatorsCount(fallbackOperators.length);

      if (selectedQuorum === null) {
        setDisplayedOperators(fallbackOperators);
      }

      setLoading(false);
    }
  }, [data, avsData, selectedQuorum]);

  useEffect(() => {
    let filtered: Operator[] = [];
    if (selectedQuorum === null) {
      filtered =
        avsData?.avsoperatorStatuses.map((op: any) => ({
          operator: op.operator,
          status: op.status,
        })) || [];
    } else {
      filtered = allOperators.filter((op) => op.quorum === selectedQuorum);
    }

    if (searchQuery) {
      filtered = filtered.filter((operator) =>
        operator.operator.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort(
      (a, b) =>
        parseFloat(b.operator.totalShares) - parseFloat(a.operator.totalShares)
    );

    setDisplayedOperators(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [allOperators, avsData, searchQuery, selectedQuorum]);

  const handleCopy = (addr: string) => {
    copy(addr);
    toast("Address Copied 🎊");
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleQuorumSelection = (quorum: number | null) => {
    setSelectedQuorum(quorum);
    setCurrentPage(1); // Reset to first page when changing quorum
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getPaginatedOperators = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayedOperators.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const calculateRank = (
    operator: Operator,
    displayedOperators: Operator[]
  ) => {
    return (
      displayedOperators.findIndex(
        (op) => op.operator.id === operator.operator.id
      ) + 1
    );
  };

  const totalPages = Math.ceil(displayedOperators.length / ITEMS_PER_PAGE);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            i === currentPage
              ? "bg-sky-blue text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  const OperatorRow: React.FC<OperatorRowProps> = ({
    operator,
    router,
    handleCopy,
    rank,
    daSigningRatePeriod,
  }) => {
    const [metadata, setMetadata] = useState<{
      name: string;
      logo: string;
      description: string;
    } | null>(null);

    const { data: daMetricsData } = useQuery(GET_DA_METRICS, {
      variables: { operatorId: operator.operator.id },
      skip:
        props.individualDelegate !==
        "0x870679e138bcdf293b7ff14dd44b70fc97e12fc0",
    });

    useEffect(() => {
      if (daMetricsData && daMetricsData.eigenDaMetrics_collection) {
        const activeOperators =
          daMetricsData.eigenDaMetrics_collection[0]?.activeOperators;
        if (activeOperators && activeOperators.length > 0) {
          const metrics = activeOperators[0];
          if (metrics) {
            const rate = metrics[`daSigningRate${daSigningRatePeriod}`];
            operator.daSigningRate = rate !== undefined ? rate : undefined;
          }
        } else {
          operator.daSigningRate = undefined;
        }
      }
    }, [daMetricsData, daSigningRatePeriod, operator]);

    useEffect(() => {
      const fetchMetadata = async () => {
        try {
          const response = await fetch(operator.operator.metadataURI);
          const data = await response.json();
          setMetadata(data);
        } catch (error) {
          console.error("Error fetching metadata:", error);
        }
      };
      fetchMetadata();
    }, [operator.operator.metadataURI]);

    const formatDate = (timestamp: string | number | undefined) => {
      if (!timestamp) return "N/A";
      const now = new Date();
      const past = new Date(
        typeof timestamp === "string" ? parseInt(timestamp) * 1000 : timestamp
      );
      const diffTime = Math.abs(now.getTime() - past.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return "today";
      } else if (diffDays === 1) {
        return "yesterday";
      } else {
        return `${diffDays} days ago`;
      }
    };

    const status =
      selectedQuorum === null
        ? operator.status === 1
          ? "Active"
          : "Inactive"
        : operator.operator.avsStatuses?.[0]?.status === 1
        ? "Active"
        : "Inactive";

    const optInDate: string | number | undefined =
      operator.createdTimestamp || operator.operator.registered;

    return (
      <tr
        className="border-b border-gray-700 hover:bg-sky-blue hover:bg-opacity-5 cursor-pointer transition-colors duration-150 whitespace-nowrap"
        onClick={() =>
          router.push(`/operators/${operator.operator.id}?active=info`)
        }
      >
        <td className="px-4 py-2">
          <div className="flex items-center">
            <div className="relative w-10 h-10 flex-shrink-0 mr-3">
              <Image
                src={metadata?.logo ?? ""}
                alt="Logo"
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            </div>
            <span className="font-semibold">
              {metadata?.name ||
                `${operator.operator.id.slice(
                  0,
                  6
                )}...${operator.operator.id.slice(-4)}`}
            </span>
          </div>
        </td>
        <td className="px-4 py-2">
          <div className="flex items-center">
            <span className="text-light-cyan">{`${operator.operator.id.slice(
              0,
              6
            )}...${operator.operator.id.slice(-4)}`}</span>
            <span
              className="ml-2 cursor-pointer"
              onClick={(event) => {
                event.stopPropagation();
                handleCopy(operator.operator.id);
              }}
              title="Copy address"
            >
              <IoCopy size={16} />
            </span>
          </div>
        </td>
        <td className="px-4 py-2 text-right">
          {operator.operator.delegatorsCount}
        </td>
        {selectedQuorum === 0 || selectedQuorum === null ? (
          <td className="px-4 py-2 text-right">
            {(parseFloat(operator.operator.totalShares) / 1e18).toFixed(2)}
          </td>
        ) : (
          <td className="px-4 py-2 text-right">
            {(parseFloat(operator.operator.totalEigenShares) / 1e18).toFixed(2)}
          </td>
        )}
        <td className="px-4 py-2 text-right">{formatDate(optInDate)}</td>
        <td className="px-4 py-2 text-right">{status}</td>
        <td className="px-4 py-2 text-right">{rank}</td>
        {props.individualDelegate ===
          "0x870679e138bcdf293b7ff14dd44b70fc97e12fc0" && (
          <td className="px-4 py-2 text-right">
            {operator.daSigningRate !== undefined
              ? `${parseFloat(operator.daSigningRate).toFixed(2)}%`
              : "N/A"}
          </td>
        )}
      </tr>
    );
  };

  if (loading) {
    return (
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
    );
  }

  const getTotalOperatorCount = () => {
    return totalAVSOperatorsCount;
  };

  return (
    <div>
      <div>
        {/* <h1 className="mt-3 ml-3 font-medium text-3xl">Node Operators</h1> */}
        <div className="py-2 pe-14 font-poppins">
          <div className="searchBox searchShineWidthOfAVSs mb-1">
            <input
              className="searchInput"
              type="text"
              name=""
              placeholder="Search by Address or ENS Name"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <button className="searchButton">
              <IoSearchSharp className="iconExplore" />
            </button>
          </div>
          <div className="mb-4 flex space-x-4 my-4">
            <button
              className={`border-[#A7DBF2] border-1 rounded-md px-8 
                border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000 group 
                    ${
                      selectedQuorum === null
                        ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3]"
                        : "text-white border-white"
                    }`}
              onClick={() => handleQuorumSelection(null)}
            >
              <div className="flex items-center gap-2 justify-center ml-[-20px] relative">
                <span>All Quorums ({totalAVSOperatorsCount})</span>
                <span className="absolute right-[-20px]">
                  <Tooltip
                    content={
                      <div className="font-poppins p-2 bg-medium-blue text-white rounded-md max-w-[20vw]">
                        <span className="text-sm">
                          Includes operators handling Either of ETH, LSTs, or
                          EIGEN token delegations from restakers
                        </span>
                      </div>
                    }
                    showArrow
                    placement="bottom"
                    delay={1}
                  >
                    <span className="px-2">
                      <FaCircleInfo className="cursor-pointer text-[#A7DBF2]" />
                    </span>
                  </Tooltip>
                </span>
              </div>
            </button>
            <button
              className={`border-[#A7DBF2] border-1 rounded-md px-8 
                border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000 group  
                    ${
                      selectedQuorum === 0
                        ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3]"
                        : "text-white border-white"
                    }`}
              onClick={() => handleQuorumSelection(0)}
            >
              {/* Quorum 0 ({operatorCounts[0] || 0}) */}
              <div className="flex items-center gap-2 justify-center ml-[-20px] relative">
                <span>Quorum 0 ({operatorCounts[0] || 0})</span>
                <span className="absolute right-[-20px]">
                  <Tooltip
                    content={
                      <div className="font-poppins p-2 bg-medium-blue text-white rounded-md max-w-[20vw]">
                        <span className="text-sm">
                        Number of operators dedicated to ETH and LST delegations in EigenLayer
                        </span>
                      </div>
                    }
                    showArrow
                    placement="bottom"
                    delay={1}
                  >
                    <span className="px-2">
                      <FaCircleInfo className="cursor-pointer text-[#A7DBF2]" />
                    </span>
                  </Tooltip>
                </span>
              </div>
            </button>
            <button
              className={`border-[#A7DBF2] border-1 rounded-md px-8 
                border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000 group  
                    ${
                      selectedQuorum === 1
                        ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3]"
                        : "text-white border-white"
                    }`}
              onClick={() => handleQuorumSelection(1)}
            >
              {/* Quorum 1 ({operatorCounts[1] || 0}) */}
              <div className="flex items-center gap-2 justify-center ml-[-20px] relative">
                <span>Quorum 1 ({operatorCounts[1] || 0})</span>
                <span className="absolute right-[-20px]">
                  <Tooltip
                    content={
                      <div className="font-poppins p-2 bg-medium-blue text-white rounded-md max-w-[21vw]">
                        <span className="text-sm">
                        EIGEN token-specific operator set within the EigenLayer ecosystem that focuses on network participation through EIGEN staking
                        </span>
                      </div>
                    }
                    showArrow
                    placement="right"
                    delay={1}
                  >
                    <span className="px-2">
                      <FaCircleInfo className="cursor-pointer text-[#A7DBF2]" />
                    </span>
                  </Tooltip>
                </span>
              </div>
            </button>
          </div>
          {props.individualDelegate ===
            "0x870679e138bcdf293b7ff14dd44b70fc97e12fc0" && (
            <div className="mb-4 flex space-x-4">
              <button
                className={`p-3 border-[#A7DBF2] border-1 rounded-md px-6 
                border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000 group  ${
                  daSigningRatePeriod === "24h"
                    ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3]"
                    : "text-white border-white"
                }`}
                onClick={() => setDaSigningRatePeriod("24h")}
              >
                1 Day
              </button>
              <button
                className={`border-[#A7DBF2] border-1 rounded-md px-4 
              border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000 group  ${
                daSigningRatePeriod === "1W"
                  ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3]"
                  : "text-white border-white"
              }`}
                onClick={() => setDaSigningRatePeriod("1W")}
              >
                1 Week
              </button>
              <button
                className={`border-[#A7DBF2] border-1 rounded-md px-4 
              border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000 group  ${
                daSigningRatePeriod === "4W"
                  ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3]"
                  : "text-white border-white"
              }`}
                onClick={() => setDaSigningRatePeriod("4W")}
              >
                1 Month
              </button>
            </div>
          )}
          <div className="mt-4 w-full overflow-x-auto">
            <table className="min-w-full bg-midnight-blue overflow-x-auto">
              <thead>
                <tr className="bg-sky-blue bg-opacity-10">
                  <th className="px-4 py-2 text-left">Operator</th>
                  <th className="px-4 py-2 text-left">Address</th>
                  <th className="px-4 py-2 text-right">Restakers</th>
                  <th className="px-4 py-2 text-right flex gap-1 justify-end">
                    <span className="pt-[21px] text-center">TVL</span>
                    <span>
                      <Tooltip
                        content={
                          <div className="font-poppins p-2 bg-medium-blue text-white rounded-md max-w-[20vw]">
                            <span className="text-sm">
                              Total amount of ETH restaked or locked with an
                              operator within the EigenLayer protocol
                            </span>
                          </div>
                        }
                        showArrow
                        placement="top"
                        delay={1}
                      >
                        <span className="px-2">
                          <FaCircleInfo className="cursor-pointer text-[#A7DBF2]" />
                        </span>
                      </Tooltip>
                    </span>
                  </th>
                  <th className="px-4 py-2 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-right">Opt-in</span>
                      <span>
                        <Tooltip
                          content={
                            <div className="font-poppins p-2 bg-medium-blue text-white rounded-md max-w-[22vw]">
                              <span className="text-sm">
                                Indicates when an individual operator has began
                                participating in the AVS
                              </span>
                            </div>
                          }
                          showArrow
                          placement="top"
                          delay={1}
                        >
                          <span className="px-2">
                            <FaCircleInfo className="cursor-pointer text-[#A7DBF2]" />
                          </span>
                        </Tooltip>
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-2 text-right">
                    <div className="flex gap-2 items-center justify-end">
                      <span className="text-right">Status</span>
                      <span>
                        <Tooltip
                          content={
                            <div className="font-poppins p-2 bg-medium-blue text-white rounded-md max-w-[22vw]">
                              <span className="text-sm">
                                Indicates the operator's status for this
                                particular AVS
                              </span>
                            </div>
                          }
                          showArrow
                          placement="top"
                          delay={1}
                        >
                          <span className="px-2">
                            <FaCircleInfo className="cursor-pointer text-[#A7DBF2]" />
                          </span>
                        </Tooltip>
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-2 text-right flex gap-1 justify-end">
                    <span className="pt-[21px] text-right">Rank</span>
                    <span>
                      <Tooltip
                        content={
                          <div className="font-poppins p-2 bg-medium-blue text-white rounded-md max-w-[22vw]">
                            <span className="text-sm">
                              Operator's rank within a quorum is determined by
                              their TVL according to the quorum's strategies
                            </span>
                          </div>
                        }
                        showArrow
                        placement="top"
                        delay={1}
                      >
                        <span className="px-2">
                          <FaCircleInfo className="cursor-pointer text-[#A7DBF2]" />
                        </span>
                      </Tooltip>
                    </span>
                  </th>
                  {props.individualDelegate ===
                    "0x870679e138bcdf293b7ff14dd44b70fc97e12fc0" && (
                    <th className="px-4 py-2 text-right">
                      <div className="flex gap-2 items-center justify-end">
                        <span className="text-right">Uptime</span>
                        <span>
                          <Tooltip
                            content={
                              <div className="font-poppins p-2 bg-medium-blue text-white rounded-md max-w-[20vw]">
                                <span className="text-sm">
                                  Number of batches processed by the operator in
                                  selected time
                                </span>
                              </div>
                            }
                            showArrow
                            placement="top"
                            delay={1}
                          >
                            <span className="px-2">
                              <FaCircleInfo className="cursor-pointer text-[#A7DBF2]" />
                            </span>
                          </Tooltip>
                        </span>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {getPaginatedOperators().map((operator, index) => (
                  <OperatorRow
                    key={operator.operator.id}
                    operator={operator}
                    router={router}
                    handleCopy={handleCopy}
                    rank={`${calculateRank(operator, displayedOperators)}/${
                      displayedOperators.length
                    }`}
                    daSigningRatePeriod={daSigningRatePeriod}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border-[#A7DBF2] border-1 rounded-md px-4 
              border-b-3 font-medium overflow-hidden relative hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000 group"
            >
              Previous
            </button>
            <div className="mx-4">{renderPageNumbers()}</div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border-[#A7DBF2] border-1 rounded-md px-4 
              border-b-3 font-medium overflow-hidden relative hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000 group"
            >
              Next
            </button>
          </div>
        </div>
      </div>
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
  );
}

export default Operators;
