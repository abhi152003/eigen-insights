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
import { IoCopy } from "react-icons/io5";
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
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-3 gap-10">
                {avsOperators.map((daos: any, index: number) => (
                  <div
                    key={index}
                    onClick={() =>
                      router.push(`/operators/${daos.address}?active=info`)
                    }
                    className="p-5 rounded-2xl flex flex-col justify-between cursor-pointer relative bg-midnight-blue h-full"
                    style={{
                      boxShadow: "0px 4px 50.8px 0px rgba(0, 0, 0, 0.11)",
                    }}
                  >
                    <div className="absolute top-2 right-2">
                      <Image
                        src={EILogo}
                        alt="EigenInsights Logo"
                        width={35}
                        height={35}
                      />
                    </div>

                    <div className="flex items-center mb-4">
                      <div className="relative w-20 h-20 flex-shrink-0 mr-4">
                        <Image
                          src={
                            daos.metadataLogo ??
                            (props.daoDelegates === "operators"
                              ? NOLogo
                              : props.daoDelegates === "avss"
                              ? AVSLogo
                              : "")
                          }
                          alt="Logo"
                          layout="fill"
                          objectFit="cover"
                          className="rounded-full"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {daos.metadataName ??
                            `${daos.address.slice(0, 6)}...${daos.address.slice(
                              -4
                            )}`}
                        </h3>
                        <div className="flex justify-start items-center gap-2 pb-2 pt-1">
                          {daos.address.slice(0, 6) +
                            "..." +
                            daos.address.slice(-4)}
                          <CopyToolTip
                            content="Copy"
                            placement="right"
                            closeDelay={1}
                            showArrow
                            className="bg-sky-blue"
                          >
                            <span className="cursor-pointer text-sm">
                              <IoCopy
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleCopy(daos.address);
                                }}
                              />
                            </span>
                          </CopyToolTip>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col flex-grow">
                      {daos.metadataDescription ? (
                        <p className="text-sm flex-grow mb-6 line-clamp-3 border-t-1 pt-2 border-[#a0a0a0]">
                          {daos.metadataDescription}
                        </p>
                      ) : (
                        <p className="text-sm flex-grow mb-6 line-clamp-3 border-t-1 pt-2 border-[#a0a0a0]">
                          No description provided
                        </p>
                      )}

                      <div className="text-sm border-1 border-[#a0a0a0] py-2 px-2  w-full mb-2 text-left">
                        <span className="text-light-cyan font-semibold">
                          {daos.totalStakers}&nbsp;
                        </span>
                        Total Stakers
                      </div>
                      <div className="text-sm border-1 border-[#a0a0a0] py-2 px-2  w-full mb-2 text-left">
                        <span className="text-light-cyan font-semibold">
                          {daos.tvl.tvlStrategies.ETHx.toFixed(2)}&nbsp;
                        </span>
                        ETH Restaked
                      </div>
                      <div className="text-sm border-1 border-[#a0a0a0] py-2 px-2 w-full mb-2 text-left">
                        <span className="text-light-cyan font-semibold">
                          {daos.tvl.tvlStrategies.Eigen.toFixed(2)}&nbsp;
                        </span>
                        EIGEN Restaked
                      </div>
                    </div>
                  </div>
                ))}
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
              {isDataLoading && (
                <div className="flex items-center justify-center my-4">
                  <BallTriangle
                    height={70}
                    width={70}
                    radius={5}
                    color="#FFFFFF"
                    ariaLabel="ball-triangle-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                    visible={true}
                  />
                </div>
              )}
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
