import React, { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { ThreeCircles } from "react-loader-spinner";
import { useRouter } from "next-nprogress-bar";
import { formatDistanceStrict, formatDistanceToNow } from "date-fns";
import { IoCopy } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";
import copy from "copy-to-clipboard";
import "../../css/AvsHistory.css";

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

const GET_DATA = gql`
  query MyQuery($id: ID!, $skip: Int!, $first: Int!) {
    avsactions(
      where: { avs_: { id: $id } }
      orderBy: blockTimestamp
      orderDirection: desc
      skip: $skip
      first: $first
    ) {
      type
      blockTimestamp
      operator {
        id
      }
      blockNumber
      transactionHash
      quorumNumber
    }
  }
`;

const ITEMS_PER_PAGE = 20;

function AvsHistory({ props }: { props: Type }) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [maxPageLoaded, setMaxPageLoaded] = useState<number>(1);
  const [isLastPage, setIsLastPage] = useState<boolean>(false);
  const router = useRouter();
  const avsId = props.individualDelegate;

  const { loading, error, data, fetchMore } = useQuery(GET_DATA, {
    variables: {
      id: avsId,
      skip: 0,
      first: ITEMS_PER_PAGE,
    },
    context: {
      subgraph: "avs",
    },
  });

  useEffect(() => {
    if (data && data.avsactions.length < ITEMS_PER_PAGE) {
      setIsLastPage(true);
    }
  }, [data]);

  const loadMorePages = async (page: number) => {
    if (page <= maxPageLoaded) return;

    const result = await fetchMore({
      variables: {
        skip: (page - 1) * ITEMS_PER_PAGE,
        first: ITEMS_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          avsactions: [...prev.avsactions, ...fetchMoreResult.avsactions],
        };
      },
    });

    if (result.data.avsactions.length < ITEMS_PER_PAGE) {
      setIsLastPage(true);
    }
    setMaxPageLoaded(page);
  };

  const handlePageChange = async (newPage: number) => {
    await loadMorePages(newPage);
    setCurrentPage(newPage);
  };

  if (loading)
    return (
      <div className="flex justify-center">
        <ThreeCircles
          visible={true}
          height="50"
          width="50"
          color="#FFFFFF"
          ariaLabel="three-circles-loading"
        />
      </div>
    );
  if (error) return <p>Error: {error.message}</p>;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return formatDistanceStrict(date, new Date(), { addSuffix: true });
  };

  const formatActionType = (type: string, quorumNumber: string) => {
    switch (type) {
      case "OperatorRemovedFromQuorum":
        return `Left quorum ${quorumNumber}`;
      case "OperatorRemoved":
        return "Left AVS";
      case "OperatorAddedToQuorum":
        return `Join quorum ${quorumNumber}`;
      case "OperatorAdded":
        return "Join AVS";
      default:
        return type;
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.max(maxPageLoaded, currentPage + 2); i++) {
      if (
        i === 1 ||
        i === maxPageLoaded ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        const isDisabled =
          i > maxPageLoaded || (i === maxPageLoaded && isLastPage);
        pageNumbers.push(
          <button
            key={i}
            onClick={() => !isDisabled && handlePageChange(i)}
            className={`px-3 py-1 mx-1 rounded ${
              i === currentPage
                ? "bg-gray-500 text-white"
                : isDisabled
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-gray-200 text-gray-600"
            }`}
            disabled={isDisabled}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pageNumbers.push(<span key={i}>...</span>);
      }
    }
    return pageNumbers;
  };

  const handleCopy = (addr: any) => {
    copy(addr);
    toast("Address Copied 🎊");
  };

  return (
    <div className="container mx-auto px-4 marginSetter">
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
      <div className="overflow-x-auto">
        <table className="w-full bg-midnight-blue">
          <thead>
            <tr className="bg-sky-blue bg-opacity-10">
              <th className="px-4 py-2 text-left">Event</th>
              <th className="px-4 py-2 text-left">Operator</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Age</th>
              <th className="px-4 py-2 text-left">Block</th>
              <th className="px-4 py-2 text-left">TxHash</th>
            </tr>
          </thead>
          <tbody>
            {data.avsactions
              .slice(
                (currentPage - 1) * ITEMS_PER_PAGE,
                currentPage * ITEMS_PER_PAGE
              )
              .map((action: any, index: number) => (
                <tr
                  key={index}
                  className="border-b border-gray-700 hover:bg-sky-blue hover:bg-opacity-5 transition-colors duration-150"
                >
                  <td className="px-4 py-2">
                    <span
                      className={`px-4 py-1 rounded ${
                        action?.type?.includes("Added")
                          ? "bg-green-200 text-green-900"
                          : "bg-red-200 text-red-900"
                      }`}
                    >
                      {action?.type?.includes("Quorum")
                        ? action?.type?.includes("Added")
                          ? "Join quorum"
                          : "Left quorum"
                        : action?.type?.includes("Added")
                        ? "Join AVS"
                        : "Left AVS"}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex items-center text-light-cyan">
                    {action?.operator?.id.slice(0, 6)}{" "}
                      ... {action?.operator?.id.slice(-4)}
                  <span
                      className="ml-2 cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleCopy(action?.operator?.id);
                      }}
                      title="Copy"
                    >
                      <IoCopy size={16} color="#ffffff" />
                  </span>
                  </td>
                  <td className="px-4py-2">
                    {formatActionType(action?.type, action?.quorumNumber)}
                  </td>
                  <td className="px-4 py-2">
                    {formatTimestamp(action?.blockTimestamp)}
                  </td>
                  <td className="px-4 py-2">{action?.blockNumber}</td>
                  <td className="px-4 py-2">
                    <a
                      href={`https://etherscan.io/tx/${action?.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      <span className="">
                      {`${action?.transactionHash.slice(
                        0,
                        6
                      )}...${action?.transactionHash.slice(-4)}`}
                      </span>
                    </a>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* <div className="overflow-x-auto">
        <table className="w-full bg-midnight-blue">
          <thead>
            <tr className="bg-sky-blue bg-opacity-10 animate-pulse">
              {[
                "Event",
                "Operator",
                "Description",
                "Age",
                "Block",
                "TxHash",
              ].map((header) => (
                <th key={header} className="px-4 py-2 text-left">
                  <div className="h-4 bg-gray-400 rounded w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(20)].map((_, index) => (
              <tr key={index} className="border-b border-gray-400 animate-pulse">
                <td className="px-4 py-2">
                  <div className="h-6 bg-gray-400 rounded w-24"></div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <div className="h-4 bg-gray-400 rounded w-24"></div>
                    <div className="ml-2 h-4 w-4 bg-gray-400 rounded-full"></div>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="h-4 bg-gray-400 rounded w-32"></div>
                </td>
                <td className="px-4 py-2">
                  <div className="h-4 bg-gray-400 rounded w-20"></div>
                </td>
                <td className="px-4 py-2">
                  <div className="h-4 bg-gray-400 rounded w-16"></div>
                </td>
                <td className="px-4 py-2">
                  <div className="h-4 bg-gray-400 rounded w-24"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}

      <div className="mt-4 flex justify-center gap-5 items-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-3 border-[#A7DBF2] border-1 rounded-md px-4
              border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000 group"
        >
          Previous
        </button>
        <div>{renderPageNumbers()}</div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={isLastPage}
          className="p-3 border-[#A7DBF2] border-1 rounded-md px-4 
              border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000 group"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AvsHistory;
