// import { useRouter } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import React, { ChangeEvent, useState, useEffect } from "react";
import { InfinitySpin, Oval, RotatingLines } from "react-loader-spinner";
import { useAccount } from "wagmi";
import { useNetwork } from "wagmi";
import EILogo from "@/assets/images/daos/eigen_logo.png";
import Image from "next/image";

interface userInfoProps {
  description: string;
  onSaveButtonClick: (description?: string) => Promise<void>;
  isLoading: boolean;
  descAvailable: boolean;
  isDelegate: boolean;
  isSelfDelegate: boolean;
  daoName: string;
  restakedPoints: number;
}

function UserInfo({
  description,
  onSaveButtonClick,
  isLoading,
  descAvailable,
  isDelegate,
  isSelfDelegate,
  daoName,
  restakedPoints,
}: userInfoProps) {
  const { address } = useAccount();
  // const address = "0x5e349eca2dc61abcd9dd99ce94d04136151a09ee";
  const { chain, chains } = useNetwork();
  // const [description, setDescription] = useState(
  //   "Type your description here..."
  // );
  const [isEditing, setEditing] = useState(false);
  const [tempDesc, setTempDesc] = useState("");
  const [desc, setDesc] = useState<string>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isSessionHostedLoading, setSessionHostedLoading] = useState(true);
  const [isSessionAttendedLoading, setSessionAttendedLoading] = useState(true);
  const [isOfficeHoursHostedLoading, setOfficeHoursHostedLoading] =
    useState(true);
  const [isOfficeHourseAttendedLoading, setOfficeHoursAttendedLoading] =
    useState(true);
  const [sessionHostCount, setSessionHostCount] = useState(0);
  const [sessionAttendCount, setSessionAttendCount] = useState(0);
  const [officehoursHostCount, setOfficehoursHostCount] = useState(0);
  const [officehoursAttendCount, setOfficehoursAttendCount] = useState(0);
  let sessionHostingCount = 0;
  let sessionAttendingCount = 0;
  let officehoursHostingCount = 0;
  let officehoursAttendingCount = 0;
  let operator_or_avs = daoName;
  const [activeButton, setActiveButton] = useState("onchain");

  const handleDescChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setTempDesc(event.target.value);
    console.log("Temp Desc", event.target.value);
  };

  const handleSaveClick = async () => {
    setLoading(true);
    console.log("Desc", tempDesc);
    await onSaveButtonClick(tempDesc);
    setEditing(false);
    setLoading(false);
  };

  return (
    <div className="pt-4">
      {/* <div className="flex flex-col justify-between items-center">
      </div> */}

      <div className="flex gap-3 py-1 min-h-10 justify-center">
        <div className="text-white w-[200px] flex flex-col gap-[10px] items-center border-[0.5px] border-[#D9D9D9] rounded-xl p-4 tvlDiv">
          <Image
            src={EILogo}
            alt="Image not found"
            width={60}
            height={60}
            style={{ width: "53px", height: "53px" }}
            className="rounded-full"
          ></Image>
          <div className="text-light-cyan font-semibold">
            {restakedPoints.toFixed(2)}
          </div>
          <div>Restaked Points</div>
        </div>
      </div>

      <div
        style={{
          boxShadow: "0px 3px 7px 3px #A7DBF2",
          backgroundColor: "#214965",
        }}
        className={`flex flex-col justify-between min-h-48 rounded-xl my-7 me-32 p-3 
        ${isEditing ? "outline" : ""}`}
      >
        <textarea
          readOnly={!isEditing}
          className="outline-none min-h-48"
          onChange={handleDescChange}
          value={isEditing ? tempDesc : description}
          placeholder={"Type your description here..."}
          style={{
            backgroundColor: "#214965",
            color: "white",
            borderRadius: "6px",
            padding: "16px",
          }}
        />

        <div className="flex justify-end">
          {isEditing && (
            <button
              className="bg-light-blue text-white text-sm py-1 px-3 rounded-full font-semibold"
              onClick={handleSaveClick}
            >
              {loading ? "Saving" : "Save"}
            </button>
          )}

          {!isEditing && (
            <button
              className="bg-light-blue text-white text-sm py-1 px-4 mt-3 rounded-full font-semibold"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserInfo;
