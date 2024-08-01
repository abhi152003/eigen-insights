"use client";

import Image, { StaticImageData } from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import search from "@/assets/images/daos/search.png";
import NOLogo from "@/assets/images/daos/operators.png";
import AVSLogo from "@/assets/images/daos/avss.png";
import EILogo from "@/assets/images/daos/eigen_logo.png";
import { IoCopy } from "react-icons/io5";
import copy from "copy-to-clipboard";
import { Button, Dropdown, Pagination, Tooltip } from "@nextui-org/react";
import {
  BallTriangle,
  Oval,
  RotatingLines,
  ThreeCircles,
} from "react-loader-spinner";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import toast, { Toaster } from "react-hot-toast";
import styles from "@/components/IndividualDelegate/DelegateVotes.module.css";
import { FaArrowUp } from "react-icons/fa6";
import { useConnectModal, useChainModal } from "@rainbow-me/rainbowkit";
import dao_abi from "../../artifacts/Dao.sol/GovernanceToken.json";
import { useAccount } from "wagmi";
import WalletAndPublicClient from "@/helpers/signer";
import { IoSearchSharp } from "react-icons/io5";
import Avss from "@/assets/images/sidebar/avss.webp";
import "../../css/SearchShine.css";

interface Result {
  _id: string;
  address: string;
  metadataName: string;
  metadataDescription: string;
  metadataDiscord: string | null;
  metadataLogo: string;
  metadataTelegram: string | null;
  metadataWebsite: string;
  metadataX: string;
  tags: string[];
  shares: any[];
  totalOperators: number;
  totalStakers: number;
  tvl: any;
}

function DelegatesList({ props }: { props: string }) {
  const [delegateData, setDelegateData] = useState<{ delegates: any[] }>({
    delegates: [],
  });
  const [tempData, setTempData] = useState<{ delegates: any[] }>({
    delegates: [],
  });
  const { openChainModal } = useChainModal();
  const { publicClient, walletClient } = WalletAndPublicClient();
  const { openConnectModal } = useConnectModal();
  const { isConnected, address } = useAccount();
  const [searchResults, setSearchResults] = useState<any>({ delegates: [] });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isPageLoading, setPageLoading] = useState<boolean>(true);
  const [isDataLoading, setDataLoading] = useState<boolean>(true);
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const [isShowing, setIsShowing] = useState(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string>("Most stakers");
  // const [circlePosition, setCirclePosition] = useState({ x: 0, y: 0 });
  // const [clickedTileIndex,setClickedTileIndex]=useState(null);
  const [avsData, setAvsData] = useState<any[]>([]);

  const fetchAvsData = useCallback(async () => {
    try {
      const response = await fetch("/api/get-avs-names"); // Adjust this endpoint as needed
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setAvsData(data);
    } catch (error) {
      console.error("Error fetching AVS data:", error);
    }
  }, []);

  useEffect(() => {
    if (props !== "operators") {
      fetchAvsData();
    }
  }, [props, fetchAvsData]);

  const getAvsName = (address: string) => {
    const avs = avsData.find(
      (avs) => avs.avs_contract_address.toLowerCase() === address.toLowerCase()
    );
    if (avs) {
      return avs.avs_name.length > 15
        ? avs.avs_name.slice(0, 15) + "..."
        : avs.avs_name;
    }
    return null;
  };

  const fetchData = useCallback(
    async (
      props: any,
      currentPage: number,
      selectedValue: any,
      setDelegateData: (arg0: (prevData: any) => { delegates: any[] }) => void,
      setTempData: (arg0: (prevData: any) => { delegates: any[] }) => void
    ) => {
      try {
        setDataLoading(true);
        const res = await fetch(
          `/api/get-eigen-data?query=${props}&skip=${currentPage}&limit=25&selectedValue=${selectedValue}`
        );
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          const delegates = data;
          setDelegateData((prevData) => ({
            delegates:
              currentPage === 0
                ? delegates
                : [...prevData.delegates, ...delegates],
          }));
          setTempData((prevData) => ({
            delegates:
              currentPage === 0
                ? delegates
                : [...prevData.delegates, ...delegates],
          }));
        } else {
          console.error(data.message);
        }

        setPageLoading(false);
      } catch (error) {
        console.log(error);
      } finally {
        setDataLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const loadPageData = async () => {
      try {
        await fetchData(
          props,
          currentPage,
          selectedValue,
          setDelegateData,
          setTempData
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    loadPageData();
  }, [currentPage, selectedValue, props, fetchData]);

  const handleSearchChange = async (query: string) => {
    // console.log("query: ", query.length);
    // console.log("queryyyyyyyy",query)
    setSearchQuery(query);
    setPageLoading(true);

    if (query.length > 0) {
      // console.log("Delegate data: ", query, delegateData);
      // console.log(delegateData);
      setIsSearching(true);
      window.removeEventListener("scroll", handleScroll);

      try {
        const res = await fetch(
          `/api/get-search-data?q=${query}&prop=${props}`
        );
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        const data: Result[] | { message: string } = await res.json();
        if (Array.isArray(data)) {
          setDelegateData({ delegates: data });
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Search error:", error);
      }

      setPageLoading(false);
    } else {
      // console.log("in else");
      setIsSearching(false);
      setDelegateData({ ...delegateData, delegates: tempData.delegates });
      setPageLoading(false);
      window.addEventListener("scroll", handleScroll);
    }
  };

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

  const handleScroll = debounce(() => {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    const threshold = 100;
    if (
      !isDataLoading &&
      scrollTop + clientHeight >= scrollHeight - threshold
    ) {
      setCurrentPage((prev) => prev + 25);
    }
  }, 200);

  useEffect(() => {
    if (isSearching === false) {
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const handleCopy = (addr: string) => {
    copy(addr);
    toast("Address Copied 🎊");
  };

  const WalletOpen = async (to: string) => {
    const adr = await walletClient.getAddresses();
    console.log(adr);
    const address1 = adr[0];
    console.log(address1);

    let parts = path.split("/");
    let firstStringAfterSlash = parts[1];

    let chainAddress;
    console.log(delegateData.delegates[0].daoName);

    if (delegateData.delegates[0].daoName === "operators") {
      chainAddress = "0x4200000000000000000000000000000000000042";
    } else if (delegateData.delegates[0].daoName === "avss") {
      chainAddress = "0x912CE59144191C1204E64559FE8253a0e49E6548";
    } else {
      return;
    }
    console.log(chainAddress);

    if (isConnected) {
      if (walletClient.chain?.network === firstStringAfterSlash) {
        const delegateTx = await walletClient.writeContract({
          address: chainAddress,
          abi: dao_abi.abi,
          functionName: "delegate",
          args: [to],
          account: address1,
        });
        console.log(delegateTx);
      } else {
        toast.error("Please switch to appropriate network to delegate!");
        if (openChainModal) {
          openChainModal();
        }
      }
    } else {
      if (openConnectModal) {
        openConnectModal();
      }
    }
  };

  const formatNumber = (number: number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(2) + "m";
    } else if (number >= 1000) {
      return (number / 1000).toFixed(2) + "k";
    } else {
      return 0;
    }
  };

  const handleSelectChange = async (event: { target: { value: any } }) => {
    const value = event.target.value;
    setSelectedValue(value);
    setCurrentPage(0);
    setDelegateData({ delegates: [] });
    setTempData({ delegates: [] });
    setDataLoading(true);
    setPageLoading(true);
    await fetchData(props, 0, value, setDelegateData, setTempData);
    setDataLoading(false);
    setPageLoading(false);
  };

  const scrollToSection = (sectionId: string, duration = 1000) => {
    const section = document.getElementById(sectionId);

    if (section) {
      const startingY = window.scrollY;
      const targetY = section.offsetTop - 250;
      const distance = targetY - startingY;
      const startTime = performance.now();

      function scrollStep(timestamp: any) {
        const elapsed = timestamp - startTime;

        window.scrollTo(
          0,
          startingY + easeInOutQuad(elapsed, 0, distance, duration)
        );

        if (elapsed < duration) {
          requestAnimationFrame(scrollStep);
        }
      }

      function easeInOutQuad(t: any, b: any, c: any, d: any) {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
      }

      requestAnimationFrame(scrollStep);
    }
  };

  console.log("delegateDataaaaaaa", delegateData);

  const handleClick = (address: any) => {
    if (props === "operators") {
      window.open(`https://app.eigenlayer.xyz/operator/${address}`);
    } else if (props === "avss") {
      window.open(`/avss/${address}?active=operators`);
    }
  };

  const formatTVL = (value: number): string => {
    if (!value) return "0";

    const absValue = Math.abs(value);

    // Function to round to 2 decimal places
    const roundToTwo = (num: number): number => {
      return Math.round(num * 100) / 100;
    };

    if (absValue >= 1000000) {
      // For millions, use 'm'
      const millions = absValue / 1000000;
      return roundToTwo(millions).toFixed(2) + "m";
    } else if (absValue >= 1000) {
      // For thousands, use 'k'
      const thousands = absValue / 1000;
      return roundToTwo(thousands).toFixed(2) + "k";
    }

    // For values less than 1000, just round to 2 decimal places
    return roundToTwo(absValue).toFixed(2);
  };

  return (
    <div>
      <div className="flex items-center justify-between pe-10">
        <div className="searchBox searchShineWidthOfAVSs">
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
        <div>
          <select
            className="rounded-full py-2 px-4 outline-none bg-medium-blue cursor-pointer"
            onChange={handleSelectChange}
          >
            <option className="bg-deep-blue text-white">Most stakers</option>
            <option className="bg-deep-blue text-white">Random</option>
          </select>
        </div>
      </div>

      <div className="py-8 pe-10 font-poppins">
        {isPageLoading ? (
          // <div className="flex items-center justify-center">
          //   <ThreeCircles
          //     visible={true}
          //     height="50"
          //     width="50"
          //     color="#FFFFFF"
          //     ariaLabel="three-circles-loading"
          //     wrapperStyle={{}}
          //     wrapperClass=""
          //   />
          // </div>
          <div className="grid min-[475px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 gap-10">
            {[...Array(9)].map((_, index) => (
              <div
                key={index}
                className="px-5 py-7 rounded-2xl flex flex-col justify-between cursor-pointer relative bg-midnight-blue"
                style={{
                  boxShadow: "0px 4px 50.8px 0px rgba(0, 0, 0, 0.11)",
                }}
              >
                <div className="flex items-center justify-around animate-pulse">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-gray-400 rounded-full"></div>
                  </div>
                  <div className="text-left">
                    <div className="py-3">
                      <div className="w-32 h-6 bg-gray-400 rounded mb-2"></div>
                      <div className="flex justify-start items-center gap-2 pb-2 pt-1">
                        <div className="w-24 h-4 bg-gray-400 rounded"></div>
                        <div className="h-4 w-4 bg-gray-400 rounded"></div>
                      </div>
                      <div className="text-sm border border-gray-300 py-2 px-1 rounded-lg w-full">
                        <div className="w-28 h-5 bg-gray-400 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="w-full h-10 bg-gray-400 rounded mt-4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : delegateData.delegates.length > 0 ? (
          <div>
            <div className="grid min-[475px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 gap-10">
              {delegateData.delegates.map((daos: any, index: number) => (
                <div
                  onClick={(event) => {
                    // handleMouseMove(event,index);
                    router.push(`/${props}/${daos.address}?active=info  `);
                  }}
                  key={index}
                  style={{
                    boxShadow: "0px 4px 50.8px 0px rgba(0, 0, 0, 0.11)",
                  }}
                  className="px-5 py-7 rounded-2xl flex flex-col justify-between cursor-pointer relative bg-midnight-blue"
                >
                  <div className="flex items-center justify-around">
                    <div className="flex justify-center">
                      <Image
                        src={
                          daos.metadataLogo == null
                            ? props == "operators"
                              ? Avss
                              : props == "avss"
                              ? Avss
                              : ""
                            : daos.metadataLogo
                        }
                        alt="Image not found"
                        width={100}
                        height={100}
                        className="rounded-full"
                        style={{ width: "4rem", height: "4rem" }}
                      ></Image>

                      <Image
                        src={EILogo}
                        alt="EigenInsights Logo"
                        className="absolute top-7 right-4"
                        style={{
                          width: "35px",
                          height: "35px",
                          marginTop: "-20px",
                          marginRight: "-5px",
                        }}
                      />
                    </div>
                    <div className="text-left">
                      <div className="py-3">
                        {props === "operators" ? (
                          <div
                            className={`font-semibold overflow-hidden ${styles.desc}`}
                          >
                            {daos.metadataName == null ? (
                              <span>
                                {daos.address.slice(0, 6) +
                                  "..." +
                                  daos.address.slice(-4)}
                              </span>
                            ) : (
                              <span>
                                {daos.metadataName.length > 15
                                  ? daos.metadataName.slice(0, 15) + "..."
                                  : daos.metadataName}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div
                            className={`font-semibold overflow-hidden ${styles.desc}`}
                          >
                            {getAvsName(daos.address) ||
                              (daos.metadataName == null
                                ? daos.address.slice(0, 6) +
                                  "..." +
                                  daos.address.slice(-4)
                                : daos.metadataName.length > 15
                                ? daos.metadataName.slice(0, 15) + "..."
                                : daos.metadataName)}
                          </div>
                        )}

                        <div className="flex justify-start items-center gap-2 pb-2 pt-1">
                          {daos.address.slice(0, 6) +
                            "..." +
                            daos.address.slice(-4)}
                          <Tooltip
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
                          </Tooltip>
                        </div>
                        <div className="text-sm border border-[#D9D9D9] py-2 px-1 rounded-lg w-full">
                          <span className="text-light-cyan font-semibold">
                            {formatTVL(Number(daos.totalStakers))}&nbsp;
                          </span>
                          total stakers
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div>
                      <button
                        className=" text-white font-poppins w-full rounded-[4px] text-sm btnStake
                        p-3 border-[#A7DBF2] border-1 px-6 
              border-b-4 font-medium overflow-hidden py-2 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group"
                        onClick={() => {
                          handleClick(daos.address);
                        }}
                      >
                        {props === "operators" ? (
                          <span className="hover-text">Delegate</span>
                        ) : (
                          <span className="hover-text">Stake</span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div style={{ zIndex: "21474836462" }}>
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
                </div>
              ))}
            </div>

            {isDataLoading && props === "operators" && (
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

      <div className="fixed right-5 bottom-5 cursor-pointer">
        <div
          className="bg-light-blue p-3 rounded-full"
          onClick={() => scrollToSection("secondSection")}
        >
          <FaArrowUp size={25} color="white" />
        </div>
      </div>
    </div>
  );
}

export default DelegatesList;
