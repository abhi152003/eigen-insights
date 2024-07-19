import { useRouter } from "next-nprogress-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ThreeCircles } from "react-loader-spinner";
import Image from "next/image";
import { Button, Tooltip as CopyToolTip } from "@nextui-org/react";
import { IoCopy, IoSearchSharp } from "react-icons/io5";
import copy from "copy-to-clipboard";
import toast, { Toaster } from "react-hot-toast";
import { gql, useQuery } from "@apollo/client";

const GET_OPERATORS = gql`
  query GetOperators($avsAddress: String!, $skip: Int!, $first: Int!) {
    quorums(where: { avs: $avsAddress }) {
      operators(orderBy: totalWeight, orderDirection: desc, skip: $skip, first: $first) {
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

interface Operator {
  createdTimestamp: string;
  operator: {
    id: string;
    metadataURI: string;
    delegatorsCount: number;
    totalShares: string;
    totalEigenShares: string;
    avsStatuses: { status: number }[];
  };
  totalWeight: string;
}

interface OperatorRowProps {
  operator: Operator;
  router: ReturnType<typeof useRouter>;
  handleCopy: (address: string) => void;
  rank: number;
}

const OperatorRow: React.FC<OperatorRowProps> = ({ operator, router, handleCopy, rank }) => {
  const [metadata, setMetadata] = useState<{ name: string; logo: string; description: string } | null>(null);

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

  const formatDate = (timestamp: string) => {
    const now = new Date();
    const past = new Date(parseInt(timestamp) * 1000);
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

  const status = operator.operator.avsStatuses[0]?.status === 1 ? "Active" : "Inactive";

  return (
    <tr
      className="border-b border-gray-700 hover:bg-sky-blue hover:bg-opacity-5 cursor-pointer transition-colors duration-150 whitespace-nowrap"
      onClick={() => router.push(`/operators/${operator.operator.id}?active=info`)}
    >
      <td className="px-4 py-2">
        <div className="flex items-center">
          <div className="relative w-10 h-10 flex-shrink-0 mr-3">
            <Image
              src={metadata?.logo ?? "/placeholder.png"}
              alt="Logo"
              layout="fill"
              objectFit="cover"
              className="rounded-full"
            />
          </div>
          <span className="font-semibold">
            {metadata?.name || `${operator.operator.id.slice(0, 6)}...${operator.operator.id.slice(-4)}`}
          </span>
        </div>
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center">
          <span>{`${operator.operator.id.slice(0, 6)}...${operator.operator.id.slice(-4)}`}</span>
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
      <td className="px-4 py-2">
        <p className="truncate max-w-xs" title={metadata?.description}>
          {metadata?.description || "No description provided"}
        </p>
      </td>
      <td className="px-4 py-2 text-right">{operator.operator.delegatorsCount}</td>
      <td className="px-4 py-2 text-right">{parseFloat(operator.totalWeight).toFixed(2)}</td>
      <td className="px-4 py-2 text-right">{formatDate(operator.createdTimestamp)}</td>
      <td className="px-4 py-2 text-right">{status}</td>
      <td className="px-4 py-2 text-right">{rank}</td>
    </tr>
  );
};

function Operators({ props }: { props: { individualDelegate: string } }) {
  const router = useRouter();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuorum, setSelectedQuorum] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);

  const { loading: queryLoading, error, data, fetchMore } = useQuery(GET_OPERATORS, {
    variables: { avsAddress: props.individualDelegate, skip: 0, first: 100 },
    notifyOnNetworkStatusChange: true,
    context: {
      subgraph: "avs",
    }
  });

  if (data) {
    console.log("data is comingggggg")
  } else {
    console.log("data is not cominggg")
  }

  useEffect(() => {
    if (data?.quorums) {
      const allOperators = data.quorums.flatMap((quorum: any) => quorum.operators);
      setOperators(allOperators);
      setLoading(false);
    }
  }, [data]);

  const loadMoreOperators = useCallback(() => {
    fetchMore({
      variables: {
        skip: operators.length,
        first: 100,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          quorums: prev.quorums.map((prevQuorum: any, index: number) => ({
            ...prevQuorum,
            operators: [...prevQuorum.operators, ...fetchMoreResult.quorums[index].operators],
          })),
        };
      },
    });
  }, [fetchMore, operators.length]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        === document.documentElement.offsetHeight
      ) {
        loadMoreOperators();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreOperators]);

  const handleCopy = (addr: string) => {
    copy(addr);
    toast("Address Copied");
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const filteredOperators = useMemo(() => {
    return operators.filter((operator) => {
      const matchesSearch = operator.operator.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesQuorum = selectedQuorum === null || operator.operator.avsStatuses[0]?.status === selectedQuorum;
      return matchesSearch && matchesQuorum;
    });
  }, [operators, searchQuery, selectedQuorum]);

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
  } else {
    console.log(error)
  }

  return (
    <div>
      <div>
        <h1 className="mt-10 ml-3 font-medium text-3xl">Node Operators</h1>
        <div className="py-8 pe-14 font-poppins">
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
          <div className="mb-4 flex space-x-4">
            <button
              className={`px-4 py-2 rounded ${
                selectedQuorum === 0 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setSelectedQuorum(selectedQuorum === 0 ? null : 0)}
            >
              Quorum 0
            </button>
            <button
              className={`px-4 py-2 rounded ${
                selectedQuorum === 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setSelectedQuorum(selectedQuorum === 1 ? null : 1)}
            >
              Quorum 1
            </button>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="min-w-full bg-midnight-blue overflow-x-auto">
              <thead>
                <tr className="bg-sky-blue bg-opacity-10">
                  <th className="px-4 py-2 text-left">Operator</th>
                  <th className="px-4 py-2 text-left">Address</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-right">Total Stakers</th>
                  <th className="px-4 py-2 text-right">TVL</th>
                  <th className="px-4 py-2 text-right">Opt-in</th>
                  <th className="px-4 py-2 text-right">Status</th>
                  <th className="px-4 py-2 text-right">Rank</th>
                </tr>
              </thead>
              <tbody>
                {filteredOperators.map((operator, index) => (
                  <OperatorRow
                    key={operator.operator.id}
                    operator={operator}
                    router={router}
                    handleCopy={handleCopy}
                    rank={index + 1}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default Operators;