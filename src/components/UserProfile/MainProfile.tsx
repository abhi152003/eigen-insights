"use client";

import Image from "next/image";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";

function MainProfile() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [img, setImg] = useState<File | undefined>();
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [socials, setSocials] = useState({
    twitter: "https://twitter.com/",
    insta: "https://instagram.com/",
    discord: "https://discord.com/",
  });

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      setImg(selectedFile);
    }
  };

  const handleCopy = (addr: string) => {
    copy(addr);
    toast("Address Copied");
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setSocials({
      ...socials,
      [fieldName]: value,
    });
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
            <FaPencil className="opacity-100 backdrop-blur-sm" size={12} />
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
              <Link
                href={socials.twitter}
                target="_blank"
                className="border-[0.5px] border-[#8E8E8E] rounded-full h-fit p-1 cursor-pointer"
                style={{ backgroundColor: "rgba(217, 217, 217, 0.42)" }}
              >
                <FaXTwitter color="#7C7C7C" size={12} />
              </Link>
              <Link
                href={socials.insta}
                target="_blank"
                className="border-[0.5px] border-[#8E8E8E] rounded-full h-fit p-1 cursor-pointer"
                style={{ backgroundColor: "rgba(217, 217, 217, 0.42)" }}
              >
                <BiLogoInstagramAlt color="#7C7C7C" size={12} />
              </Link>
              <Link
                href={socials.discord}
                target="_blank"
                className="border-[0.5px] border-[#8E8E8E] rounded-full h-fit p-1 cursor-pointer"
                style={{ backgroundColor: "rgba(217, 217, 217, 0.42)" }}
              >
                <FaDiscord color="#7C7C7C" size={12} />
              </Link>
              <Tooltip content="Edit social links" placement="right" showArrow>
                <span
                  className="border-[0.5px] border-[#8E8E8E] rounded-full h-fit p-1 cursor-pointer"
                  style={{ backgroundColor: "rgba(217, 217, 217, 0.42)" }}
                  onClick={onOpen}
                >
                  <FaPencil color="#3e3d3d" size={12} />
                </span>
              </Tooltip>
              <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                className="font-poppins"
              >
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        Edit Socials
                      </ModalHeader>
                      <ModalBody>
                        <div className="px-1 font-medium">Twitter ID:</div>
                        <input
                          type="url"
                          value={socials.twitter}
                          placeholder="https://twitter.com/"
                          className="outline-none bg-[#D9D9D945] rounded-md px-2 py-1 text-sm"
                          onChange={(e) =>
                            handleInputChange("twitter", e.target.value)
                          }
                        />

                        <div className="px-1 font-medium">Instagram ID:</div>
                        <input
                          type="url"
                          value={socials.insta}
                          placeholder="https://instagram.com/"
                          className="outline-none bg-[#D9D9D945] rounded-md px-2 py-1 text-sm"
                          onChange={(e) =>
                            handleInputChange("insta", e.target.value)
                          }
                        />

                        <div className="px-1 font-medium">Discord ID:</div>
                        <input
                          type="url"
                          value={socials.discord}
                          placeholder="https://discord.com/"
                          className="outline-none bg-[#D9D9D945] rounded-md px-2 py-1 text-sm"
                          onChange={(e) =>
                            handleInputChange("discord", e.target.value)
                          }
                        />
                      </ModalBody>
                      <ModalFooter>
                        <Button color="default" onPress={onClose}>
                          Close
                        </Button>
                        <Button color="primary" onPress={onClose}>
                          Save
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
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
                    handleCopy("0xB351a70dD6E5282A8c84edCbCd5A955469b9b032")
                  }
                />
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
            searchParams.get("active") === "info"
              ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
              : "border-transparent"
          }`}
          onClick={() => router.push(path + "?active=info")}
        >
          Info
        </button>
        <button
          className={`border-b-2 py-4 px-2 outline-none ${
            searchParams.get("active") === "votes"
              ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
              : "border-transparent"
          }`}
          onClick={() => router.push(path + "?active=votes")}
        >
          Past Votes
        </button>
        <button
          className={`border-b-2 py-4 px-2 outline-none ${
            searchParams.get("active") === "sessions"
              ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
              : "border-transparent"
          }`}
          onClick={() =>
            router.push(path + "?active=sessions&session=schedule")
          }
        >
          Sessions
        </button>
        <button
          className={`border-b-2 py-4 px-2 outline-none ${
            searchParams.get("active") === "officeHours"
              ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
              : "border-transparent"
          }`}
          onClick={() =>
            router.push(path + "?active=officeHours&hours=schedule")
          }
        >
          Office Hours
        </button>
        <button
          className={`border-b-2 py-4 px-2 outline-none ${
            searchParams.get("active") === "claimNft"
              ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
              : "border-transparent"
          }`}
          onClick={() => router.push(path + "?active=claimNft")}
        >
          Claim NFTs
        </button>
      </div>

      <div className="py-6 ps-16">
        {searchParams.get("active") === "info" ? <UserInfo /> : ""}
        {searchParams.get("active") === "votes" ? <UserVotes /> : ""}
        {searchParams.get("active") === "sessions" ? <UserSessions /> : ""}
        {searchParams.get("active") === "officeHours" ? (
          <UserOfficeHours />
        ) : (
          ""
        )}
        {searchParams.get("active") === "claimNft" ? <ClaimNFTs /> : ""}
      </div>
    </div>
  );
}

export default MainProfile;