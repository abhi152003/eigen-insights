"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import logo from "@/assets/images/daos/eigen_logo.png";
import rocket from "@/assets/images/sidebar/rocket.png";
import sessionIcn from "@/assets/images/sidebar/office.png";
import office from "@/assets/images/sidebar/Office hour (1).png";
import wallet from "@/assets/images/sidebar/wallet.png";
import gitbook from "@/assets/images/sidebar/git_book_new.png";
import user from "@/assets/images/sidebar/user_new.png";
// import "../../css/ImagePulse.css"
import styles from "./sidebar.module.css";
import { usePathname } from "next/navigation";
import { Badge, Tooltip } from "@nextui-org/react";
import { IoClose } from "react-icons/io5";
import Link from "next/link";
import { ConnectWallet } from "../ConnectWallet/ConnectWallet";
import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import { useRouter } from "next-nprogress-bar";
import ButtonWithCircle from "../Circle/ButtonWithCircle";
import { FaUser } from "react-icons/fa";
import { PiWalletFill } from "react-icons/pi";
import { SiGitbook } from "react-icons/si";

function Sidebar() {
  const router = useRouter();
  const [storedDao, setStoredDao] = useState<string[]>([]);
  const pathname = usePathname();
  const [badgeVisiblity, setBadgeVisibility] = useState<boolean[]>(
    new Array(storedDao.length).fill(true)
  );
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const { address, isConnected } = useAccount();
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  useEffect(() => {
    // console.log(session, sessionLoading, isConnected);
  }, [session, sessionLoading, isConnected, isPageLoading]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const localJsonData = JSON.parse(
        localStorage.getItem("visitedDao") || "{}"
      );

      const localStorageArr: string[] = Object.values(localJsonData);
      // console.log("Values: ", localStorageArr);

      setStoredDao(localStorageArr);
    }, 100);
    setIsPageLoading(false);
    return () => clearInterval(intervalId);
  }, []);

  const handleBadgeClick = (name: string) => {
    const localData = JSON.parse(localStorage.getItem("visitedDao") || "{}");

    delete localData[name];
    localStorage.setItem("visitedDao", JSON.stringify(localData));

    setStoredDao((prevState) => prevState.filter((item) => item[0] !== name));
    setBadgeVisibility(new Array(storedDao.length).fill(false));

    router.push(`/`);
  };

  const handleMouseOver = (index: number) => {
    const updatedVisibility = [...badgeVisiblity];
    updatedVisibility[index] = true;
    setBadgeVisibility(updatedVisibility);
  };

  const handleMouseOut = (index: number) => {
    const updatedVisibility = [...badgeVisiblity];
    updatedVisibility[index] = false;
    setBadgeVisibility(updatedVisibility);
  };

  return (
    <>
      <div className="py-6 h-full">
        <div className="flex flex-col h-full justify-between">
          <div className="flex flex-col items-center gap-y-4 pb-5">
            <Image
              src={logo}
              alt={"image"}
              width={40}
              className={`xl:w-11 xl:h-11 2xl:w-12 2xl:h-12 2.5xl:w-14 2.5xl:h-14 ${styles.image_hover} cursor-pointer`}
            ></Image>

            <Tooltip
              content="Explore"
              placement="right"
              className="rounded-md bg-opacity-90 bg-light-blue"
              closeDelay={1}
            >
              <Link href={"/"}>
                <Image
                  priority
                  src={rocket}
                  alt={"image"}
                  width={40}
                  className={`cursor-pointer xl:w-11 xl:h-11 2xl:w-12 2xl:h-12 2.5xl:w-14 2.5xl:h-14 ${
                    pathname.endsWith(`/`)
                      ? "border-white border-2 rounded-full"
                      : ""
                  } ${styles.image_hover}`}
                ></Image>
              </Link>
            </Tooltip>
            <Tooltip
              content="Office Hours"
              placement="right"
              className="rounded-md bg-opacity-90 bg-light-blue"
              closeDelay={1}
            >
              <Link href={"/office-hours?hours=ongoing"}>
                <Image
                  priority
                  src={office}
                  alt={"image"}
                  width={40}
                  className={`cursor-pointer xl:w-11 xl:h-11 2xl:w-12 2xl:h-12 2.5xl:w-14 2.5xl:h-14 ${
                    pathname.includes(`/office-hours`)
                      ? "border-white border-2 rounded-full"
                      : ""
                  } ${styles.image_hover}`}
                ></Image>
              </Link>
            </Tooltip>
            <Tooltip
              content="Sessions"
              placement="right"
              className="rounded-md bg-opacity-90 bg-light-blue"
              closeDelay={1}
            >
              <Link href={"/sessions?active=recordedSessions"}>
                <Image
                  priority
                  src={sessionIcn}
                  alt={"image"}
                  width={40}
                  height={40}
                  className={`cursor-pointer xl:w-11 xl:h-11 2xl:w-12 2xl:h-12 2.5xl:w-14 2.5xl:h-14 ${
                    pathname.includes(`/sessions`)
                      ? "border-white border-2 rounded-full"
                      : ""
                  } ${styles.image_hover}`}
                ></Image>
              </Link>
            </Tooltip>
          </div>
          <div className="h-full">
            <div
              className={`flex flex-col items-center gap-y-4 py-7 h-full bg-[#05223B] rounded-2xl overflow-y-auto ${styles.scrollbar}`}
            >
              {storedDao ? (
                storedDao.map((data, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center rounded-full p-[4px]
                      ${
                        pathname.includes(`/${data[0]}`)
                          ? "border-white border-[2.5px]"
                          : ""
                      }
                      `}
                    onMouseOver={() => handleMouseOver(index)}
                    onMouseOut={() => handleMouseOut(index)}
                  >
                    <Badge
                      isInvisible={!badgeVisiblity[index]}
                      content={<IoClose />}
                      className="p-[0.1rem] cursor-pointer border-blue-shade-300"
                      color="danger"
                      size="sm"
                      onClick={() => handleBadgeClick(data[0])}
                    >
                      <Tooltip
                        content={
                          <div className="capitalize">
                            {data[0] === "operators" ? "Operators" : "AVSs"}
                          </div>
                        }
                        placement="right"
                        className="rounded-md bg-opacity-90 bg-light-blue"
                        closeDelay={1}
                      >
                        <Link
                          href={
                            data[0] === "operators"
                              ? `/${data[0]}?active=operatorsList`
                              : `/${data[0]}?active=avsList`
                          }
                        >
                          <Image
                            key={index}
                            src={data[1]}
                            width={80}
                            height={80}
                            alt="image"
                            className={`w-8 h-8 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10 2.5xl:w-12 2.5xl:h-12 rounded-full cursor-pointer ${styles.image_hover}`}
                            priority={true}
                          ></Image>
                        </Link>
                      </Tooltip>
                    </Badge>
                  </div>
                ))
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-y-4 pt-5">
            <Tooltip
              content={<div className="capitalize">Git Book</div>}
              placement="right"
              className="rounded-full bg-opacity-90 bg-light-blue"
              closeDelay={1}
            >
              <Link href={""}>
                {/* <Image
                src={gitbook}
                alt="image"
                width={40}
                height={30}
                className={`text-light-blue xl:w-15 xl:h-11 2xl:w-14 2xl:h-12 2.5xl:w-14 2.5xl:h-14 ${styles.image_hover} cursor-pointer border-1 border-white rounded-full`}
              /> */}
                <div
                  className={`p-[14px] cursor-pointer ${styles.image_hover} rounded-full border border-white `}
                >
                  <SiGitbook className="w-4 h-4" />
                </div>
              </Link>
            </Tooltip>

            {!isConnected && !session ? (
              <Tooltip
                content={<div className="capitalize">Wallet</div>}
                placement="right"
                className="rounded-md bg-opacity-90 bg-light-blue"
                closeDelay={1}
              >
                {isPageLoading || sessionLoading ? (
                  // <Image
                  //   src={user}
                  //   alt={"image"}
                  //   width={40}
                  //   className={`cursor-pointer opacity-80 xl:w-10 xl:h-10 2xl:w-10 2xl:h-10 2.5xl:w-14 2.5xl:h-14 ${styles.image_hover} cursor-pointer"`}
                  // />
                  // <div className={`p-[13px] cursor-pointer ${styles.image_hover} rounded-full border border-white`}>
                  // <FaUser className="w-4 h-4 "/>
                  // </div>
                  <div
                  className={`p-[13px] mx-1 cursor-pointer ${styles.image_hover} rounded-full border border-white`}
                  >
                    <FaUser
                      className="w-4 h-4"
                    />
                  </div>
                ) : (
                  <ConnectWallet />
                )}
              </Tooltip>
            ) : (
              <Tooltip
                content={<div className="capitalize">Profile</div>}
                placement="right"
                className="rounded-md bg-opacity-90 bg-light-blue"
                closeDelay={1}
              >
                {/* <Image
                  src={user}
                  alt={"image"}
                  width={40}
                  className={`cursor-pointer xl:w-11 xl:h-11 2xl:w-12 2xl:h-12 2.5xl:w-14 2.5xl:h-14 ${styles.image_hover} cursor-pointer`}
                  onClick={() => router.push(`/profile/${address}?active=info`)}
                /> */}
                <div
                  className={`p-[13px] mx-1 cursor-pointer ${styles.image_hover} rounded-full border border-white`}
                >
                  <FaUser
                    className="w-4 h-4"
                    onClick={() =>
                      router.push(`/profile/${address}?active=info`)
                    }
                  />
                </div>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
