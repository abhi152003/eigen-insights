"use client";
import Image, { StaticImageData } from "next/image";
import React, { useEffect, useState } from "react";
import DelegatesList from "./DelegatesList";
import DelegatesSession from "./DelegatesSession";
import OfficeHours from "./OfficeHours";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import operators_logo from "@/assets/images/daos/Operator4.jpg";
import avss_logo from "@/assets/images/daos/AVSs3 New.png";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import { dao_details } from "@/config/daoDetails";
import "../../css/ShineFont.css";
import "../../css/SearchShine.css";

function SpecificDAO({ props }: { props: { daoDelegates: string } }) {
  const router = useRouter();
  const path = usePathname();
  let operator_or_avs: string;

  if (path.slice(1) === "operators") {
    operator_or_avs = "Operators";
  } else {
    operator_or_avs = "AVSs";
  }

  console.log(operator_or_avs);
  const searchParams = useSearchParams();

  const logoMapping: any = {
    operators: operators_logo,
    avss: avss_logo,
    // Add more mappings as needed
  };

  const selectedLogo = logoMapping[operator_or_avs] || operators_logo;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState({
    value: operator_or_avs,
    label: operator_or_avs,
    image: selectedLogo,
  });

  const options = [
    { value: "Operators", label: "Operators", image: operators_logo },
    { value: "AVSs", label: "AVSs", image: avss_logo },
  ];

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  const selectOption = (option: any) => {
    setSelectedOption(option);
    setIsOpen(false);

    let name: string;
    name = option.value;
    const formatted = name.toLowerCase();
    const localData = JSON.parse(localStorage.getItem("visitedDao") || "{}");
    localStorage.setItem(
      "visitedDao",
      JSON.stringify({ ...localData, [formatted]: [formatted, option.image] })
    );

    if (formatted === "operators") {
      router.push(`/${formatted}?active=operatorsList`);
    } else {
      router.push(`/${formatted}?active=avsList`);
    }
  };

  console.log(selectedOption);
  console.log("paramssssssss", searchParams.get("active") === "operatorsList");

  return (
    <div className="font-poppins py-6" id="secondSection">
      <div className="pr-8 pb-3 pl-16">
        <div className="flex items-center justify-between pe-10">
          <div
            className="relative z-50"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div>
              <div
                className="capitalize outline-none cursor-pointer flex items-center gap-3 justify-between transition duration-500"
                // onMouseEnter={handleMouseEnter}
                // onMouseLeave={handleMouseLeave}
              >
                <div className="flex items-center text-light-cyan text-[2.2rem]">
                  {selectedOption.label}
                </div>
                <svg
                  className={`w-4 h-4 mr-2 ${
                    isOpen
                      ? "transform rotate-180 transition-transform duration-300"
                      : "transition-transform duration-300"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
              {isOpen && (
                <div
                  className={`absolute mt-1 p-2 w-72 border border-white-shade-100 rounded-xl bg-dark-blue shadow-md ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                  style={{ transition: "opacity 0.3s" }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {options.map((option: any, index: number) => (
                    <div key={index}>
                      <div
                        className={`option flex items-center cursor-pointer px-3 py-2 rounded-lg transition duration-1000  ease-in-out transform hover:scale-105 capitalize ${
                          option.label === operator_or_avs ? "text-light-cyan" : ""
                        }`}
                        onClick={() => selectOption(option)}
                      >
                        {option.value}
                      </div>
                      {index !== options.length - 1 && <hr />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <ConnectWalletWithENS />
          </div>
        </div>
        <div className="pt-3 pb-1 pr-8">
          {props.daoDelegates === "operators"
            ? dao_details.operators.description
            : props.daoDelegates === "avss"
            ? dao_details.avss.description
            : null}
        </div>
      </div>

      <div className="ml-0 pl-16 py-1 flex gap-12 justify-start text-base">
        {/* {operator_or_avs === "Operators" ? (
          <button
            className={` 
              mt-6 p-3 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000  group
              ${
                searchParams.get("active") === "operatorsList"
                  ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3] btnShine"
                  : "text-white border-white"
              }`}
            onClick={() => router.push(path + "?active=operatorsList")}
          >
            Operators List
          </button>
        ) : (
          <button
            className={`
              p-3 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000  group
              ${
                searchParams.get("active") === "avsList"
                  ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#05223B] to-[#427FA3] btnShine"
                  : "text-white border-white"
              }`}
            onClick={() => router.push(path + "?active=avsList")}
          >
            AVSs List
          </button>
        )} */}

        {/* {operator_or_avs === "Operators" ? (
          <button
            className={`
              mt-6 p-3 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000  group
              ${
                searchParams.get("active") === "operatorsSession"
                  ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3] btnShine"
                  : "text-white border-white"
              }`}
            onClick={() =>
              router.push(path + "?active=operatorsSession&session=recorded")
            }
          >
            Operators Sessions
          </button>
        ) : (
          <button
            className={`
              p-3 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000  group 
              ${
                searchParams.get("active") === "avsSession"
                  ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3] btnShine"
                  : "text-white border-white"
              }`}
            onClick={() =>
              router.push(path + "?active=avsSession&session=recorded")
            }
          >
            AVSs Sessions
          </button>
        )} */}

        {/* {operator_or_avs === "Operators" ? (
          <button
            className={`
            mt-6 p-3 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000 group 
            ${
              searchParams.get("active") === "officeHours"
                ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3] btnShine"
                : "text-white border-white"
            }`}
            onClick={() =>
              router.push(path + "?active=officeHours&hours=ongoing")
            }
          >
            Office hours
          </button>
        ) : (
          <button
            className={`
            p-3 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000 group 
            ${
              searchParams.get("active") === "officeHours"
                ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3] btnShine"
                : "text-white border-white"
            }`}
            onClick={() =>
              router.push(path + "?active=officeHours&hours=ongoing")
            }
          >
            Office hours
          </button>
        )} */}

        {/* <button
          className={`
            p-3 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-75 outline-none duration-1000 group 
            ${
              searchParams.get("active") === "officeHours"
                ? "text-[#A7DBF2] bg-gradient-to-r from-[#020024] via-[#214965] to-[#427FA3] btnShine"
                : "text-white border-white"
            }`}
          onClick={() =>
            router.push(path + "?active=officeHours&hours=ongoing")
          }
        >
          Office hours
        </button> */}
      </div>

      <div className="py-6 ps-16">
        {searchParams.get("active") === "operatorsList" ||
        searchParams.get("active") === "avsList" ? (
          <DelegatesList props={props.daoDelegates} />
        ) : searchParams.get("active") === "operatorsSession" ||
          searchParams.get("active") === "avsSession" ? (
          <DelegatesSession props={props.daoDelegates} />
        ) : searchParams.get("active") === "officeHours" ? (
          <OfficeHours props={props.daoDelegates} />
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

export default SpecificDAO;
