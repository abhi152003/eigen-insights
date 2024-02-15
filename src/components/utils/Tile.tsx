import React from "react";
import Image, { StaticImageData } from "next/image";
import { Oval } from "react-loader-spinner";

interface Type {
  img: StaticImageData;
  title: string;
  dao: string;
  participant: number;
  host: string;
  started: string;
  desc: string;
  attendee:string;
}

interface TileProps {
  sessionDetails: Type[];
  dataLoading: boolean;
  isEvent:string;
  isOfficeHour:boolean;
}

function Tile({ sessionDetails, dataLoading, isEvent, isOfficeHour }: TileProps) {
  return (
    <div className="space-y-6">
      {sessionDetails.length > 0 ? (
        dataLoading ? (
          <Oval
            visible={true}
            height="50"
            width="50"
            color="#0500FF"
            secondaryColor="#cdccff"
            ariaLabel="oval-loading"
          />
        ) : (
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

              <div className="ps-6 pe-12 py-1">
                <div className="font-semibold text-blue-shade-200 text-xl">
                  {data.title}
                </div>

                <div className="flex space-x-4 py-2">
                  <div className="bg-[#1E1E1E] border border-[#1E1E1E] text-white rounded-md text-xs px-5 py-1 font-semibold">
                    {data.dao}
                  </div>
                  <div className="border border-[#1E1E1E] rounded-md text-[#1E1E1E] text-xs px-5 py-1 font-medium">
                    {data.participant} Participants
                  </div>
                </div>

                <div className="pt-2 pe-10">
                  <hr />
                </div>

                {
                    isOfficeHour ? (
                        <div className="flex gap-x-16 text-sm py-3">
                        <div className="text-[#3E3D3D]">
                          <span className="font-semibold">Host:</span> {data.host}
                        </div>
                        <div className="text-[#3E3D3D]">
                          {isEvent === "Upcoming" ? (
                                  <span className="font-semibold">Starts at:</span>
                              ) : isEvent === "Ongoing" ? (
                                  <span className="font-semibold">Started at:</span>
                              ) : isEvent === "Recorded" ? (
                                  <span className="font-semibold">Started at:</span>
                              ) : null
                          }
                          {data.started}
                        </div>
                      </div>
                    ) : (   <div className="flex gap-x-16 text-sm py-3">
                    <div className="text-[#3E3D3D]">
                      <span className="font-semibold">Attendee:</span>{" "}
                      {data.attendee.substring(0, 10)}...
                    </div>
                    <div className="text-[#3E3D3D]">
                      <span className="font-semibold">Host:</span>{" "}
                      {data.host.substring(0, 10)}...
                    </div>
                    <div className="text-[#3E3D3D]">
                        {isEvent === "Upcoming" ? (
                                  <span className="font-semibold">Starts at:</span>
                              ) : isEvent === "Ongoing" ? (
                                  <span className="font-semibold">Started at:</span>
                              ) : isEvent === "Recorded" ? (
                                  <span className="font-semibold">Started at:</span>
                              ) : null
                          }
                      {data.started}
                    </div>
                  </div>)
                }
               


             

                <div className="text-[#1E1E1E] text-sm">{data.desc}</div>
              </div>
            </div>
          ))
        )
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

export default Tile;