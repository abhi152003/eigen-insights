import { useRouter } from "next-nprogress-bar";
import React, { useCallback, useEffect, useState } from "react";
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

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

function Operators({ props }: { props: Type }) {
  const [isDataLoading, setDataLoading] = useState<boolean>(false);
  const router = useRouter();
  const [avsOperators, setAVSOperators] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    if (!hasMore || isDataLoading) return;

    setDataLoading(true);
    const options = { method: "GET" };
    const avsOperatorsRes = await fetch(
      `https://api.eigenexplorer.com/avs/${props.individualDelegate}/operators?withTvl=true&skip=${currentPage}&take=12`,
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

  console.log("avs addresssssss", props.individualDelegate)

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
        console.log("dataaaaaaaaa", data)
        setAVSOperators(data)
      } catch (error) {
        console.error("Search error:", error);
      }
    } else {
      // console.log("in else");
      console.log("data not comingggggg")
      // setDelegateData({ ...delegateData, delegates: tempData.delegates });
      window.addEventListener("scroll", handleScroll);
    }
  };
  console.log("avsssssss", avsOperators);
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
              <div className="searchBox searchShineWidthOfAVSs mb-5">
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
              <table className="min-w-full bg-midnight-blue overflow-x-auto">
                <thead>
                  <tr className="bg-sky-blue bg-opacity-10">
                    <th className="px-4 py-2 text-left">Operator</th>
                    <th className="px-4 py-2 text-left">Address</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-right">Total Stakers</th>
                    <th className="px-4 py-2 text-right">ETH Restaked</th>
                    <th className="px-4 py-2 text-right">EIGEN Restaked</th>
                    <th className="px-4 py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {avsOperators.map((dao, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-700 hover:bg-sky-blue hover:bg-opacity-5 cursor-pointer transition-colors duration-150"
                      onClick={() =>
                        router.push(`/operators/${dao.address}?active=info`)
                      }
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
                              ? `${dao.address.slice(
                                  0,
                                  6
                                )}...${dao.address.slice(-4)}`
                              : dao.metadataName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center">
                          <span>{`${dao.address.slice(
                            0,
                            6
                          )}...${dao.address.slice(-4)}`}</span>
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
                        <p
                          className="truncate max-w-xs"
                          title={dao.metadataDescription}
                        >
                          {dao.metadataDescription || "No description provided"}
                        </p>
                      </td>
                      <td className="px-4 py-2 text-right">
                        {dao.totalStakers}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {dao.tvl.tvlStrategies.ETHx.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {dao.tvl.tvlStrategies.Eigen.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        Active
                      </td>
                    </tr>
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
