"use client";

import Image from "next/image";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import copy from "copy-to-clipboard";
import { Tooltip } from "@nextui-org/react";
import user from "@/assets/images/daos/user3.png";
import { BiSolidMessageRoundedDetail } from "react-icons/bi";
import { IoCopy } from "react-icons/io5";
import UserInfo from "./UserInfo";
import UserSessions from "./UserSessions";
import UserOfficeHours from "./UserOfficeHours";
import ClaimNFTs from "./ClaimNFTs";
import { FaPencil } from "react-icons/fa6";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import NOLogo from "@/assets/images/daos/operators.png"
import AVSLogo from "@/assets/images/daos/avss.png"
import EILogo from "@/assets/images/daos/eigen_logo.png";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useNetwork } from "wagmi";
import WalletAndPublicClient from "@/helpers/signer";
import dao_abi from "../../artifacts/Dao.sol/GovernanceToken.json";
import axios from "axios";
import { Oval, ThreeCircles } from "react-loader-spinner";
import lighthouse from "@lighthouse-web3/sdk";
import InstantMeet from "./InstantMeet";
import { useSession } from "next-auth/react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import '../../css/MainProfile.css'
import { MdDriveFileRenameOutline } from "react-icons/md";
import { MdOutlineMail } from "react-icons/md";
import { FaDiscourse } from "react-icons/fa6"
import { RiFolderUserLine } from "react-icons/ri";
import { FaXTwitter, FaDiscord, FaGithub } from "react-icons/fa6";

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
}

function MainProfile() {
  const { isConnected } = useAccount();
  const address = "0x04850b6b12fe4eda95df9371be81e1595716b7ef";
  const { data: session, status } = useSession();
  const { openConnectModal } = useConnectModal();
  const { publicClient, walletClient } = WalletAndPublicClient();
  const { chain, chains } = useNetwork();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayImage, setDisplayImage] = useState("");
  const [hovered, setHovered] = useState(false);
  const [profileDetails, setProfileDetails] = useState<any>();
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [displayName, setDisplayName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [twitter, setTwitter] = useState("");
  const [discord, setDiscord] = useState("");
  const [discourse, setDiscourse] = useState("");
  const [github, setGithub] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [isDelegate, setIsDelegate] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseFromDB, setResponseFromDB] = useState<boolean>(false);
  const [ensName, setEnsName] = useState("");
  const [votes, setVotes] = useState<any>();
  const [descAvailable, setDescAvailable] = useState<boolean>(true);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [selfDelegate, setSelfDelegate] = useState(false);
  const [daoName, setDaoName] = useState("operators");
  const [profileData, setProfileData] = useState<any>();

  interface ProgressData {
    total: any;
    uploaded: any;
  }
  
  useEffect(() => {
    // console.log("path", path);
    if (isConnected && session && path.includes("profile/undefined")) {
      const newPath = path.includes("profile/undefined")
        ? path.replace("profile/undefined", `profile/${address}?active=info`)
        : path;
      // console.log("newPath", newPath);
      router.replace(`${newPath}`);
    } else if (!isConnected && !session) {
      if (openConnectModal) {
        openConnectModal();
      } else {
        console.error("openConnectModal is not defined");
      }
    }
  }, [
    isConnected,
    address,
    router,
    session,
    path.includes("profile/undefined"),
  ]);

  const uploadImage = async (selectedFile: any) => {
    const progressCallback = async (progressData: any) => {
      let percentageDone =
        100 -
        (
          ((progressData?.total as any) / progressData?.uploaded) as any
        )?.toFixed(2);
      console.log(percentageDone);
    };

    const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_KEY
      ? process.env.NEXT_PUBLIC_LIGHTHOUSE_KEY
      : "";

    const output = await lighthouse.upload(selectedFile, apiKey);

    console.log("File Status:", output);
    setDisplayImage(output.data.Hash);

    let dao = daoName;
    const response = await axios.put("/api/profile", {
      address: address,
      image: displayImage,
      description: description,
      isDelegate: true,
      displayName: displayName,
      emailId: emailId,
      socialHandles: {
        twitter: twitter,
        discord: discord,
        github: github,
      },
      networks: {
        dao_name: daoName,
        network: chain?.name,
        discourse: discourse,
      },
    });

    console.log("response: ", response);

    console.log(
      "Visit at https://gateway.lighthouse.storage/ipfs/" + output.data.Hash
    );
  };

  useEffect(() => {
    const checkDelegateStatus = async() => {
      try {
        const res = await fetch(`/api/get-search-data?q=${address}&prop=operators`);
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        const data: Result[] | { message: string } = await res.json();
        if (Array.isArray(data)) {
          console.log("dataaaaaaaa", data[0])
          setProfileData(data[0])
          setWebsite(data[0].metadataWebsite)
          setDisplayImage(data[0].metadataLogo);
          setDescription(data[0].metadataDescription);
          setDisplayName(data[0].metadataName);
          setTwitter(data[0].metadataX);
          setDiscord(data[0].metadataDiscord ?? "");
          if (data.length > 0) {
            setSelfDelegate(true);
          } else {
            setSelfDelegate(false);
          }
        }
      } catch (error) {
        console.log(error)
      }
    }

    checkDelegateStatus()
  }, [address, selfDelegate])


  // Pass the address of whom you want to delegate the voting power to
  const handleDelegateVotes = async (to: string) => {
    try {
      const addr = await walletClient.getAddresses();
      const address1 = addr[0];

      const contractAddress = ""
      console.log("Contract", contractAddress);
      console.log("Wallet Client", walletClient);
      const delegateTx = await walletClient.writeContract({
        address: contractAddress,
        abi: dao_abi.abi,
        functionName: "delegate",
        args: [to],
        account: address1,
      });
      console.log(delegateTx);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  // useEffect(()=>{
  //   const getDelegatesVotes = async (address: string) => {
  //     const addr = await walletClient.getAddresses();
  //     const address1 = addr[0];
  //     console.log("Get Votes addr", address1);

  //     console.log(walletClient);
  //     const votingPower = await publicClient.readContract({
  //       address: "0x4200000000000000000000000000000000000042",
  //       abi: dao_abi.abi,
  //       functionName: "getVotes",
  //       args: [address],
  //     });
  //     console.log("Delegates Votes:", votingPower);
  //   };
  //   getDelegatesVotes(`${address}`);
  // }, [address])

  const handleCopy = (addr: string) => {
    copy(addr);
    toast("Address Copied");
  };

  const handleInputChange = (fieldName: string, value: string) => {
    switch (fieldName) {
      case "displayName":
        setDisplayName(value);
        break;
      case "emailId":
        setEmailId(value);
        break;
      case "twitter":
        setTwitter(value);
        break;
      case "discord":
        setDiscord(value);
        break;
      case "discourse":
        setDiscourse(value);
        break;
      case "github":
        setGithub(value);
        break;
      default:
        break;
    }
  };

  const formatNumber = (number: number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(2) + "m";
    } else if (number >= 1000) {
      return (number / 1000).toFixed(2) + "k";
    } else {
      return number;
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from your backend API to check if the address exists
        // let dao = daoName;
        console.log("Fetching from DB");
        // const dbResponse = await axios.get(`/api/profile/${address}`);

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
          address: address,
        });

        const requestOptions: any = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        };
        const res = await fetch(`/api/profile/${address}`, requestOptions);

        const dbResponse = await res.json();
        console.log("db Response", dbResponse);
        if (
          dbResponse &&
          Array.isArray(dbResponse.data) &&
          dbResponse.data.length > 0
        ) {
          // Iterate over each item in the response data array
          for (const item of dbResponse.data) {
            // Check if address and daoName match
            if (item.address === address) {
              console.log("Data found in the database");
              // Data found in the database, set the state accordingly
              setResponseFromDB(true);
              setDisplayImage(item.image);
              setDescription(item.description);
              setDisplayName(item.displayName);
              setEmailId(item.emailId);
              setTwitter(item.socialHandles.twitter);
              setDiscord(item.socialHandles.discord);
              setGithub(item.socialHandles.github);
              // Exit the loop since we found a match
              break;
            }
          }
        } else {
          console.log(
            "Data not found in the database, fetching from third-party API"
          );
          // Data not found in the database, fetch data from the third-party API
          if (responseFromDB === false && description == "") {
            setDescAvailable(false);
          }

          const details = await res.json();
          if (res.ok) {
            // Check if delegate data is present in the response
            console.log("Response Success----");
            if (details && details.data && details.data.delegate) {
              // If delegate data is present, set isDelegate to true
              setIsDelegate(true);
              setProfileDetails(details.data.delegate);
              setDescription(
                details.data.delegate.delegatePitch.customFields[1].value
              );
              setDescAvailable(true);
              if (details.data.delegate.twitterHandle != null) {
                setTwitter(`${details.data.delegate.twitterHandle}`);
              }

              if (details.data.delegate.discordHandle != null) {
                setDiscord(`${details.data.delegate.discordHandle}`);
              }

              if (details.data.delegate.githubHandle != null) {
                setGithub(`${details.data.delegate.githubHandle}`);
              }
            } else {
              // If delegate data is not present, set isDelegate to false
              setIsDelegate(false);
            }
          } else {
            // If response status is not ok, set isDelegate to false
            setIsDelegate(false);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [
    daoName,
    chain,
    address,
    searchParams.get("session") === "schedule",
    chain?.name,
  ]);

  useEffect(() => {
    setIsPageLoading(false);
  }, [isPageLoading]);

  const handleDelegate = () => {
    console.log("IsDelegate Status", isDelegate);
  };
  const handleSubmit = async (newDescription?: string) => {
    try {
      // Check if the delegate already exists in the database
      if (newDescription) {
        setDescription(newDescription);
        console.log("New Description", description);
      }
      setIsLoading(true);
      const isExisting = await checkDelegateExists(address);

      if (isExisting) {
        // If delegate exists, update the delegate
        await handleUpdate(newDescription);
        setIsLoading(false);
        onClose();
        console.log("Existing True");
      } else {
        // If delegate doesn't exist, add a new delegate
        await handleAdd(newDescription);
        setIsLoading(false);
        onClose();
        console.log("Sorry! Doesnt exist");
      }

      toast.success("Saved");
    } catch (error) {
      console.error("Error handling delegate:", error);
      toast.error("Error saving");
      setIsLoading(false);
    }
  };

  const checkDelegateExists = async (address: any) => {
    try {
      // Make a request to your backend API to check if the address exists
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        address: address,
        // daoName: dao,
      });

      const requestOptions: any = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };
      const res = await fetch(`/api/profile/${address}`, requestOptions);

      const response = await res.json();

      if (Array.isArray(response.data) && response.data.length > 0) {
        // Iterate over each item in the response data array
        for (const item of response.data) {
          // Check if address and daoName match
          if (item.address === address) {
            return true; // Return true if match found
          }
        }
      }

      return false;
      // Assuming the API returns whether the delegate exists
    } catch (error) {
      console.error("Error checking delegate existence:", error);
      return false;
    }
  };

  const handleAdd = async (newDescription?: string) => {
    try {
      // Call the POST API function for adding a new delegate
      const response = await axios.post("/api/profile", {
        address: address,
        image: displayImage,
        description: newDescription,
        isDelegate: true,
        displayName: displayName,
        emailId: emailId,
        socialHandles: {
          twitter: twitter,
          discord: discord,
          github: github,
        },
        networks: [
          {
            dao_name: daoName,
            network: chain?.name,
            discourse: discourse,
          },
        ],
      });

      console.log("Response Add", response);

      if (response.status === 200) {
        // Delegate added successfully
        console.log("Delegate added successfully:", response.data);
        setIsLoading(false);
      } else {
        // Handle error response
        console.error("Failed to add delegate:", response.statusText);
        setIsLoading(false);
      }
    } catch (error) {
      // Handle API call error
      console.error("Error calling POST API:", error);
      setIsLoading(false);
    }
  };

  // Function to handle updating an existing delegate
  const handleUpdate = async (newDescription?: string) => {
    try {
      // Call the PUT API function for updating an existing delegate
      console.log("Updating");
      console.log("Inside Updating Description", newDescription);
      const response: any = await axios.put("/api/profile", {
        address: address,
        image: displayImage,
        description: newDescription,
        isDelegate: true,
        displayName: displayName,
        emailId: emailId,
        socialHandles: {
          twitter: twitter,
          discord: discord,
          github: github,
        },
        networks: [
          {
            dao_name: daoName,
            network: chain?.name,
            discourse: discourse,
          },
        ],
      });
      console.log("response", response);
      // Handle response from the PUT API function
      if (response.data.success) {
        // Delegate updated successfully
        console.log("Delegate updated successfully");
        setIsLoading(false);
      } else {
        // Handle error response
        console.error("Failed to update delegate:", response.error);
        setIsLoading(false);
      }
    } catch (error) {
      // Handle API call error
      console.error("Error calling PUT API:", error);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      console.log("Description", description);
      try {

        // console.log("Desc.", description)
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [chain, address, daoName, chain?.name]);

  return (
    <>
      {!isPageLoading ? (
        <div className="font-poppins">
          <div className="flex ps-14 py-5 pe-10 justify-between">
            <div className="flex  items-center justify-center">
              <div
                className="relative object-cover rounded-3xl "
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                  backgroundColor: "#fcfcfc",
                  border: "2px solid #E9E9E9 ",
                }}>
                <div className="w-40 h-40 flex items-center justify-content ">
                  <div className="flex justify-center items-center w-40 h-40">
                    <Image
                      src={
                        (displayImage
                          ? displayImage
                          : "") ||
                        (daoName === "operators"
                          ? NOLogo
                          : daoName === "avss"
                          ? AVSLogo
                          : EILogo)
                      }
                      alt="user"
                      width={256}
                      height={256}
                      className={
                        profileData
                          ? "w-40 h-40 rounded-3xl"
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

            <div className="px-4 text-white">
                <div className=" flex items-center py-1">
                  <div className="font-bold text-lg pr-4">
                    {profileData ? (
                      profileData.metadataName
                    ) : displayName ? (
                      displayName
                    ) : (
                      <>
                        {`${address}`.substring(0, 6)} ...{" "}
                        {`${address}`.substring(`${address}`.length - 4)}
                      </>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href={twitter}
                      className={`border-[0.5px] border-white rounded-full h-fit p-1 ${
                        twitter == "" ? "hidden" : ""
                      }`}
                      style={{ backgroundColor: "white" }}
                      target="_blank">
                      <FaXTwitter color="#7C7C7C" size={12} />
                    </Link>
                    <Link
                      href={`https://discord.com/${discord}`}
                      className={`border-[0.5px] border-white rounded-full h-fit p-1 ${
                        discord == "" ? "hidden" : ""
                      }`}
                      style={{ backgroundColor: "white" }}
                      target="_blank">
                      <FaDiscord color="#7C7C7C" size={12} />
                    </Link>
                    <Link
                      href={`https://github.com/${github}`}
                      className={`border-[0.5px] border-white rounded-full h-fit p-1 ${
                        github == "" ? "hidden" : ""
                      }`}
                      style={{ backgroundColor: "white" }}
                      target="_blank">
                      <FaGithub color="#7C7C7C" size={12} />
                    </Link>
                    <Tooltip
                      content="Update your Profile"
                      className="rounded-md bg-opacity-90 bg-light-blue"
                      placement="right"
                      showArrow>
                      <span
                        className="border-[0.5px] border-white rounded-full h-fit p-1 cursor-pointer"
                        style={{ backgroundColor: "white" }}
                        onClick={onOpen}>
                        <FaPencil color="#3e3d3d" size={12} />
                      </span>
                    </Tooltip>
                    <div className="mt-10">
                      <Modal
                        isOpen={isOpen}
                        onOpenChange={onOpenChange}
                        className="font-poppins modal-bg"
                        size="3xl"
                      >
                        <ModalContent className="max-h-[95vh]">
                          {(onClose) => (
                            <>
                              <ModalHeader className="flex flex-col gap-1 py-2">
                                Update your Profile
                              </ModalHeader>
                              <ModalBody className="py-2 space-y-2">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                  <div className="col-span-2">
                                    <label className="text-sm font-medium flex gap-2 items-center mb-1">
                                      Upload Profile Image:
                                      <div className="border border-white rounded-full bg-white text-black p-1 hover:bg-light-blue hover:text-white hover:cursor-pointer">
                                        <RiFolderUserLine className="w-4 h-4"/>
                                      </div>
                                    </label>
                                    <input
                                      type="file"
                                      className="w-full text-sm"
                                      onChange={(e) => uploadImage(e.target.files)}
                                    />
                                  </div>
                                  
                                  {[
                                    { label: "Display name", icon: <MdDriveFileRenameOutline />, value: displayName, onChange: (e: { target: { value: string; }; }) => handleInputChange("displayName", e.target.value) },
                                    { label: "Email", icon: <MdOutlineMail />, value: emailId, onChange: (e: { target: { value: string; }; }) => handleInputChange("emailId", e.target.value) },
                                    { label: "X (Formerly Twitter)", icon: <FaXTwitter />, value: twitter, onChange: (e: { target: { value: string; }; }) => handleInputChange("twitter", e.target.value) },
                                    { label: "Discourse", icon: <FaDiscourse />, value: discourse, onChange: (e: { target: { value: string; }; }) => handleInputChange("discourse", e.target.value) },
                                    { label: "Discord", icon: <FaDiscord />, value: discord, onChange: (e: { target: { value: string; }; }) => handleInputChange("discord", e.target.value) },
                                    { label: "Github", icon: <FaGithub />, value: github, onChange: (e: { target: { value: string; }; }) => handleInputChange("github", e.target.value) },
                                  ].map((field, index) => (
                                    <div key={index}>
                                      <label className="text-sm font-medium flex gap-2 items-center mb-1">
                                        {field.label}:
                                        <div className="border border-white rounded-full bg-white text-black p-1 hover:bg-light-blue hover:text-white hover:cursor-pointer">
                                          {field.icon}
                                        </div>
                                      </label>
                                      <input
                                        type="text"
                                        value={field.value}
                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                        className="w-full outline-none bg-[#D9D9D945] rounded-md px-2 py-1 text-sm"
                                        onChange={field.onChange}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </ModalBody>
                              <ModalFooter className="py-2">
                                <Button color="default" onPress={onClose}>
                                  Close
                                </Button>
                                <Button
                                  className="btnSave"
                                  onClick={() => handleSubmit()}
                                >
                                  {isLoading ? "Saving" : "Save"}
                                </Button>
                              </ModalFooter>
                            </>
                          )}
                        </ModalContent>
                      </Modal>
                    </div>
                  </div>
                </div>

                <div className="flex items-center py-1">
                  <div>
                    {`${address}`.substring(0, 6)} ...{" "}
                    {`${address}`.substring(`${address}`.length - 4)}
                  </div>

                  <Tooltip
                    content="Copy"
                    placement="right"
                    closeDelay={1}
                    showArrow>
                    <span className="px-2 cursor-pointer" color="#3E3D3D">
                      <IoCopy onClick={() => handleCopy(`${address}`)} />
                    </span>
                  </Tooltip>
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
                {selfDelegate === true
                  ? votes && (
                      <div className="flex gap-4 py-1">
                        <div className="text-[#4F4F4F] border-[0.5px] border-[#D9D9D9] rounded-md px-3 py-1">
                          <span className="text-blue-shade-200 font-semibold">
                            {votes.delegatedVotes
                              ? formatNumber(Number(votes.delegatedVotes))
                              : "Fetching "}
                            &nbsp;
                          </span>
                          delegated tokens
                        </div>
                        <div className="text-[#4F4F4F] border-[0.5px] border-[#D9D9D9] rounded-md px-3 py-1">
                          <span className="text-blue-shade-200 font-semibold">
                            {formatNumber(votes.delegatorCount)
                              ? null
                              : "Fetching "}
                          </span>
                          Delegated from
                          <span className="text-blue-shade-200 font-semibold">
                            &nbsp;
                            {formatNumber(votes.delegatorCount)
                              ? formatNumber(votes.delegatorCount)
                              : "number of "}
                            &nbsp;
                          </span>
                          Addresses
                        </div>
                      </div>
                    )
                  : null}

                {selfDelegate === false ? (
                  <div className="pt-2 flex gap-5">
                    {/* pass address of whom you want to delegate the voting power to */}
                    <button
                      className="bg-deep-blue font-bold text-white rounded-full my-2 px-8 py-[10px] btn-bd"
                      onClick={() => handleDelegateVotes(`${address}`)}>
                      Become Delegate
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
            <div>
              <ConnectWalletWithENS />
            </div>
          </div>

          <div className="flex gap-12 bg-[#D9D9D945] pl-16 text-white">
            <button
              className={`border-b-2 py-4 px-2 outline-none ${
                searchParams.get("active") === "info"
                  ? "text-light-cyan font-semibold border-b-3 border-light-cyan"
                  : "border-transparent"
              }`}
              onClick={() => router.push(path + "?active=info")}>
              Info
            </button>
            <button
              className={`border-b-2 py-4 px-2 outline-none ${
                searchParams.get("active") === "sessions"
                  ? "text-light-cyan font-semibold border-b-3 border-light-cyan"
                  : "border-transparent"
              }`}
              onClick={() =>
                router.push(path + "?active=sessions&session=schedule")
              }>
              Sessions
            </button>
            <button
              className={`border-b-2 py-4 px-2 outline-none ${
                searchParams.get("active") === "officeHours"
                  ? "text-light-cyan font-semibold border-b-3 border-light-cyan"
                  : "border-transparent"
              }`}
              onClick={() =>
                router.push(path + "?active=officeHours&hours=schedule")
              }>
              Office Hours
            </button>

            {selfDelegate === true && (
              <button
                className={`border-b-2 py-4 px-2 outline-none ${
                  searchParams.get("active") === "instant-meet"
                    ? "text-light-cyan font-semibold border-b-3 border-light-cyan"
                    : "border-transparent"
                }`}
                onClick={() => router.push(path + "?active=instant-meet")}>
                Instant Meet
              </button>
            )}
            {/* <button
          className={`border-b-2 py-4 px-2 outline-none ${
            searchParams.get("active") === "claimNft"
              ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
              : "border-transparent"
          }`}
          onClick={() => router.push(path + "?active=claimNft")}
        >
          Claim NFTs
        </button> */}
          </div>

          <div className="py-6 ps-16">
            {searchParams.get("active") === "info" ? (
              <UserInfo
                description={description}
                isDelegate={isDelegate}
                isSelfDelegate={selfDelegate}
                descAvailable={descAvailable}
                onSaveButtonClick={(newDescription?: string) =>
                  handleSubmit(newDescription)
                }
                isLoading={isLoading}
                daoName={daoName}
              />
            ) : (
              ""
            )}
            {searchParams.get("active") === "sessions" ? (
              <UserSessions
                isDelegate={isDelegate}
                selfDelegate={selfDelegate}
                daoName={daoName}
              />
            ) : (
              ""
            )}
            {searchParams.get("active") === "officeHours" ? (
              <UserOfficeHours
                isDelegate={isDelegate}
                selfDelegate={selfDelegate}
                daoName={daoName}
              />
            ) : (
              ""
            )}

            {selfDelegate === true &&
            searchParams.get("active") === "instant-meet" ? (
              <InstantMeet
                isDelegate={isDelegate}
                selfDelegate={selfDelegate}
                daoName={daoName}
              />
            ) : (
              ""
            )}
            {/* {searchParams.get("active") === "claimNft" ? <ClaimNFTs /> : ""} */}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center pt-10">
            <ThreeCircles
              visible={true}
              height="60"
              width="60"
              color="#FFFFFF"
              ariaLabel="three-circles-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          </div>
        </>
      )}
    </>
  );
}

export default MainProfile;