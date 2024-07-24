// import React, { useEffect, useState } from "react";
// import { gql, useQuery } from "@apollo/client";
// import { ThreeCircles } from "react-loader-spinner";
// import { useRouter } from "next-nprogress-bar";
// import toast, { Toaster } from "react-hot-toast";
// import { formatDistanceStrict } from "date-fns";

// interface Type {
//   daoDelegates: string;
//   individualDelegate: string;
// }

// const GET_DATA = gql`
//   query MyQuery($id: ID!, $skip: Int!, $first: Int!) {
//     avsactions(
//       where: { avs_: { id: $id } }
//       orderBy: blockTimestamp
//       orderDirection: desc
//       skip: $skip
//       first: $first
//     ) {
//       type
//       blockTimestamp
//       operator {
//         id
//       }
//       blockNumber
//       transactionHash
//       quorumNumber
//     }
//   }
// `;

// const GET_TOTAL_COUNT = gql`
//   query GetTotalCount($id: ID!, $first: Int!) {
//     avsactions(
//       where: { avs_: { id: $id } }
//       first: $first
//     ) {
//       id
//     }
//   }
// `;

// const ITEMS_PER_PAGE = 10;
// const MAX_ITEMS_TO_FETCH = 5000; // Adjust this value based on your needs and API limitations

// function AvsHistory({ props }: { props: Type }) {
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [totalItems, setTotalItems] = useState<number>(0);
//   const router = useRouter();
//   const avsId = props.individualDelegate;

//   const { loading: countLoading, data: countData } = useQuery(GET_TOTAL_COUNT, {
//     variables: { id: avsId, first: MAX_ITEMS_TO_FETCH },
//     context: { subgraph: "avs" }
//   });

//   const { loading: dataLoading, error, data } = useQuery(GET_DATA, {
//     variables: {
//       id: avsId,
//       skip: (currentPage - 1) * ITEMS_PER_PAGE,
//       first: ITEMS_PER_PAGE
//     },
//     context: {
//       subgraph: "avs"
//     }
//   });

//   useEffect(() => {
//     if (countData) {
//       setTotalItems(countData.avsactions.length);
//     }
//   }, [countData]);

//   if (countLoading || dataLoading)
//     return (
//       <div className="flex items-center justify-center">
//         <ThreeCircles
//           visible={true}
//           height="50"
//           width="50"
//           color="#FFFFFF"
//           ariaLabel="three-circles-loading"
//           wrapperStyle={{}}
//         />
//       </div>
//     );
//   if (error) {
//     console.error("GraphQL Error:", error);
//     return <p>Error: {error.message}</p>;
//   }

//   const formatTimestamp = (timestamp: string) => {
//     const date = new Date(parseInt(timestamp) * 1000);
//     return formatDistanceStrict(date, new Date(), { addSuffix: true });
//   };

//   const formatActionType = (type: string, quorumNumber: any) => {
//     if (type === "OperatorRemovedFromQuorum") {
//       return `Left Quorum ${quorumNumber}`;
//     }
//     if (type === "OperatorRemoved") {
//       return "Left AVS";
//     }
//     if (type === "OperatorAddedToQuorum") {
//       return `Joined Quorum ${quorumNumber}`;
//     }
//     if (type === "OperatorAdded") {
//       return "Joined AVS";
//     }
//     return type;
//   };

//   const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

//   const handlePageChange = (newPage: number) => {
//     setCurrentPage(newPage);
//   };

//   return (
//     <div>
//       <Toaster />
//       <div className="py-8 pe-14 font-poppins">
//         <div className="w-full overflow-x-auto">
//           <table className="min-w-full bg-midnight-blue overflow-x-auto">
//             <thead>
//               <tr className="bg-sky-blue bg-opacity-10">
//                 <th className="px-4 py-2 text-left">Event</th>
//                 <th className="px-4 py-2 text-left">Operator</th>
//                 <th className="px-4 py-2 text-left">Age</th>
//                 <th className="px-4 py-2 text-left">Block Number</th>
//                 <th className="px-4 py-2 text-left">Transaction Hash</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.avsactions.map((action: any, index: number) => (
//                 <tr
//                   key={index}
//                   className="border-b border-gray-700 hover:bg-sky-blue hover:bg-opacity-5 cursor-pointer transition-colors duration-150"
//                 >
//                   <td className="px-3 py-2 whitespace-nowrap">
//                     {formatActionType(action.type, action.quorumNumber)}
//                   </td>
//                   <td
//                     className="px-3 py-2 whitespace-nowrap"
//                     onClick={() =>
//                       router.push(
//                         `/operators/${action.operator.id}?active=info`
//                       )
//                     }
//                   >
//                     {action.operator.id}
//                   </td>
//                   <td className="px-3 py-2 whitespace-nowrap">
//                     {formatTimestamp(action.blockTimestamp)}
//                   </td>
//                   <td className="px-3 py-2">{action.blockNumber}</td>
//                   <td
//                     className="px-3 py-2 whitespace-nowrap"
//                     onClick={() =>
//                       window.open(
//                         `https://etherscan.io/tx/${action.transactionHash}`,
//                         "_blank"
//                       )
//                     }
//                   >
//                     {action.transactionHash}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         <div className="mt-4 flex justify-between items-center">
//           <button
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//             className="px-4 py-2 bg-sky-blue text-white rounded disabled:opacity-50"
//           >
//             Previous
//           </button>
//           <span>
//             Page {currentPage} of {totalPages}
//           </span>
//           <button
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             className="px-4 py-2 bg-sky-blue text-white rounded disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AvsHistory;

import React, { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { ThreeCircles } from "react-loader-spinner";
import { useRouter } from "next-nprogress-bar";
import toast, { Toaster } from "react-hot-toast";
import { formatDistanceStrict, formatDistanceToNow } from "date-fns";

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
        const isDisabled = i > maxPageLoaded || (i === maxPageLoaded && isLastPage);
        pageNumbers.push(
          <button
            key={i}
            onClick={() => !isDisabled && handlePageChange(i)}
            className={`px-3 py-1 mx-1 rounded ${
              i === currentPage
                ? "bg-gray-800 text-white"
                : isDisabled
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-gray-200 text-gray-700"
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

  return (
    <div className="container mx-auto px-4">
      <Toaster />
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
                  className="border-b border-gray-700 hover:bg-sky-blue hover:bg-opacity-5 cursor-pointer transition-colors duration-150"
                >
                  <td className="px-4 py-2">
                    <span
                      className={`px-4 py-1 rounded ${
                        action?.type?.includes("Added")
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
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
                  <td className="px-4 py-2">
                    {/* {action?.operator?.id} */}
                    {action?.operator?.id.slice(0, 6)}{" "}
                      ... {action?.operator?.id.slice(-4)}
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
                      {`${action?.transactionHash.slice(
                        0,
                        6
                      )}...${action?.transactionHash.slice(-4)}`}
                    </a>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <div>{renderPageNumbers()}</div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={isLastPage}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AvsHistory;