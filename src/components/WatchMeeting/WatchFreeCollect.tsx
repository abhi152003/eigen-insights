"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import op from "@/assets/images/daos/op.png";
import upArrow from "@/assets/images/watchmeeting/up-arrow.svg";
import { RiArrowDropDownLine } from "react-icons/ri";
import { IoArrowUpOutline } from "react-icons/io5";
import styles from "./WatchSession.module.css";
import { RxCross2 } from "react-icons/rx";
import operators from "../../assets/images/daos/Operator4.jpg";

const WatchFreeCollect = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(true);
  const [number, setNumber] = useState(1);
  const PlusIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="white"
      width="32"
      height="32"
      className="bg-medium-blue"
      style={{ borderRadius: "50%", padding: "4px", cursor: "pointer" }}
      onClick={() => setNumber(number + 1)}
    >
      <path
        fillRule="evenodd"
        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
        clipRule="evenodd"
      />
    </svg>
  );

  const MinusIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="white"
      width="32"
      height="32"
      className="bg-medium-blue"
      style={{ borderRadius: "50%", padding: "4px", cursor: "pointer" }}
      onClick={() => setNumber(number > 1 ? number - 1 : 1)}
    >
      <path
        fillRule="evenodd"
        d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
  return (
    <div className="rounded-3xl border-2 border-black-shade-200 font-poppins ">
      <div className="flex justify-evenly items-center w-full rounded-t-3xl bg-midnight-blue py-3">
        <div className="flex">
          <p className="font-medium xl:text-base 1.7xl:text-lg text-white">
            💸Free
          </p>
          {showComingSoon && (
            <div className="flex items-center bg-yellow-100 border border-yellow-400 rounded-full px-2 ml-4">
              <p className="text-sm text-yellow-700 mr-2">Coming Soon</p>
              <button
                onClick={() => setShowComingSoon(false)}
                className="text-yellow-700 hover:text-yellow-800"
              >
                <RxCross2 size={12} />
              </button>
            </div>
          )}
        </div>
        <div className="px-2 py-1 border-2 border-light-cyan bg-medium-blue w-fit rounded-md">
          <p className="text-white font-medium text-sm">14320 Collected</p>
        </div>
      </div>
      <div className="w-full h-[0.1px] bg-black-shade-200"></div>
      <div className="grid grid-cols-2 1.5lg:px-6 px-3">
        <div className="flex items-center">
          <MinusIcon />
          <div className="bg-white text-black py-1 px-4 1.5lg:mx-3 mx-1.5 rounded w-12 flex justify-center">
            {number}
          </div>
          <PlusIcon />
        </div>

        {/* <button
            className={`text-white bg-black rounded-full py-5 px-6 text-xs font-semibold my-6 blob-btn ${
              isOpen ? "bg-black-shade-700" : ""
            } ${styles.blobBtn}`}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            Collect Now
            
            </button> */}

        <button
          className={`text-black bg-white rounded-full 1.5lg:py-5 py-3 1.5lg:px-6 px-0.5 text-xs font-semibold my-6 ${
            styles["blob-btn"]
          } ${isOpen ? "bg-white" : "bg-white"}`}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          Collect Now
          <span className={styles["blob-btn__inner"]}>
            <span className={styles["blob-btn__blobs"]}>
              <span className={styles["blob-btn__blob"]}></span>
              <span className={styles["blob-btn__blob"]}></span>
              <span className={styles["blob-btn__blob"]}></span>
              <span className={styles["blob-btn__blob"]}></span>
            </span>
          </span>
        </button>
      </div>

      {/* collect menu */}
      <div
        className={`w-full font-poppins ${styles.slideDown} ${
          isOpen ? styles.open : ""
        }  `}
      >
        {(isOpen || !isOpen) && (
          <div className="w-full font-poppins">
            <p className="mx-6 font-normal text-xs mb-2 text-white">
              Pay Using
            </p>
            <div className="flex justify-between mx-6 items-center bg-midnight-blue py-1 border border-black-shade-400 px-3 rounded-xl">
              <div className="flex gap-2">
                <Image
                  src={operators}
                  alt=""
                  style={{width: "40%", height: "40%"}}
                  className="my-2"
                />
                <div className="flex flex-col justify-center items-start">
                  <p className="font-normal text-xs text-white">Operators</p>
                  <p className="font-normal text-[10px] text-white">
                    0.0002314
                  </p>
                </div>
              </div>
              <RiArrowDropDownLine className="" style={{ fontSize: "2rem" }} />
            </div>
            <div className="mx-6 flex justify-between items-center text-xs mb-2 mt-3">
              <p className="font-normal text-white">Cost</p>
              <p className="text-green-shade-100 font-normal">Free</p>
            </div>
            <div className="w-full h-[0.1px] bg-black-shade-200"></div>
            <div className="mx-6 flex justify-between items-center text-xs my-2 text-white font-normal">
              <p className="">Platform Fee</p>
              <p className="">0.0004 ETH</p>
            </div>
            <div className="w-full h-[0.1px] bg-black-shade-200"></div>
            <div className="mx-6 flex justify-between items-center text-xs my-2 text-white ">
              <p className="font-semibold">Total</p>
              <div className="flex gap-2">
                <p className="text-white">~$3.04</p>
                <p className="font-semibold text-white">0.0004 ETH</p>
              </div>
            </div>
            <div className=" mx-6 mt-6 flex justify-center items-center">
              {/* <button className="font-bold text-base w-fit py-3 px-12 bg-midnight-blue text-white flex items-center hover:bg-medium-blue justify-center rounded-full">
                Mint
              </button> */}
              <button
                className="bg-midnight-blue text-white rounded-full cursor-pointer font-semibold overflow-hidden relative z-100 border-2 border-white group text-base w-fit py-3 px-12"
              >
                <span className="relative z-10 text-white group-hover:text-white text-xl duration-500">
                  Delegate
                </span>
                <span className="absolute w-full h-full bg-light-blue -left-32 top-0 -rotate-45 group-hover:rotate-0 group-hover:left-0 duration-1500"></span>
                <span className="absolute w-full h-full bg-light-blue -right-32 top-0 -rotate-45 group-hover:rotate-0 group-hover:right-0 duration-1500"></span>
              </button>
            </div>
            <div className="flex justify-center items-center my-4">
              <div
                className="flex p-1 rounded-full border border-blue-shade-500 w-fit justify-center items-center cursor-pointer hover:bg-light-blue"
                onClick={() => setIsOpen((prev) => !prev)}
              >
                {/* <Image src={upArrow} alt="" width={24} height={24} className="hover:fill-blue-shade-100"/> */}
                <IoArrowUpOutline className={`w-6 h-6 text-blue-shade-500 `} />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="buttons hidden">
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
          <defs>
            <filter id="goo">
              <feGaussianBlur
                in="SourceGraphic"
                result="blur"
                stdDeviation="10"
              ></feGaussianBlur>
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 21 -7"
                result="goo"
              ></feColorMatrix>
              <feBlend in2="goo" in="SourceGraphic" result="mix"></feBlend>
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default WatchFreeCollect;
