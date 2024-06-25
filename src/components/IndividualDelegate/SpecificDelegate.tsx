"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import user from "@/assets/images/daos/profile.png";
import { FiExternalLink } from "react-icons/fi";
import { BiSolidMessageRoundedDetail } from "react-icons/bi";
import { IoCopy } from "react-icons/io5";
import DelegateInfo from "./DelegateInfo";
import DelegateSessions from "./DelegateSessions";
import DelegateOfficeHrs from "./DelegateOfficeHrs";
import copy from "copy-to-clipboard";
import { Tooltip } from "@nextui-org/react";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
// import { Provider, cacheExchange, createClient, fetchExchange } from "urql";
import WalletAndPublicClient from "@/helpers/signer";
import dao_abi from "../../artifacts/Dao.sol/GovernanceToken.json";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useConnectModal, useChainModal } from "@rainbow-me/rainbowkit";
import { useNetwork } from "wagmi";
import NOLogo from "@/assets/images/daos/operators.png";
import AVSLogo from "@/assets/images/daos/avss.png";
import EILogo from "@/assets/images/daos/eigen_logo.png";
import { Oval, Rings, ThreeCircles } from "react-loader-spinner";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import { getEnsNameOfUser } from "../ConnectWallet/ENSResolver";
import "../../css/ConnectWallet.css";
import { FaTelegram } from "react-icons/fa";
import { FaXTwitter, FaDiscord } from "react-icons/fa6";
import OperatorsAnalytics from "./OperatorsAnalytics";

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

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

function SpecificDelegate({ props }: { props: Type }) {
  const { publicClient, walletClient } = WalletAndPublicClient();
  const { chain, chains } = useNetwork();
  console.log(chain?.name);
  const { openChainModal } = useChainModal();
  const [delegateInfo, setDelegateInfo] = useState<any>();
  const router = useRouter();
  const path = usePathname();
  console.log(path);
  const searchParams = useSearchParams();
  const [selfDelegate, setSelfDelegate] = useState<boolean>();
  const [isDelegate, setIsDelegate] = useState<boolean>();
  const addressFromUrl = path.split("/")[2];
  const [isPageLoading, setIsPageLoading] = useState(true);
  console.log("Props", props.daoDelegates);
  const [displayName, setDisplayName] = useState("");
  const [displayImage, setDisplayImage] = useState("");
  const [description, setDescription] = useState("");
  // const provider = new ethers.BrowserProvider(window?.ethereum);
  const [displayEnsName, setDisplayEnsName] = useState<string>();

  const [socials, setSocials] = useState({
    twitter: "",
    discord: "",
    telegram: "",
    website: "",
  });

  useEffect(() => {
    console.log("Network", chain?.network);
    const fetchData = async () => {
      setIsPageLoading(true);

      let details: Result | undefined;

      try {
        const fetchDetails = async (query: string, prop: string) => {
          try {
            const res = await fetch(
              `/api/get-search-data?q=${query}&prop=${prop}`
            );
            if (!res.ok) {
              throw new Error(`Error: ${res.status}`);
            }
            const data: Result[] | { message: string } = await res.json();
            if (Array.isArray(data)) {
              return data[0];
            } else {
              console.error(data.message);
              return undefined;
            }
          } catch (error) {
            console.error("Search error:", error);
            return undefined;
          }
        };

        if (
          props.daoDelegates === "operators" ||
          props.daoDelegates === "avss"
        ) {
          details = await fetchDetails(
            props.individualDelegate,
            props.daoDelegates
          );
          setDelegateInfo(details);
        }

        if (details) {
          if (addressFromUrl.toLowerCase() === details.address.toLowerCase()) {
            setIsDelegate(true);
          }

          setSocials({
            twitter: details.metadataX || "",
            telegram: details.metadataTelegram || "",
            discord: details.metadataDiscord || "",
            website: details.metadataWebsite || "",
          });
        }

        setIsPageLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, []);

  // useEffect(() => {
  //   const checkDelegateStatus = async () => {
  //     setIsPageLoading(true);
  //     //   const addr = await walletClient.getAddresses();
  //     //   const address1 = addr[0];
  //     let delegateTxAddr = "";
  //     const contractAddress = ""
  //     try {
  //       const delegateTx = await publicClient.readContract({
  //         address: contractAddress,
  //         abi: dao_abi.abi,
  //         functionName: "delegates",
  //         args: [addressFromUrl],
  //         // account: address1,
  //       });
  //       console.log("Delegate tx", delegateTx);
  //       delegateTxAddr = delegateTx;
  //       if (delegateTxAddr.toLowerCase() === addressFromUrl?.toLowerCase()) {
  //         console.log("Delegate comparison: ", delegateTx, addressFromUrl);
  //         setSelfDelegate(true);
  //       }
  //       setIsPageLoading(false);
  //     } catch (error) {
  //       console.error("Error in reading contract", error);
  //       setIsPageLoading(false);
  //     }
  //   };
  //   checkDelegateStatus();
  // }, []);

  // if (isPageLoading) {
  //   return null;
  // }

  // if (!isDelegate && !selfDelegate && !isPageLoading) {
  //   return <div>No such Delegate for this address</div>;
  // }

  const formatNumber = (number: number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(2) + "m";
    } else if (number >= 1000) {
      return (number / 1000).toFixed(2) + "k";
    } else {
      return number;
    }
  };

  const handleCopy = (addr: string) => {
    copy(addr);
    toast("Address Copied");
  };

  const handleClick = () => {
    if (props.daoDelegates === "operators") {
      window.open(
        `https://app.eigenlayer.xyz/operator/${props.individualDelegate}`
      );
    } else if (props.daoDelegates === "avss") {
      window.open(`https://app.eigenlayer.xyz/avs/${props.individualDelegate}`);
    }
  };

  // const handleDelegateVotes = async (to: string) => {
  //   let address;
  //   let address1;

  //   try {
  //     address = await walletClient.getAddresses();
  //     address1 = address[0];
  //   } catch (error) {
  //     console.error("Error getting addresses:", error);
  //     toast.error("Please connect your MetaMask wallet!");
  //     return;
  //   }

  //   if (!address1) {
  //     toast.error("Please connect your MetaMask wallet!");
  //     return;
  //   }

  //   console.log(address);
  //   console.log(address1);

  //   let chainAddress;

  //   console.log("walletClient?.chain?.network", walletClient?.chain?.network);

  //   if (walletClient?.chain === "") {
  //     toast.error("Please connect your wallet!");
  //   } else {
  //     if (walletClient?.chain?.network === props.daoDelegates) {
  //       const delegateTx = await walletClient.writeContract({
  //         address: chainAddress,
  //         abi: dao_abi.abi,
  //         functionName: "delegate",
  //         args: [to],
  //         account: address1,
  //       });

  //       console.log(delegateTx);
  //     } else {
  //       toast.error("Please switch to appropriate network to delegate!");

  //       if (openChainModal) {
  //         openChainModal();
  //       }
  //     }
  //   }
  // };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       // Fetch data from your backend API to check if the address exists

  //       console.log("Fetching from DB");
  //       // const dbResponse = await axios.get(`/api/profile/${address}`);

  //       const myHeaders = new Headers();
  //       myHeaders.append("Content-Type", "application/json");

  //       const raw = JSON.stringify({
  //         address: props.individualDelegate,
  //         daoName: props.daoDelegates,
  //       });

  //       const requestOptions: any = {
  //         method: "POST",
  //         headers: myHeaders,
  //         body: raw,
  //         redirect: "follow",
  //       };
  //       const res = await fetch(
  //         `/api/profile/${props.individualDelegate}`,
  //         requestOptions
  //       );

  //       const dbResponse = await res.json();
  //       console.log("db Response", dbResponse);
  //       if (
  //         dbResponse &&
  //         Array.isArray(dbResponse.data) &&
  //         dbResponse.data.length > 0
  //       ) {
  //         // Iterate over each item in the response data array
  //         for (const item of dbResponse.data) {
  //           // Check if address and daoName match
  //           // console.log("Item: ", item);

  //           // if (
  //           //   item.daoName === dao &&
  //           //   item.address === props.individualDelegate
  //           // ) {
  //           // console.log("Data found in the database", item);
  //           // Data found in the database, set the state accordingly
  //           // setResponseFromDB(true);
  //           setDisplayImage(item.image);
  //           setDescription(item.description);
  //           setDisplayName(item.displayName);
  //           // setEmailId(item.emailId);

  //           setSocials({
  //             twitter: item.socialHandles.twitter,
  //             discord: item.socialHandles.discord,
  //             discourse: item.socialHandles.discourse,
  //             website: item.socialHandles.website,
  //           });
  //           // Exit the loop since we found a match
  //           //   break;
  //           // }
  //         }
  //       } else {
  //         console.log(
  //           "Data not found in the database, fetching from third-party API"
  //         );
  //         // Data not found in the database, fetch data from the third-party API
  //       }
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };

  //   fetchData();
  // }, [chain, props.individualDelegate]);

  // useEffect(() => {
  //   const fetchEnsName = async () => {
  //     const ensName = await getEnsNameOfUser(props.individualDelegate);
  //     setDisplayEnsName(ensName);
  //   };
  //   fetchEnsName();
  // }, [chain, props.individualDelegate]);

  console.log(delegateInfo);
  return (
    <>
      {isPageLoading && (
        <div className="flex items-center justify-center h-screen">
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
      )}
      {!(isPageLoading || (!isDelegate && !selfDelegate)) ? (
        <div className="font-poppins">
          <div className="flex ps-14 py-5 justify-between">
            <div className="flex">
              {/* <Image
            src={delegateInfo?.profilePicture || user}
            alt="user"
            width={256}
            height={256}
            className="w-40 rounded-3xl"
          /> */}
              <div
                className="mt-5 relative object-cover h-40 rounded-3xl"
                style={{
                  backgroundColor: "#fcfcfc",
                  border: "2px solid #E9E9E9 ",
                }}
              >
                <div className="w-50 h-50 flex items-center justify-content ">
                  <div className="flex justify-center items-center w-40 h-40">
                    <Image
                      src={
                        displayImage
                          ? `https://gateway.lighthouse.storage/ipfs/${displayImage}`
                          : delegateInfo?.metadataLogo ||
                            (props.daoDelegates === "operators"
                              ? NOLogo
                              : props.daoDelegates === "avss"
                              ? AVSLogo
                              : EILogo)
                      }
                      alt="user"
                      layout="fill"
                      objectFit="cover"
                      className={
                        displayImage || delegateInfo?.metadataLogo
                          ? "w-50 h-50 rounded-3xl"
                          : "w-20 h-20 rounded-3xl"
                      }
                    />
                  </div>

                  <Image
                    src={EILogo}
                    alt="EigenInsights Logo"
                    className="absolute top-0 right-0"
                    style={{
                      width: "30px",
                      height: "30px",
                      marginTop: "10px",
                      marginRight: "10px",
                    }}
                  />
                </div>
              </div>
              <div className="px-4">
                <div className="flex items-center py-1">
                  <div className="font-bold text-lg pr-4">
                    {delegateInfo?.metadataName ||
                      delegateInfo.metadataName ||
                      displayName || (
                        <>
                          {props.individualDelegate.slice(0, 6)}...
                          {props.individualDelegate.slice(-4)}
                        </>
                      )}
                  </div>
                  <div className="flex gap-3 mt-2">
                    {/* {socials.discord + socials.discourse + socials.website + socials.twitter} */}
                    <Link
                      href={socials.twitter}
                      className={`border-[0.5px] border-white rounded-full h-fit p-1 ${
                        socials.twitter == "" ? "hidden" : ""
                      }`}
                      style={{ backgroundColor: "black" }}
                      target="_blank"
                    >
                      <div className="rounded-full bg-gray text-black p-[6px] hover:text-white hover:cursor-pointer hover:bg-black hover:scale-125">
                        <FaXTwitter color="white" className="w-2 h-2" />
                      </div>
                    </Link>
                    <Link
                      href={socials.telegram}
                      className={`border-[0.5px] border-white rounded-full h-fit p-1  ${
                        socials.telegram == "" ? "hidden" : ""
                      }`}
                      style={{ backgroundColor: "black" }}
                      target="_blank"
                    >
                      <div className="  rounded-full bg-black text-black p-[6px] hover:bg-[#34ABE2] hover:text-white hover:cursor-pointer hover:scale-125">
                        <FaTelegram color="white" className="w-2 h-2" />
                      </div>
                    </Link>
                    <Link
                      href={socials.discord}
                      className={`border-[0.5px] border-white rounded-full h-fit p-1 ${
                        socials.discord == "" ? "hidden" : ""
                      }`}
                      style={{ backgroundColor: "black" }}
                      target="_blank"
                    >
                      <div className="  bg-black rounded-full text-black p-[6px] hover:bg-[#5562EA] hover:text-white hover:cursor-pointer hover:scale-125">
                        <FaDiscord color="white" className="w-2 h-2" />
                      </div>
                    </Link>
                    <Link
                      href={socials.website}
                      className={`border-[0.5px] border-white rounded-full h-fit p-1 ${
                        socials.website == "" ? "hidden" : ""
                      }`}
                      style={{ backgroundColor: "black" }}
                      target="_blank"
                    >
                      <div className="  rounded-full bg-black text-black p-[6px] hover:bg-pink-500 hover:text-white hover:cursor-pointer hover:scale-125">
                        <FiExternalLink color="white" className="w-2 h-2" />
                      </div>
                    </Link>
                    <div>
                      {props.daoDelegates === "operators" ? (
                        <button
                          className="bg-midnight-blue font-bold text-white rounded-full px-8 py-1 -mt-1 btnShineWallet"
                          onClick={() => handleClick()}
                        >
                          Delegate
                        </button>
                      ) : (
                        <button
                          className="bg-midnight-blue font-bold text-white rounded-full px-8 py-1 -mt-1 btnShineWallet"
                          onClick={() => handleClick()}
                        >
                          Stake
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center py-1">
                  <div>
                    {props.individualDelegate.slice(0, 6)} ...{" "}
                    {props.individualDelegate.slice(-4)}
                  </div>

                  <Tooltip
                    content="Copy"
                    placement="right"
                    closeDelay={1}
                    showArrow
                    className="text-white bg-light-blue"
                  >
                    <span className="px-2 cursor-pointer">
                      <IoCopy
                        onClick={() => handleCopy(props.individualDelegate)}
                      />
                    </span>
                  </Tooltip>
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

                <div className="flex gap-3 py-1">
                  <div>
                    <div className="text-white border-[0.5px] border-[#D9D9D9] rounded-md px-3 py-1 mb-5">
                      <span className="text-light-cyan font-semibold">
                        {delegateInfo?.totalStakers
                          ? Number(delegateInfo?.totalStakers)
                          : 0}
                        &nbsp;
                      </span>
                      total stakers
                    </div>
                    <div className="text-white border-[0.5px] border-[#D9D9D9] rounded-md px-3 py-1">
                      TVL
                      <span className="text-light-cyan font-semibold">
                        &nbsp;
                        {delegateInfo?.tvl.tvl
                          ? parseFloat((delegateInfo?.tvl.tvl).toFixed(2))
                          : 0}
                        &nbsp;
                      </span>
                      ETH
                    </div>
                  </div>

                  <div>
                    {props.daoDelegates === "avss" && (
                      <div className="text-white border-[0.5px] border-[#D9D9D9] rounded-md px-3 py-1 mb-5">
                        <span className="text-light-cyan font-semibold">
                          {delegateInfo?.totalOperators
                            ? Number(delegateInfo?.totalOperators)
                            : 0}
                          &nbsp;
                        </span>
                        total operators
                      </div>
                    )}
                    <div className="text-white border-[0.5px] border-[#D9D9D9] rounded-md px-3 py-1">
                      TVL Restaked
                      <span className="text-light-cyan font-semibold">
                        &nbsp;
                        {delegateInfo?.tvl.tvl
                          ? parseFloat(
                              (delegateInfo?.tvl.tvlRestaking).toFixed(2)
                            )
                          : 0}
                        &nbsp;
                      </span>
                      ETH
                    </div>
                  </div>
                </div>

                {/* <div className="pt-2">
                  <button
                    className="bg-midnight-blue font-bold text-white rounded-full px-8 py-[10px] btnShineWallet"
                    onClick={() =>
                      handleDelegateVotes(`${props.individualDelegate}`)
                    }
                  >
                    Stake
                  </button>
                </div> */}
              </div>
            </div>
            <div className="pr-[2.2rem]">
              <ConnectWalletWithENS />
            </div>
          </div>

          {/* <div className="flex gap-12 pl-16 justify-center">
            
          </div> */}

          <div className="ml-0 my-2 pl-16 py-4 flex gap-12 justify-start text-base bg-[#D9D9D945]">
            <button
              className={`p-3 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000  group
                ${
                  searchParams.get("active") === "info"
                    ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3] "
                    : "text-white border-white"
                }`}
              onClick={() => router.push(path + "?active=info")}
            >
              Info
            </button>
            {props.daoDelegates === 'avss' ? (
              <button
                className={`p-3 border-[#A7DBF2] border-1 rounded-full px-6 
                border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000  group
                  ${
                    searchParams.get("active") === "analytics"
                      ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3] "
                      : "text-white border-white"
                  }`}
                onClick={() => router.push(path + "?active=analytics")}
              >
                Analytics
              </button>
            ) : (
              ""
            )} 
            <button
              className={`p-3 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000  group
                ${
                  searchParams.get("active") === "delegatesSession"
                    ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3] "
                    : "text-white border-white"
                }`}
              onClick={() =>
                router.push(path + "?active=delegatesSession&session=book")
              }
            >
              Sessions
            </button>
            <button
              className={`p-3 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000  group
                ${
                  searchParams.get("active") === "officeHours"
                    ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3] "
                    : "text-white border-white"
                }`}
              onClick={() =>
                router.push(path + "?active=officeHours&hours=ongoing")
              }
            >
              Office Hours
            </button>
          </div>

          <div className="py-6 ps-16">
            {searchParams.get("active") === "info" && (
              <DelegateInfo
                props={props}
                delegateInfo={delegateInfo}
                desc={delegateInfo.metadataDescription}
              />
            )}
            {searchParams.get("active") === "analytics" && (
              <OperatorsAnalytics />
            )}
            {searchParams.get("active") === "delegatesSession" && (
              <DelegateSessions props={props} />
            )}
            {searchParams.get("active") === "officeHours" && (
              <DelegateOfficeHrs props={props} />
            )}
          </div>
        </div>
      ) : (
        !isPageLoading &&
        !isDelegate &&
        !selfDelegate && (
          <div className="flex flex-col justify-center items-center w-full h-screen">
            <div className="text-5xl">☹️</div>{" "}
            <div className="pt-4 font-semibold text-lg">
              Oops, no such result available!
            </div>
          </div>
        )
      )}
    </>
  );
}

export default SpecificDelegate;
