import React, { useState } from "react";
import text1 from "@/assets/images/daos/texture1.png";
import text2 from "@/assets/images/daos/texture2.png";
import Image from "next/image";

function ClaimNFTs() {
  const details = [
    {
      img: text1,
      title:
        "Recorded Operators Open Forum: Governance, Applications, and Beyond",
      dao: "Operators",
      participant: 12,
      attendee: "olimpio.eth",
      host: "lindaxie.eth",
      started: "08/09/2023 01:00 PM EST",
      desc: "Join the conversation about the future of Operators. Discuss governance proposals, dApp adoption, and technical developments.",
    },
    {
      img: text2,
      title: "Open Forum: Governance, Applications, and Beyond",
      dao: "Operators",
      participant: 5,
      attendee: "olimpio.eth",
      host: "hexagon.eth",
      started: "07/09/2023 12:10 PM EST",
      desc: "Join the conversation about the future of Operators. Discuss governance proposals, dApp adoption, and technical developments.",
    },
  ];

  const [sessionDetails, setSessionDetails] = useState(details);

  return (
    <div className="pr-32 space-y-6 pt-4">
      {sessionDetails.length > 0 ? (
        sessionDetails.map((data, index) => (
          <div
            key={index}
            className="flex p-5 rounded-[2rem]"
            style={{ boxShadow: "0px 4px 26.7px 0px rgba(0, 0, 0, 0.10)" }}
          >
            <Image
              src={data.img}
              alt="image"
              className="w-44 h-44 rounded-3xl border border-[#D9D9D9]"
            />

            <div className="px-6 py-1">
              <div className="font-semibold text-light-cyan text-lg">
                {data.title}
              </div>

              <div className="flex space-x-4 py-2">
                <div className="bg-[#1E1E1E] border border-[#1E1E1E] text-white rounded-md text-xs px-5 py-1 font-semibold">
                  {data.dao}
                </div>
                <div className="border border-[#1E1E1E] rounded-md text-[#1E1E1E] text-xs px-5 py-1">
                  {data.participant} Views
                </div>
              </div>

              <div className="pt-1 pe-10">
                <hr />
              </div>

              <div className="flex gap-x-16 text-sm py-3">
                <div className="text-[#3E3D3D]">
                  <span className="font-semibold">Attendee:</span>{" "}
                  {data.attendee}
                </div>
                <div className="text-[#3E3D3D]">
                  <span className="font-semibold">Host:</span> {data.host}
                </div>
                <div className="text-[#3E3D3D]">
                  <span className="font-semibold">Started at:</span>{" "}
                  {data.started}
                </div>
              </div>

              <div className="text-[#1E1E1E] text-sm">{data.desc}</div>
            </div>

            <div className="flex items-end">
              <button className="bg-blue-shade-100 text-white text-sm py-1 px-3 rounded-full font-semibold outline-none">Claim</button>
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col justify-center items-center">
          <div className="text-5xl">☹️</div>{" "}
          <div className="pt-4 font-semibold text-lg">
            Oops, no such result available!
          </div>
        </div>
      )}
    </div>
  );
}

export default ClaimNFTs;
