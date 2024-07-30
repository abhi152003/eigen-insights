import React, { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import Image from "next/image";
import { IoCopy } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";
import copy from "copy-to-clipboard";
import { formatDistanceStrict } from "date-fns";
import Link from "next/link";
import "../../css/AvsHistory.css";
import { useRouter } from "next-nprogress-bar";

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

interface AVSAction {
  avs?: {
    id: string;
    metadataURI: string;
  };
  blockTimestamp: string;
  blockNumber: string;
  transactionHash: string;
  type: string;
  status?: number;
  quorum?: {
    quorum?: {
      quorum?: number;
      avs?: {
        id: string;
        metadataURI: string;
      };
    };
  };
}

interface AVSMetadata {
  logo: string;
  name: string;
  website: string;
  description: string;
  twitter: string;
}

const GET_OPERATOR_HISTORY = gql`
  query MyQuery($operatorId: String!, $skip: Int!, $first: Int!) {
    operatorActions(
      where: {
        operator_: { id: $operatorId }
        type_not_in: [
          DelegatorDelegated
          DelegatorUndelegated
          DetailsModified
          MetadataURIUpdated
        ]
      }
      orderBy: blockTimestamp
      orderDirection: desc
      skip: $skip
      first: $first
    ) {
      type
      blockTimestamp
      quorum {
        quorum {
          quorum
          createdTimestamp
          avs {
            id
            metadataURI
          }
        }
      }
      avs {
        id
        metadataURI
      }
      status
      transactionHash
      blockNumber
    }
  }
`;

const ITEMS_PER_PAGE = 20;

function OperatorHistory({ props }: { props: Type }) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [maxPageLoaded, setMaxPageLoaded] = useState<number>(1);
  const [isLastPage, setIsLastPage] = useState<boolean>(false);
  const [actionsWithMetadata, setActionsWithMetadata] = useState<AVSAction[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataFetched, setDataFetched] = useState<boolean>(false);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([1]));

  const { loading, error, data, fetchMore } = useQuery(GET_OPERATOR_HISTORY, {
    variables: {
      operatorId: props.individualDelegate,
      skip: 0,
      first: ITEMS_PER_PAGE,
    },
    context: {
      subgraph: "avs",
    },
  });

  if (data) {
    console.log(data);
  }

  useEffect(() => {
    if (data && data.operatorActions.length < ITEMS_PER_PAGE) {
      setIsLastPage(true);
    }
  }, [data]);

  const fetchMetadata = async (uri: string): Promise<AVSMetadata | null> => {
    try {
      const url = `/api/get-avs-metadata?url=${encodeURIComponent(uri)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching metadata from ${uri}:`, error);
      return null;
    }
  };

  useEffect(() => {
    if (data) {
      const fetchedItemsCount = data.operatorActions.length;
      setIsLastPage(fetchedItemsCount < ITEMS_PER_PAGE);

      const fetchAllMetadata = async () => {
        const actionsWithMetadata = await Promise.all(
          data.operatorActions.map(async (action: AVSAction) => {
            const metadataURI =
              action.avs?.metadataURI ||
              action.quorum?.quorum?.avs?.metadataURI;
            const metadata = metadataURI
              ? await fetchMetadata(metadataURI)
              : null;
            return { ...action, metadata };
          })
        );
        setActionsWithMetadata(actionsWithMetadata);
        setIsLoading(false);
        setDataFetched(true);
      };
      fetchAllMetadata();
    }
  }, [data]);

  const loadMorePages = async (page: number) => {
    if (loadedPages.has(page)) return;

    const result = await fetchMore({
      variables: {
        skip: (page - 1) * ITEMS_PER_PAGE,
        first: ITEMS_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          operatorActions: [
            ...prev.operatorActions,
            ...fetchMoreResult.operatorActions,
          ],
        };
      },
    });

    setLoadedPages((prevLoadedPages) => new Set(prevLoadedPages).add(page));

    const fetchedItemsCount = result.data.operatorActions.length;
    setIsLastPage(fetchedItemsCount < ITEMS_PER_PAGE);
    setMaxPageLoaded(Math.max(maxPageLoaded, page));
  };

  const handlePageChange = async (newPage: number) => {
    await loadMorePages(newPage);
    setCurrentPage(newPage);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return formatDistanceStrict(date, new Date(), { addSuffix: true });
  };

  const getEventType = (action: AVSAction) => {
    if (action.type === "AddedToQuorum") return "Join Quorum";
    if (action.type === "RemovedFromQuorum") return "Left Quorum";
    if (action.type === "AVSRegistrationStatusUpdated" && action.status === 1)
      return "Join AVS";
    if (action.type === "AVSRegistrationStatusUpdated" && action.status === 0)
      return "Left AVS";
    if (action.type === "Registered") return "Registration";
    return action.type;
  };

  const getDescription = (action: AVSAction) => {
    if (action.type === "AddedToQuorum")
      return `Joined Quorum ${action.quorum?.quorum?.quorum}`;
    if (action.type === "RemovedFromQuorum")
      return `Left Quorum ${action.quorum?.quorum?.quorum}`;
    if (action.type === "AVSRegistrationStatusUpdated" && action.status === 1)
      return "Joined AVS";
    if (action.type === "AVSRegistrationStatusUpdated" && action.status === 0)
      return "Left AVS";
    if (action.type === "Registered") return "Operator Registered";
    return action.type;
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

  if (isLoading && !dataFetched) {
    return (
      <div className="container mx-auto px-4 marginSetter">
        <div className="overflow-x-auto">
          <table className="w-full bg-midnight-blue">
            <thead>
              <tr className="bg-sky-blue bg-opacity-10 animate-pulse">
                {["Event", "AVS", "Description", "Age", "Block", "TxHash"].map(
                  (header) => (
                    <th key={header} className="px-4 py-2 text-left">
                      <div className="h-4 bg-gray-400 rounded w-20"></div>
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {[...Array(20)].map((_, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-400 animate-pulse"
                >
                  <td className="px-4 py-2">
                    <div className="h-6 bg-gray-400 rounded w-24"></div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gray-400 rounded-full mr-2"></div>
                      <div className="h-4 bg-gray-400 rounded w-24"></div>
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
        </div>
      </div>
    );
  }

  if (error) return <p>Error: {error.message}</p>;

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
      {dataFetched && actionsWithMetadata.length === 0 ? (
        <div className="flex flex-col justify-center items-center pt-10">
          <div className="text-5xl">☹️</div>
          <div className="pt-4 font-semibold text-lg">No results found.</div>
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full bg-midnight-blue">
              <thead>
                <tr className="bg-sky-blue bg-opacity-10">
                  <th className="px-4 py-2 text-left">Event</th>
                  <th className="px-4 py-2 text-left">AVS</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Age</th>
                  <th className="px-4 py-2 text-left">Block</th>
                  <th className="px-4 py-2 text-left">TxHash</th>
                </tr>
              </thead>
              <tbody>
                {actionsWithMetadata
                  .slice(
                    (currentPage - 1) * ITEMS_PER_PAGE,
                    currentPage * ITEMS_PER_PAGE
                  )
                  .map(
                    (
                      action: AVSAction & { metadata?: AVSMetadata },
                      index: number
                    ) => (
                      <tr
                        key={index}
                        className="border-b border-gray-700 hover:bg-sky-blue hover:bg-opacity-5 transition-colors duration-150"
                      >
                        <td className="px-4 py-2">
                          <span
                            className={`px-4 py-1 rounded whitespace-nowrap ${
                              getEventType(action).includes("Join") ||
                              getEventType(action).includes("Registration")
                                ? "bg-green-200 text-green-900"
                                : "bg-red-200 text-red-900"
                            }`}
                          >
                            {getEventType(action)}
                          </span>
                        </td>
                        <td
                          className="px-4 py-2 cursor-pointer whitespace-nowrap"
                          onClick={() =>
                            router.push(
                              `/avss/${
                                action.avs?.id || action.quorum?.quorum?.avs?.id
                              }?active=info`
                            )
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <div className="relative w-8 h-8 flex-shrink-0">
                              {action.type != "Registered" && (
                                <Image
                                  src={
                                    action.metadata?.logo ?? "/placeholder.png"
                                  }
                                  alt="AVS Logo"
                                  layout="fill"
                                  objectFit="cover"
                                  className="rounded-full"
                                />
                              )}
                            </div>
                            <span className="text-light-cyan">
                              {action.metadata?.name || ""}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {getDescription(action)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {formatTimestamp(action.blockTimestamp)}
                        </td>
                        <td className="px-4 py-2">{action.blockNumber}</td>
                        <td className="px-4 py-2">
                          <a
                            href={`https://etherscan.io/tx/${action.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {`${action.transactionHash.slice(
                              0,
                              6
                            )}...${action.transactionHash.slice(-4)}`}
                          </a>
                        </td>
                      </tr>
                    )
                  )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center gap-5 items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-3 border-[#A7DBF2] border-1 rounded-md px-6 
          border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000 group"
            >
              Previous
            </button>
            <div>{renderPageNumbers()}</div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={isLastPage}
              className="p-3 border-[#A7DBF2] border-1 rounded-md px-6 
          border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000 group"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OperatorHistory;
