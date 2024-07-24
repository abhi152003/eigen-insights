"use client";
import React from "react";
import { useCallback, useEffect, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import ConnectWalletWithENS from "../../../components/ConnectWallet/ConnectWalletWithENS";
import "../../../css/SearchShine.css";

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

const Page = ({ props }: { props: string }) => {

  const [delegateData, setDelegateData] = useState<{ delegates: any[] }>({
    delegates: [],
  });
  const [tempData, setTempData] = useState<{ delegates: any[] }>({
    delegates: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isPageLoading, setPageLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(true);

  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
    setPageLoading(true);

    if (query.length > 0) {
      setIsSearching(true);

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
    }
  };

  return (
    <div className="py-6">
      <div className="pr-8 pb-3 pl-16">
        <div className="flex items-center justify-between pe-10">
          <div className="flex items-center text-light-cyan text-[2.2rem] font-normal">
            Restakers
          </div>
          <div>
            <ConnectWalletWithENS />
          </div>
        </div>
        <div className="pt-3 pb-1 pr-8 font-normal text-lg">
          Restakers are Ethereum holders who delegate their staked assets to
          operators on EigenLayer. By doing so, they contribute to the security
          of the network and earn rewards based on the performance of the AVSs
          supported by the operators.
        </div>
        <div className="searchBox my-6">
          <input
            className="searchInput"
            type="text"
            name=""
            placeholder="Search restaker by address"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <button className="searchButton">
            <IoSearchSharp className="iconExplore" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
