import React, { useState } from "react";
import Image, { StaticImageData } from "next/image";
import { Oval, ThreeCircles } from "react-loader-spinner";
import IndividualTileModal from "./IndividualTileModal";
import staticImg from "@/assets/images/daos/texture1.png";
import { useAccount } from "wagmi";
import { Tooltip } from "@nextui-org/react";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import styles from "./Tile.module.css";
import { usePathname } from "next/navigation";
import { useRouter } from "next-nprogress-bar";

interface Type {
  img: StaticImageData;
  title: string;
  dao: string;
  participant: number;
  host: string;
  started: string;
  desc: string;
  attendee: string;
  video_uri?: string;
  operator_or_avs: string;
  host_address: string;
  office_hours_slot: string;
  description: string;
}

interface TileProps {
  sessionDetails: any;
  dataLoading: boolean;
  isEvent: string;
  isOfficeHour: boolean;
}

function Tile({
  sessionDetails,
  dataLoading,
  isEvent,
  isOfficeHour,
}: TileProps) {
  const router = useRouter();
  const path = usePathname();
  const { address } = useAccount();
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(
    null
  );

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [applyStyles, setApplyStyles] = useState(true);
  const [startLoading, setStartLoading] = useState(false);

  const openModal = (index: number) => {
    setSelectedTileIndex(index);
  };

  const closeModal = () => {
    setSelectedTileIndex(null);
  };

  const handleDescription = () => {
    setApplyStyles(!applyStyles);
  };

  return (
    <div className="space-y-6">
      {sessionDetails.length > 0 ? (
        dataLoading ? (
          <ThreeCircles
            visible={true}
            height="50"
            width="50"
            color="#FFFFFF"
            ariaLabel="three-circles-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        ) : (
          sessionDetails.map((data: any, index: any) => (
            <div
              key={index}
              className={`flex p-5 rounded-[2rem] justify-between bg-deep-blue 
                 ${isEvent === "Recorded" ? "cursor-pointer" : ""}`}
              style={{ boxShadow: "0px 4px 26.7px 0px rgba(0, 0, 0, 0.10)" }}
              // onClick={() => openModal(index)}
              onClick={
                isEvent === "Recorded"
                  ? () => router.push(`/watch/${data.meetingId}`)
                  : () => null
              }
            >
              <div className="flex">
                <Image
                  src={staticImg}
                  alt="image"
                  className="w-44 h-44 rounded-3xl border border-[#D9D9D9]"
                />

                <div className="ps-6 pe-12 py-1">
                  <div className="font-semibold text-white text-xl">
                    {data.title}
                  </div>

                  <div className="flex space-x-4 py-2">
                    <div className="bg-midnight-blue border border-white text-white rounded-md text-sm px-5 py-2 font-semibold flex items-center">
                      {data.operator_or_avs}
                    </div>
                    <div className="border border-white rounded-md text-whitetext-xs px-5 py-2 text-sm flex items-center">
                      {data.attendees ? data.attendees.length : 0} Participants
                    </div>
                  </div>

                  <div className="pt-2 pe-10">
                    <hr />
                  </div>

                  {isOfficeHour ? (
                    <div className="flex gap-x-16 text-sm py-3">
                      <div className="text-light-cyan">
                        <span className="font-semibold">Host:</span>{" "}
                        {data.host_address}
                      </div>
                      <div className="text-white">
                        {isEvent === "Upcoming" ? (
                          <span className="font-semibold">Starts at: </span>
                        ) : isEvent === "Ongoing" ? (
                          <span className="font-semibold">Started at: </span>
                        ) : isEvent === "Recorded" ? (
                          <span className="font-semibold">Started at: </span>
                        ) : null}
                        {new Date(data.office_hours_slot).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-x-16 text-sm py-3">
                      <div className="text-[#3E3D3D]">
                        <span className="font-semibold">Guest:</span>{" "}
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
                        ) : null}
                        {data.started}
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-[#1E1E1E] text-sm cursor-pointer ${
                      applyStyles ? `${styles.desc} cursor-pointer` : ""
                    }`}
                    onClick={handleDescription}
                  >
                    {data.description}
                  </div>
                </div>
              </div>

              {isEvent === "Ongoing" ? (
                <div className="flex flex-col justify-items-end">
                  <div className="text-center bg-blue-shade-100 rounded-full font-bold text-white py-2 px-3 text-xs cursor-pointer">
                    <a
                      href={`/meeting/officehours/${data.meetingId}/lobby`}
                      rel="noopener noreferrer"
                      onClick={() => setStartLoading(true)}
                    >
                      {startLoading ? (
                        <>
                          <ThreeCircles
                            visible={true}
                            height="50"
                            width="50"
                            color="#FFFFFF"
                            ariaLabel="three-circles-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                          />
                        </>
                      ) : (
                        "Join"
                      )}
                    </a>
                  </div>
                </div>
              ) : null}
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

      {selectedTileIndex !== null && isEvent === "Recorded" ? (
        <IndividualTileModal
          title={sessionDetails[selectedTileIndex].title}
          description={sessionDetails[selectedTileIndex].description}
          videoUrl={sessionDetails[selectedTileIndex].video_uri || ""}
          date={sessionDetails[selectedTileIndex].office_hours_slot}
          host={sessionDetails[selectedTileIndex].host_address}
          attendees={sessionDetails[selectedTileIndex].attendees}
          dao={sessionDetails[selectedTileIndex].operator_or_avs}
          // host_attestation={sessionDetails[selectedTileIndex].uid_host}
          onClose={closeModal}
        />
      ) : null}
    </div>
  );
}

export default Tile;
