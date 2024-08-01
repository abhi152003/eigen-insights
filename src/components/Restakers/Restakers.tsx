import React, { useState, useEffect, useMemo } from "react";
import { gql, useQuery } from "@apollo/client";
import { ThreeCircles } from "react-loader-spinner";
import { formatDistanceStrict } from "date-fns";
import { IoCopy, IoSearchSharp } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";
import copy from "copy-to-clipboard";

import { FaChevronDown, FaCircleInfo, FaPlus } from "react-icons/fa6";
import { Tooltip } from "@nextui-org/react";

const GET_RESTAKERS = gql`
  query GetRestakers($first: Int!, $skip: Int!) {
    stakers(
      first: $first
      skip: $skip
      orderBy: totalShares
      orderDirection: desc
    ) {
      id
      totalEigenShares
      totalEigenWithdrawalsShares
      totalShares
      totalWithdrawalsShares
    }
  }
`;

const GET_RESTAKER_ACTION = gql`
  query GetRestakerAction($stakerId: String!) {
    stakerActions(
      orderBy: blockTimestamp
      orderDirection: desc
      where: { staker_: { id: $stakerId } }
      first: 1
    ) {
      blockTimestamp
      transactionHash
    }
  }
`;

const ITEMS_PER_PAGE = 10;

const getTimeSince = (timestamp: string) => {
  const date = new Date(parseInt(timestamp) * 1000);
  return formatDistanceStrict(date, new Date(), { addSuffix: true });
};

function Restakers() {
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPageLoaded, setMaxPageLoaded] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { loading, error, data, fetchMore } = useQuery(GET_RESTAKERS, {
    variables: { first: ITEMS_PER_PAGE, skip: 0 },
    context: { subgraph: "avs" },
    notifyOnNetworkStatusChange: true,
  });

  if (data) {
    console.log("dataaaaaaaaaaaa", data);
  }

  useEffect(() => {
    if (data && data.stakers.length < ITEMS_PER_PAGE) {
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
          stakers: [...prev.stakers, ...fetchMoreResult.stakers],
        };
      },
    });

    if (result.data.stakers.length < ITEMS_PER_PAGE) {
      setIsLastPage(true);
    }
    setMaxPageLoaded(page);
  };

  const filteredStakers = useMemo(() => {
    if (!data || !data.stakers) return [];
    return data.stakers.filter((staker: { id: string }) =>
      staker.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const handleSearchChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = async (newPage: number) => {
    await loadMorePages(newPage);
    setCurrentPage(newPage);
  };

  if (loading && !data)
    return (
      <div className="flex items-center justify-center">
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

  return (
    // <div className="container mx-auto pr-6 pl-1">
    //   <div className="overflow-x-auto">
    //     <div className="searchBox my-6">
    //       <input
    //         className="searchInput"
    //         type="text"
    //         name=""
    //         placeholder="Search restaker by address"
    //         value={searchQuery}
    //         onChange={handleSearchChange}
    //       />
    //       <button className="searchButton">
    //         <IoSearchSharp className="iconExplore" />
    //       </button>
    //     </div>
    //     <table className="w-full bg-midnight-blue border border-gray-300">
    //       <thead>
    //         <tr className="bg-sky-blue bg-opacity-10">
    //           <th className="px-4 py-2 border-b text-left">Staker Address</th>
    //           <th className="px-4 py-2 border-b text-left">
    //             <div className="flex items-center gap-2">
    //             <span className="">TVL ETH</span>
    //             <span className="">
    //               <Tooltip
    //                 content={
    //                   <div className="font-poppins p-2 bg-medium-blue text-white rounded-md max-w-[22vw]">
    //                     <span className="text-sm">
    //                       Amount of restaked ETH delegated to operators by
    //                       restaker
    //                     </span>
    //                   </div>
    //                 }
    //                 showArrow
    //                 placement="top"
    //                 delay={1}
    //               >
    //                 <span className="px-2">
    //                   <FaCircleInfo className="cursor-pointer text-[#A7DBF2]" />
    //                 </span>
    //               </Tooltip>
    //             </span>
    //             </div>
    //           </th>
    //           <th className="px-4 py-2 border-b text-left">
    //             <div className="flex gap-2 items-center">
    //             <span>TVL EIGEN</span>
    //             <span className="">
    //               <Tooltip
    //                 content={
    //                   <div className="font-poppins p-2 bg-medium-blue text-white rounded-md max-w-[22vw]">
    //                     <span className="text-sm">
    //                       Amount of restaked EIGEN token delegated to operators
    //                       by restaker
    //                     </span>
    //                   </div>
    //                 }
    //                 showArrow
    //                 placement="top"
    //                 delay={1}
    //               >
    //                 <span className="px-2">
    //                   <FaCircleInfo className="cursor-pointer text-[#A7DBF2]" />
    //                 </span>
    //               </Tooltip>
    //             </span>
    //             </div>
    //           </th>
    //           <th className="px-4 py-2 border-b text-left">Last Action</th>
    //           <th className="px-4 py-2 border-b text-left">Transaction</th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {filteredStakers
    //           .slice(
    //             (currentPage - 1) * ITEMS_PER_PAGE,
    //             currentPage * ITEMS_PER_PAGE
    //           )
    //           .map((staker: { id: React.Key | null | undefined }) => (
    //             <StakerRow key={staker.id} staker={staker} />
    //           ))}
    //       </tbody>
    //     </table>
    //   </div>
    //   <div className="mt-4 flex justify-center gap-5 items-center">
    //     <button
    //       onClick={() => handlePageChange(currentPage - 1)}
    //       disabled={currentPage === 1}
    //       className="p-3 border-[#A7DBF2] border-1 rounded-md px-4
    //           border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000 group"
    //     >
    //       Previous
    //     </button>
    //     <div>{renderPageNumbers()}</div>
    //     <button
    //       onClick={() => handlePageChange(currentPage + 1)}
    //       disabled={isLastPage}
    //       className="p-3 border-[#A7DBF2] border-1 rounded-md px-4
    //           border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000 group"
    //     >
    //       Next
    //     </button>
    //   </div>
    // </div>

    <>
    <div className="container mx-auto px-4">
        <div className="w-full border border-white rounded-lg overflow-hidden">
          <div className="py-4">
            <div className="flex">
              <div className="w-1/4 px-4"><div className="h-6 bg-gray-600 rounded animate-pulse"></div></div>
              <div className="w-1/6 px-4"><div className="h-6 bg-gray-600 rounded animate-pulse"></div></div>
              <div className="w-1/6 px-4"><div className="h-6 bg-gray-600 rounded animate-pulse"></div></div>
              <div className="w-1/6 px-4"><div className="h-6 bg-gray-600 rounded animate-pulse"></div></div>
              <div className="w-1/6 px-4"><div className="h-6 bg-gray-600 rounded animate-pulse"></div></div>
            </div>
          </div>

          {[...Array(10)].map((_, rowIndex) => (
            <div key={rowIndex} className="flex py-3 border-b border-gray-700">
              <div className="w-1/4 px-4 flex items-center">
                <div className="h-5 w-3/4 bg-gray-700 rounded animate-pulse"></div>
                <div className="ml-2 h-5 w-5 bg-gray-600 rounded animate-pulse"></div>
              </div>
              <div className="w-1/6 px-4"><div className="h-5 w-24 bg-gray-700 rounded animate-pulse"></div></div>
              <div className="w-1/6 px-4"><div className="h-5 w-16 bg-gray-700 rounded animate-pulse"></div></div>
              <div className="w-1/6 px-4"><div className="h-5 w-20 bg-gray-700 rounded animate-pulse"></div></div>
              <div className="w-1/6 px-4"><div className="h-5 w-12 bg-gray-700 rounded animate-pulse"></div></div>
            </div>
          ))}
        </div>
      </div>
  
      {/* <div className="mt-6 flex justify-between items-center">
        <div className="w-24 h-10 bg-[#1c3344] rounded animate-pulse"></div>
        <div className="flex gap-2">
          <div className="w-10 h-10 bg-[#1c3344] rounded animate-pulse"></div>
          <div className="w-10 h-10 bg-gray-700 rounded animate-pulse"></div>
          <div className="w-10 h-10 bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="w-24 h-10 bg-[#1c3344] rounded animate-pulse"></div>
      </div> */}
    </>

    // <div className="container mx-auto pr-6 pl-1">
    //   <div className="overflow-x-auto">

    //     {/* Skeleton for table */}
    //     <div className="w-full bg-midnight-blue border border-gray-300">
    //       {/* Skeleton for table header */}
    //       <div className="bg-sky-blue bg-opacity-10">
    //         <div className="flex">
    //           {[...Array(5)].map((_, index) => (
    //             <div key={index} className="px-4 py-2 text-left">
    //               <div className="h-6 w-[10rem] bg-gray-200 rounded animate-pulse"></div>
    //             </div>
    //           ))}
    //         </div>
    //       </div>

    //       {/* Skeleton for table body */}
    //       {[...Array(10)].map((_, rowIndex) => (
    //         <div key={rowIndex} className="flex border-b">
    //           {[...Array(5)].map((_, cellIndex) => (
    //             <div key={cellIndex} className="px-4 py-2 w-1/5">
    //               <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
    //             </div>
    //           ))}
    //         </div>
    //       ))}
    //     </div>
    //   </div>

    //   {/* Skeleton for pagination */}
    //   <div className="mt-4 flex justify-center gap-5 items-center">
    //     <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
    //     <div className="flex gap-2">
    //       {[...Array(5)].map((_, index) => (
    //         <div
    //           key={index}
    //           className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"
    //         ></div>
    //       ))}
    //     </div>
    //     <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
    //   </div>
    // </div>
  );
}

function StakerRow({ staker }: { staker: any }) {
  const { loading, error, data } = useQuery(GET_RESTAKER_ACTION, {
    variables: { stakerId: staker.id },
    context: { subgraph: "avs" },
  });

  // const tvlEth = ((parseFloat(staker.totalShares) - parseFloat(staker.totalWithdrawalsShares)) / 1e18).toFixed(2);
  // const tvlEigen = ((parseFloat(staker.totalEigenShares) - parseFloat(staker.totalEigenWithdrawalsShares)) / 1e18).toFixed(2);

  const tvlEth = (parseFloat(staker.totalShares) / 1e18).toFixed(2);
  const tvlEigen = (parseFloat(staker.totalEigenShares) / 1e18).toFixed(2);

  const handleCopy = (addr: any) => {
    copy(addr);
    toast("Address Copied 🎊");
  };

  return (
    <>
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
      <tr className="">
        <td className="px-4 py-2 border-b">
          <div className="flex items-center">
            <span>
              {staker.id.slice(0, 6)}...{staker.id.slice(-4)}
            </span>
            <span
              className="ml-2 cursor-pointer"
              onClick={(event) => {
                event.stopPropagation();
                handleCopy(staker.id);
              }}
              title="Copy"
            >
              <IoCopy size={16} color="#ffffff" />
            </span>
          </div>
        </td>
        <td className="px-4 py-2 border-b">{tvlEth}</td>
        <td className="px-4 py-2 border-b">{tvlEigen}</td>
        <td className="px-4 py-2 border-b">
          {/* {loading && <span>Loading...</span>}
        {error && <span>Error fetching data</span>} */}
          {data &&
            data.stakerActions[0] &&
            getTimeSince(data.stakerActions[0].blockTimestamp)}
        </td>
        <td className="px-4 py-2 border-b">
          {data && data.stakerActions[0] && (
            <a
              href={`https://etherscan.io/tx/${data.stakerActions[0].transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View
            </a>
          )}
        </td>
      </tr>
    </>
  );
}

export default Restakers;
