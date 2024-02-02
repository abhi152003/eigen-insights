"use client";

import Image from "next/image";
import React, { ChangeEvent, useRef, useState } from "react";
import copy from "copy-to-clipboard";
import { Tooltip } from "@nextui-org/react";
import user from "@/assets/images/daos/user3.png";
import { FaXTwitter, FaDiscord } from "react-icons/fa6";
import { BiLogoInstagramAlt } from "react-icons/bi";
import { IoCopy } from "react-icons/io5";
import UserInfo from "./UserInfo";
import UserVotes from "./UserVotes";
import UserSessions from "./UserSessions";
import UserOfficeHours from "./UserOfficeHours";
import ClaimNFTs from "./ClaimNFTs";
import { FaPencil } from "react-icons/fa6";

function MainProfile() {
  const [activeSection, setActiveSection] = useState("info");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [img, setImg] = useState<File | undefined>();
  const [hovered, setHovered] = useState(false);

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      setImg(selectedFile);
    }
  };

  return (
    <div className="font-poppins">
      <div className="flex ps-14 py-5 pe-10">
        <div
          className="relative"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Image src={user} alt="user" className="w-40 h-40" />
          <div
            className={`absolute top-3 right-3 cursor-pointer  ${
              hovered ? "bg-gray-50 rounded-full p-1" : "hidden"
            } `}
            onClick={handleLogoClick}
          >
            <FaPencil className="opacity-100" size={12} />
            <input
              type="file"
              ref={fileInputRef}
              hidden
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="px-4">
          <div className=" flex items-center py-1">
            <div className="font-bold text-lg pr-4">lindaxie.eth</div>
            <div className="flex gap-3">
              <span
                className="border-[0.5px] border-[#8E8E8E] rounded-full h-fit p-1 cursor-pointer"
                style={{ backgroundColor: "rgba(217, 217, 217, 0.42)" }}
              >
                <FaXTwitter color="#7C7C7C" size={12} />
              </span>
              <span
                className="border-[0.5px] border-[#8E8E8E] rounded-full h-fit p-1 cursor-pointer"
                style={{ backgroundColor: "rgba(217, 217, 217, 0.42)" }}
              >
                <BiLogoInstagramAlt color="#7C7C7C" size={12} />
              </span>
              <span
                className="border-[0.5px] border-[#8E8E8E] rounded-full h-fit p-1 cursor-pointer"
                style={{ backgroundColor: "rgba(217, 217, 217, 0.42)" }}
              >
                <FaDiscord color="#7C7C7C" size={12} />
              </span>
            </div>
          </div>

          <div className="flex items-center py-1">
            <div>
              {"0xB351a70dD6E5282A8c84edCbCd5A955469b9b032".substring(0, 6)} ...{" "}
              {"0xB351a70dD6E5282A8c84edCbCd5A955469b9b032".substring(
                "0xB351a70dD6E5282A8c84edCbCd5A955469b9b032".length - 4
              )}
            </div>

            <Tooltip content="Copy" placement="right" closeDelay={1} showArrow>
              <span className="px-2 cursor-pointer" color="#3E3D3D">
                <IoCopy
                  onClick={() =>
                    copy("0xB351a70dD6E5282A8c84edCbCd5A955469b9b032")
                  }
                />
              </span>
            </Tooltip>
          </div>

          <div className="flex gap-4 py-1">
            <div className="text-[#4F4F4F] border-[0.5px] border-[#D9D9D9] rounded-md px-3 py-1">
              <span className="text-blue-shade-200 font-semibold">5.02m </span>
              Tokens Delegated
            </div>
            <div className="text-[#4F4F4F] border-[0.5px] border-[#D9D9D9] rounded-md px-3 py-1">
              Delegated from
              <span className="text-blue-shade-200 font-semibold"> 2.56k </span>
              Addresses
            </div>
          </div>

          <div className="pt-2 flex gap-5">
            <button className="bg-blue-shade-200 font-bold text-white rounded-full px-8 py-[10px]">
              Delegate
            </button>
            <div className="">
              <select className="outline-none border border-blue-shade-200 text-blue-shade-200 rounded-full py-2 px-3">
                <option className="text-gray-700">Optimism</option>
                <option className="text-gray-700">Arbitrum</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-12 bg-[#D9D9D945] pl-16">
        <button
          className={`border-b-2 py-4 px-2 outline-none ${
            activeSection === "info"
              ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
              : "border-transparent"
          }`}
          onClick={() => setActiveSection("info")}
        >
          Info
        </button>
        <button
          className={`border-b-2 py-4 px-2 outline-none ${
            activeSection === "pastVotes"
              ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
              : "border-transparent"
          }`}
          onClick={() => setActiveSection("pastVotes")}
        >
          Past Votes
        </button>
        <button
          className={`border-b-2 py-4 px-2 outline-none ${
            activeSection === "sessions"
              ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
              : "border-transparent"
          }`}
          onClick={() => setActiveSection("sessions")}
        >
          Sessions
        </button>
        <button
          className={`border-b-2 py-4 px-2 outline-none ${
            activeSection === "officeHours"
              ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
              : "border-transparent"
          }`}
          onClick={() => setActiveSection("officeHours")}
        >
          Office Hours
        </button>
        <button
          className={`border-b-2 py-4 px-2 outline-none ${
            activeSection === "claimNft"
              ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
              : "border-transparent"
          }`}
          onClick={() => setActiveSection("claimNft")}
        >
          Claim NFTs
        </button>
      </div>

      <div className="py-6 ps-16">
        {activeSection === "info" && <UserInfo />}
        {activeSection === "pastVotes" && <UserVotes />}
        {activeSection === "sessions" && <UserSessions />}
        {activeSection === "officeHours" && <UserOfficeHours />}
        {activeSection === "claimNft" && <ClaimNFTs />}
      </div>
    </div>
  );
}

export default MainProfile;
