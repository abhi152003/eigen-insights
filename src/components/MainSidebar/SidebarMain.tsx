'use client'
import Image from "next/image";
import React from "react";
import logo from "@/assets/images/daos/eigen_logo.png";
import rocket from "@/assets/images/sidebar/rocket.png";
import operatorLogo from "@/assets/images/daos/Operator4.jpg";
import restakerLogo from "@/assets/images/daos/restakers1.png";
import avsLogo from "@/assets/images/daos/AVSs3 New.png";
import styles from "./sidebar.module.css";
import { usePathname } from "next/navigation";
import { Tooltip } from "@nextui-org/react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import { useRouter } from "next-nprogress-bar";
import { FaUser } from "react-icons/fa";
import { SiGitbook } from "react-icons/si";
import { ConnectWallet } from "../ConnectWallet/ConnectWallet";

function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  return (
    <div className="py-6 h-full">
      <div className="flex flex-col h-full justify-between">
        <div className="flex flex-col items-center gap-y-4 pb-5">
          <Image
            src={logo}
            alt={"Eigen logo"}
            width={40}
            className={`xl:w-11 xl:h-11 2xl:w-12 2xl:h-12 2.5xl:w-14 2.5xl:h-14 ${styles.image_hover} cursor-pointer`}
            onClick={() => window.open("https://www.eigeninsight.xyz/", "_blank")}
          />

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
                alt={"Explore"}
                width={40}
                className={`cursor-pointer xl:w-11 xl:h-11 2xl:w-12 2xl:h-12 2.5xl:w-14 2.5xl:h-14 ${
                  pathname === "/" ? "border-white border-2 rounded-full" : ""
                } ${styles.image_hover}`}
              />
            </Link>
          </Tooltip>
        </div>

        <div className="h-fit">
          <div className={`flex flex-col items-center gap-y-4 py-7 h-full bg-[#05223B] rounded-2xl overflow-y-auto ${styles.scrollbar}`}>
            <Tooltip
              content="Operators"
              placement="right"
              className="rounded-md bg-opacity-90 bg-light-blue"
              closeDelay={1}
            >
              <Link href="/operators?active=operatorsList">
                <div className={`flex flex-col items-center rounded-full p-[4px] ${
                  pathname.includes('/operators') ? "border-white border-[2.5px]" : ""
                }`}>
                  <Image
                    src={operatorLogo}
                    width={80}
                    height={80}
                    alt="Operators"
                    className={`w-8 h-8 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10 2.5xl:w-12 2.5xl:h-12 rounded-full cursor-pointer ${styles.image_hover}`}
                    priority={true}
                  />
                </div>
              </Link>
            </Tooltip>

            <Tooltip
              content="AVSs"
              placement="right"
              className="rounded-md bg-opacity-90 bg-light-blue"
              closeDelay={1}
            >
              <Link href="/avss?active=avsList">
                <div className={`flex flex-col items-center rounded-full p-[4px] ${
                  pathname.includes('/avs') ? "border-white border-[2.5px]" : ""
                }`}>
                  <Image
                    src={avsLogo}
                    width={80}
                    height={80}
                    alt="AVSs"
                    className={`w-8 h-8 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10 2.5xl:w-12 2.5xl:h-12 rounded-full cursor-pointer ${styles.image_hover}`}
                    priority={true}
                  />
                </div>
              </Link>
            </Tooltip>

            <Tooltip
              content="Restakers"
              placement="right"
              className="rounded-md bg-opacity-90 bg-light-blue"
              closeDelay={1}
            >
              <Link href="/restakers">
                <div className={`flex flex-col items-center rounded-full p-[4px] ${
                  pathname.includes('/restakers') ? "border-white border-[2.5px]" : ""
                }`}>
                  <Image
                    src={restakerLogo}
                    width={80}
                    height={80}
                    alt="Restakers"
                    className={`w-8 h-8 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10 2.5xl:w-12 2.5xl:h-12 rounded-full cursor-pointer ${styles.image_hover}`}
                    priority={true}
                  />
                </div>
              </Link>
            </Tooltip>
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
              <div className={`p-[14px] cursor-pointer ${styles.image_hover} rounded-full border border-white `}>
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
              {sessionLoading ? (
                <div className={`p-[13px] mx-1 cursor-pointer ${styles.image_hover} rounded-full border border-white`}>
                  <FaUser className="w-4 h-4" />
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
              <div
                className={`p-[13px] mx-1 cursor-pointer ${styles.image_hover} rounded-full border border-white`}
                onClick={() => router.push(`/profile/${address}?active=info`)}
              >
                <FaUser className="w-4 h-4" />
              </div>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;