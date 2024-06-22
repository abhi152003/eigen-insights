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
import { Oval, RotatingLines } from "react-loader-spinner";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import toast, { Toaster } from "react-hot-toast";
import styles from "@/components/IndividualDelegate/DelegateVotes.module.css";
import { FaArrowUp } from "react-icons/fa6";
import { useConnectModal, useChainModal } from "@rainbow-me/rainbowkit";
import dao_abi from "../../artifacts/Dao.sol/GovernanceToken.json";
import { useAccount } from "wagmi";
import WalletAndPublicClient from "@/helpers/signer";

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
  const [delegateData, setDelegateData] = useState<{ delegates: any[] }>({ delegates: [] });
  const [tempData, setTempData] = useState<{ delegates: any[] }>({ delegates: [] });
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

  const fetchData = useCallback(
    async (props: any, currentPage: number, selectedValue: any, setDelegateData: (arg0: (prevData: any) => { delegates: any[]; }) => void, setTempData: (arg0: (prevData: any) => { delegates: any[]; }) => void) => {
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
            delegates: currentPage === 0 ? delegates : [...prevData.delegates, ...delegates],
          }));
          setTempData((prevData) => ({
            delegates: currentPage === 0 ? delegates : [...prevData.delegates, ...delegates],
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
        await fetchData(props, currentPage, selectedValue, setDelegateData, setTempData);
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
        const res = await fetch(`/api/get-search-data?q=${query}&prop=${props}`);
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        const data: Result[] | { message: string } = await res.json();
        if (Array.isArray(data)) {
          setDelegateData({ delegates: data });;
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error('Search error:', error);
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

  const debounce = (func: { (): void; apply?: any; }, delay: number | undefined) => {
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
    if (!isDataLoading && scrollTop + clientHeight >= scrollHeight - threshold) {
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
    toast("Address Copied");
  };
  // const handleMouseMove = (event:any,index:any) => {
  //   const rect = event.currentTarget.getBoundingClientRect();
  //   const x = event.clientX - rect.left;
  //   const y = event.clientY - rect.top;

  //   setCirclePosition({ x, y });
  //   setClickedTileIndex(index);
  //   console.log(circlePosition);
      
  //   setTimeout(() => {
  //     setClickedTileIndex(null);
  //   }, 1500); // Adjust the time as needed


  // };


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

  const handleSelectChange = async (event: { target: { value: any; }; }) => {
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

  console.log("delegateDataaaaaaa",delegateData);

  return (
    <div>
      <div className="flex items-center justify-between pe-10">
        <div
          style={{ background: "rgba(238, 237, 237, 0.36)" }}
          className="flex border-[0.5px] border-black w-1/3 rounded-full my-3 font-poppins"
        >
          <input
            type="text"
            placeholder="Search by Address or ENS Name"
            style={{ background: "rgba(238, 237, 237, 0.36)" }}
            className="pl-5 pr-3 rounded-full outline-none w-full"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          ></input>
          <span className="flex items-center bg-black rounded-full px-5 py-2">
            <Image src={search} alt="search" width={20} />
          </span>
        </div>
        <div>
          <select
            style={{ background: "rgba(238, 237, 237, 0.36)" }}
            className="rounded-full py-2 px-4 outline-none cursor-pointer"
            onChange={handleSelectChange}
          >
            <option>Most stakers</option>
            <option>Random</option>
          </select>
        </div>
      </div>

      <div className="py-8 pe-10 font-poppins">
        {isPageLoading ? (
          <div className="flex items-center justify-center">
            <Oval
              visible={true}
              height="40"
              width="40"
              color="#0500FF"
              secondaryColor="#cdccff"
              ariaLabel="oval-loading"
            />
          </div>
        ) : delegateData.delegates.length > 0 ? (
          <div> 
            <div className="grid min-[475px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-10">
              {delegateData.delegates.map((daos: any, index: number) => (
                <div
                  onClick={(event) =>{
                    // handleMouseMove(event,index);
                    router.push(`/${props}/${daos.address}?active=info  `)
                  }}
                  key={index}
                  style={{
                    boxShadow: "0px 4px 50.8px 0px rgba(0, 0, 0, 0.11)",
                  }}
                  
                  className="px-5 py-7 rounded-2xl flex flex-col justify-between cursor-pointer relative"
                >
                  {/* {clickedTileIndex === index && (
                    <div
                    className="absolute bg-blue-200 rounded-full animate-ping"
                    style={{
                    width: "30px",
                    height: "30px",
                    left: `${circlePosition.x -10}px`,
                    top: `${circlePosition.y - 10}px`,
                    zIndex: "9999",
                   }}
                   ></div>
                  )} */}
                  <div>
                    <div className="flex justify-center relative">
                      <Image
                        src={
                          daos.metadataLogo == null
                            ? props == "operators"
                              ? NOLogo
                              : props == "avss"
                              ? AVSLogo
                              : ""
                            : daos.metadataLogo
                        }
                        alt="Image not found"
                        width={80}
                        height={80}
                        // layout="fixed"
                        className="rounded-full"
                        style={{ width: '80px', height: '80px' }} 
                      ></Image>

                      <Image
                        src={EILogo}
                        alt="EigenInsights Logo"
                        className="absolute top-0 right-0"
                        style={{
                          width: "35px",
                          height: "35px",
                          marginTop: "-20px",
                          marginRight: "-5px",
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <div className="py-3">
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
                        <div className="flex justify-center items-center gap-2 pb-2 pt-1">
                          {daos.address.slice(0, 6) +
                            "..." +
                            daos.address.slice(-4)}
                          <Tooltip
                            content="Copy"
                            placement="right"
                            closeDelay={1}
                            showArrow
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
                          <span className="text-blue-shade-200 font-semibold">
                            {daos.totalStakers}&nbsp;
                          </span>
                          total stakers
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div>
                      <button
                        className="bg-blue-shade-100 text-white font-poppins w-full rounded-[4px] text-sm py-1 font-medium"
                        onClick={(event) => {
                          event.stopPropagation(); // Prevent event propagation to parent container
                          WalletOpen(daos.address);
                        }}
                      >
                        Delegate
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
            
            {isDataLoading && (
              <div className="flex items-center justify-center my-4">
                <RotatingLines
                  visible={true}
                  width="40"
                  strokeColor="#0500FF"
                  ariaLabel="oval-loading"
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
          className="bg-blue-shade-100 p-3 rounded-full"
          onClick={() => scrollToSection("secondSection")}
        >
          <FaArrowUp size={25} color="white" />
        </div>
      </div>
    </div>
  );
}

export default DelegatesList;
