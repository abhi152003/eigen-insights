import { useRouter } from "next-nprogress-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BallTriangle, ThreeCircles } from "react-loader-spinner";
import Image from "next/image";
import NOLogo from "@/assets/images/daos/operators.png";
import AVSLogo from "@/assets/images/daos/avss.png";
import EILogo from "@/assets/images/daos/eigen_logo.png";
import {
  Button,
  Dropdown,
  Pagination,
  Tooltip as CopyToolTip,
} from "@nextui-org/react";
import { IoCopy, IoSearchSharp } from "react-icons/io5";
import copy from "copy-to-clipboard";
import toast, { Toaster } from "react-hot-toast";
import { gql, useQuery } from "@apollo/client";
import { NextRouter } from "next/router";

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

interface TVL {
  tvlStrategies: {
    ETHx: number;
    Eigen: number;
  };
}

interface Dao {
  address: string;
  metadataLogo: string;
  metadataName: string;
  metadataDescription: string;
  totalStakers: number;
  tvl: TVL;
  createdAt: string;
}

interface OperatorRowProps {
  dao: Dao;
  avsId: string;
  router: ReturnType<typeof useRouter>;
  handleCopy: (address: string) => void;
}

const GET_DATA = gql`
  query MyQuery($avsId: String!, $operatorId: String!) {
    avsoperatorStatuses(
      orderBy: lastUpdatedTimestamp
      orderDirection: desc
      where: { avs_: { id: $avsId }, operator_: { id: $operatorId } }
    ) {
      lastUpdatedTimestamp
      status
      operator {
        id
      }
    }
  }
`;

const OperatorRow: React.FC<
  OperatorRowProps & { selectedOption: "ETH" | "EIGEN" | null }
> = ({ dao, avsId, router, handleCopy, selectedOption }) => {
  const { loading, error, data } = useQuery(GET_DATA, {
    variables: { avsId, operatorId: dao.address },
    context: {
      subgraph: "avs",
    },
  });

  let status = data?.avsoperatorStatuses[0]?.status || "";

  if (status === 0) {
    status = "Inactive";
  } else if (status === 1) {
    status = "Active";
  }

  const formatDate = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
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

  return (
    <tr
      className="border-b border-gray-700 hover:bg-sky-blue hover:bg-opacity-5 cursor-pointer transition-colors duration-150 whitespace-nowrap"
      onClick={() => router.push(`/operators/${dao.address}?active=info`)}
    >
      <td className="px-4 py-2">
        <div className="flex items-center">
          <div className="relative w-10 h-10 flex-shrink-0 mr-3">
            <Image
              src={dao.metadataLogo ?? "/placeholder.png"}
              alt="Logo"
              layout="fill"
              objectFit="cover"
              className="rounded-full"
            />
          </div>
          <span className="font-semibold">
            {dao.metadataName === ""
              ? `${dao.address.slice(0, 6)}...${dao.address.slice(-4)}`
              : dao.metadataName}
          </span>
        </div>
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center">
          <span>{`${dao.address.slice(0, 6)}...${dao.address.slice(-4)}`}</span>
          <span
            className="ml-2 cursor-pointer"
            onClick={(event) => {
              event.stopPropagation();
              handleCopy(dao.address);
            }}
            title="Copy address"
          >
            <IoCopy size={16} />
          </span>
        </div>
      </td>
      <td className="px-4 py-2">
        <p className="truncate max-w-xs" title={dao.metadataDescription}>
          {dao.metadataDescription || "No description provided"}
        </p>
      </td>
      <td className="px-4 py-2 text-right">{dao.totalStakers}</td>
      {!selectedOption || selectedOption === "ETH" ? (
        <td className="px-4 py-2 text-right">
          {dao.tvl.tvlStrategies.ETHx.toFixed(2)}
        </td>
      ) : null}
      {!selectedOption || selectedOption === "EIGEN" ? (
        <td className="px-4 py-2 text-right">
          {dao.tvl.tvlStrategies.Eigen.toFixed(2)}
        </td>
      ) : null}
      <td className="px-4 py-2 text-right">{formatDate(dao.createdAt)}</td>
      <td className="px-4 py-2 text-right">{status}</td>
    </tr>
  );
};

function Operators({ props }: { props: Type }) {
  const [isDataLoading, setDataLoading] = useState<boolean>(false);
  const router = useRouter();
  const [avsOperators, setAVSOperators] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<"ETH" | "EIGEN" | null>(
    "ETH"
  );

  const fetchData = useCallback(async () => {
    if (!hasMore || isDataLoading) return;

    setDataLoading(true);
    const options = { method: "GET" };
    const avsOperatorsRes = await fetch(
      `https://api.eigenexplorer.com/avs/${props.individualDelegate}/operators?withTvl=true&skip=${currentPage}&take=261`,
      options
    );

    const newAvsOperators = await avsOperatorsRes.json();

    if (newAvsOperators.data.length === 0) {
      setHasMore(false);
    } else {
      setAVSOperators((prevOperators) => [
        ...prevOperators,
        ...newAvsOperators.data,
      ]);
      setCurrentPage((prevPage) => prevPage + 12);
    }

    setDataLoading(false);
    setInitialLoad(false);
  }, [currentPage, hasMore, isDataLoading]);

  useEffect(() => {
    if (initialLoad) {
      fetchData();
    }
  }, [fetchData, initialLoad]);

  const debounce = (
    func: { (): void; apply?: any },
    delay: number | undefined
  ) => {
    let timeoutId: string | number | NodeJS.Timeout | undefined;
    return (...args: any) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(null, args);
      }, delay);
    };
  };

  const handleScroll = useCallback(() => {
    if (initialLoad) return;

    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    const threshold = 100;
    if (
      scrollTop + clientHeight >= scrollHeight - threshold &&
      !isDataLoading
    ) {
      fetchData();
    }
  }, [fetchData, initialLoad, isDataLoading]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const handleCopy = (addr: string) => {
    copy(addr);
    toast("Address Copied");
  };

  const [searchQuery, setSearchQuery] = useState("");

  console.log("avs addresssssss", props.individualDelegate);

  const handleSearchChange = async (query: string) => {
    // console.log("query: ", query.length);
    // console.log("queryyyyyyyy",query)
    setSearchQuery(query);

    if (query.length > 0) {
      // console.log("Delegate data: ", query, delegateData);
      // console.log(delegateData);
      window.removeEventListener("scroll", handleScroll);

      try {
        const res = await fetch(
          `/api/search-avs-operators?q=${query}&avsAddress=${props.individualDelegate}`
        );
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        const data = await res.json();
        console.log("dataaaaaaaaa", data);
        setAVSOperators(data);
      } catch (error) {
        console.error("Search error:", error);
      }
    } else {
      // console.log("in else");
      console.log("data not comingggggg");
      // setDelegateData({ ...delegateData, delegates: tempData.delegates });
      window.addEventListener("scroll", handleScroll);
    }
  };
  console.log("avsssssss", avsOperators);

  const filteredAndSortedOperators = useMemo(() => {
    if (!selectedOption) return avsOperators;

    return avsOperators
      .filter((dao) => {
        const value =
          selectedOption === "ETH"
            ? dao.tvl.tvlStrategies.ETHx
            : dao.tvl.tvlStrategies.Eigen;
        return value > 0;
      })
      .sort((a, b) => {
        const valueA =
          selectedOption === "ETH"
            ? a.tvl.tvlStrategies.ETHx
            : a.tvl.tvlStrategies.Eigen;
        const valueB =
          selectedOption === "ETH"
            ? b.tvl.tvlStrategies.ETHx
            : b.tvl.tvlStrategies.Eigen;
        return valueB - valueA;
      });
  }, [avsOperators, selectedOption]);

  const avsId = props.individualDelegate;

  return (
    <div>
      <div>
        <h1 className="mt-10 ml-3 font-medium text-3xl">Node Operators</h1>
        <div className="py-8 pe-14 font-poppins">
          {initialLoad ? (
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
          ) : avsOperators.length > 0 ? (
            <div className="w-full overflow-x-auto">
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
                    selectedOption === "ETH"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() =>
                    setSelectedOption(selectedOption === "ETH" ? null : "ETH")
                  }
                >
                  Quorum 0
                </button>
                <button
                  className={`px-4 py-2 rounded ${
                    selectedOption === "EIGEN"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() =>
                    setSelectedOption(
                      selectedOption === "EIGEN" ? null : "EIGEN"
                    )
                  }
                >
                  Quorum 1
                </button>
              </div>
              <table className="min-w-full bg-midnight-blue overflow-x-auto">
                <thead>
                  <tr className="bg-sky-blue bg-opacity-10">
                    <th className="px-4 py-2 text-left">Operator</th>
                    <th className="px-4 py-2 text-left">Address</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-right">Total Stakers</th>
                    {!selectedOption || selectedOption === "ETH" ? (
                      <th className="px-4 py-2 text-right">ETH Restaked</th>
                    ) : null}
                    {!selectedOption || selectedOption === "EIGEN" ? (
                      <th className="px-4 py-2 text-right">EIGEN Restaked</th>
                    ) : null}
                    <th className="px-4 py-2 text-right">Opt-in</th>
                    <th className="px-4 py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedOperators.map((dao, index) => (
                    <OperatorRow
                      key={index}
                      dao={dao}
                      avsId={avsId}
                      router={router}
                      handleCopy={handleCopy}
                      selectedOption={selectedOption}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center pt-10">
              <div className="text-5xl">☹️</div>{" "}
              <div className="pt-4 font-semibold text-lg">
                Oops, no such result available!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Operators;
