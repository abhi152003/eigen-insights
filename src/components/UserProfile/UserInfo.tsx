// import { useRouter } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import React, { ChangeEvent, useState, useEffect } from "react";
import { InfinitySpin, Oval, RotatingLines } from "react-loader-spinner";
import { useAccount } from "wagmi";
import { useNetwork } from "wagmi";

interface userInfoProps {
  description: string;
  onSaveButtonClick: (description?: string) => Promise<void>;
  isLoading: boolean;
  descAvailable: boolean;
  isDelegate: boolean;
  isSelfDelegate: boolean;
  daoName: string;
}

function UserInfo({
  description,
  onSaveButtonClick,
  isLoading,
  descAvailable,
  isDelegate,
  isSelfDelegate,
  daoName,
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
  let dao_name = daoName;
  const [activeButton, setActiveButton] = useState("onchain");

  const fetchAttestation = async (buttonType: string) => {
    let sessionHostingCount = 0;
    let sessionAttendingCount = 0;
    let officehoursHostingCount = 0;
    let officehoursAttendingCount = 0;

    setActiveButton(buttonType);
    setSessionHostedLoading(true);
    setSessionAttendedLoading(true);
    setOfficeHoursHostedLoading(true);
    setOfficeHoursAttendedLoading(true);

    const host_uid_key =
      buttonType === "onchain" ? "onchain_host_uid" : "uid_host";

    const attendee_uid_key =
      buttonType === "onchain" ? "onchain_uid_attendee" : "attendee_uid";

    const sessionHosted = async () => {
      try {
        const response = await fetch(`/api/get-meeting/${address}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        if (result.success) {
          result.data.forEach((item: any) => {
            console.log("item uid: ", item[host_uid_key], host_uid_key);
            if (
              item.meeting_status === "Recorded" &&
              item.dao_name === dao_name &&
              item[host_uid_key]
            ) {
              sessionHostingCount++;
            }
            setSessionHostCount(sessionHostingCount);
            setSessionHostedLoading(false);
          });
        } else {
          setSessionHostedLoading(false);
        }
      } catch (e) {
        console.log("Error: ", e);
      }
    };

    const sessionAttended = async () => {
      try {
        const response = await fetch(`/api/get-session-data/${address}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dao_name: dao_name,
          }),
        });
        const result = await response.json();
        if (result.success) {
          result.data.forEach((item: any) => {
            if (
              item.meeting_status === "Recorded" &&
              item.dao_name === dao_name &&
              item.attendees.some((attendee: any) => attendee[attendee_uid_key])
            ) {
              sessionAttendingCount++;
            }
            setSessionAttendCount(sessionAttendingCount);
            setSessionAttendedLoading(false);
          });
        } else {
          setSessionAttendedLoading(false);
        }
      } catch (e) {
        console.log("Error: ", e);
      }
    };

    const officeHoursHosted = async () => {
      try {
        const response = await fetch(`/api/get-officehours-address`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: address,
          }),
        });
        const result = await response.json();
        // console.log("office hours result: ", result);
        if (result.length > 0) {
          result.forEach((item: any) => {
            if (
              item.meeting_status === "inactive" &&
              item.dao_name === dao_name &&
              item[host_uid_key]
            ) {
              officehoursHostingCount++;
            }

            // console.log("office hours host count: ", officehoursHostingCount);
            setOfficehoursHostCount(officehoursHostingCount);
            setOfficeHoursHostedLoading(false);
          });
        } else {
          setOfficeHoursHostedLoading(false);
        }
      } catch (e) {
        console.log("Error: ", e);
      }
    };

    const officeHoursAttended = async () => {
      try {
        const response = await fetch(`/api/get-attendee-individual`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attendee_address: address,
          }),
        });
        const result = await response.json();
        // console.log("office hours attended result: ", result);
        if (result.length > 0) {
          result.forEach((item: any) => {
            if (
              item.meeting_status === "inactive" &&
              item.dao_name === dao_name &&
              item.attendees.some((attendee: any) => attendee[attendee_uid_key])
            ) {
              officehoursAttendingCount++;
            }

            setOfficehoursAttendCount(officehoursAttendingCount);
            setOfficeHoursAttendedLoading(false);
          });
        } else {
          setOfficeHoursAttendedLoading(false);
        }
      } catch (e) {
        console.log("Error: ", e);
      }
    };

    sessionHosted();
    sessionAttended();
    officeHoursHosted();
    officeHoursAttended();
  };

  useEffect(() => {
    if (activeButton === "onchain") {
      fetchAttestation("onchain");
    } else if (activeButton === "offchain") {
      fetchAttestation("offchain");
    }
  }, [activeButton, address, chain]);

  const blocks = [
    {
      number: sessionHostCount,
      desc: "Sessions hosted",
      ref: `/profile/${address}}?active=sessions&session=hosted`,
    },
    {
      number: sessionAttendCount,
      desc: "Sessions attended",
      ref: `/profile/${address}}?active=sessions&session=attended`,
    },
    {
      number: officehoursHostCount,
      desc: "Office Hours hosted",
      ref: `/profile/${address}}?active=officeHours&hours=attended`,
    },
    {
      number: officehoursAttendCount,
      desc: "Office Hours attended",
      ref: `/profile/${address}}?active=officeHours&hours=attended`,
    },
  ];

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
      <div className="flex justify-between items-center">
        <div className="flex w-fit gap-16 border-1 border-white rounded-xl text-sm px-4 py-3 mb-6 ml-8">
          <button
            className={`
            p-9 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-4 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-100 outline-none duration-300 group
             ${
               activeButton === "onchain"
                 ? "text-light-cyan"
                 : "text-white font-bold"
             } `}
            onClick={() => fetchAttestation("onchain")}
          >
            <span className="bg-navy-blue shadow-light-cyan absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-100 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
            Onchain
          </button>
          <button
            className={` 
            p-5 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-4 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-100 outline-none duration-300 group
            ${
              activeButton === "offchain"
                ? "text-light-cyan"
                : "text-white font-bold"
            }`}
            onClick={() => fetchAttestation("offchain")}
          >
            <span className="bg-navy-blue shadow-light-cyan absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-70 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
            Offchain
          </button>
        </div>
        <div className="grid grid-cols-2 pe-32 gap-10">
          {blocks.length > 0 ? (
            // blocks.map((key, index) => (
            //   <div
            //     key={index}
            //     className={`bg-[#11334D] text-white w-[20rem] rounded-2xl px-3 py-7 ${
            //       isDelegate === true || isSelfDelegate === true
            //         ? "cursor-pointer"
            //         : ""
            //     }`}
            //     onClick={
            //       isSelfDelegate === true || isDelegate === true
            //         ? () => router.push(`${key.ref}`)
            //         : undefined
            //     }
            //   >
            //     <div className="font-semibold text-3xl text-center pb-2">
            //       {isSessionHostedLoading &&
            //       isSessionAttendedLoading &&
            //       isOfficeHoursHostedLoading &&
            //       isOfficeHourseAttendedLoading ? (
            //         <div className="flex items-center justify-center">
            //           <RotatingLines
            //             visible={true}
            //             width="36"
            //             strokeColor="grey"
            //             ariaLabel="oval-loading"
            //           />
            //         </div>
            //       ) : (
            //         key.number
            //       )}
            //     </div>
            //     <div className="text-center text-sm">{key.desc}</div>
            //   </div>
            // ))
            blocks.map((key, index) => (
              <div
                key={index}
                className={`relative bg-gradient-to-r from-midnight-blue via-deep-blue to-slate-blue text-white w-[20rem] rounded-2xl p-7 transform transition-transform duration-500 hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 border-2 border-transparent hover:border-white hover:border-dashed hover:border-opacity-50 ${
                  isDelegate === true || isSelfDelegate === true
                    ? "cursor-pointer"
                    : ""
                }`}
                onClick={
                  isSelfDelegate === true || isDelegate === true
                    ? () => router.push(`${key.ref}`)
                    : undefined
                }
              >
                <div className="absolute top-2 right-2 h-4 w-4 bg-light-cyan rounded-full animate-ping"></div>
                <div className="font-semibold text-4xl text-center pb-2 relative z-10">
                  {isSessionHostedLoading &&
                  isSessionAttendedLoading &&
                  isOfficeHoursHostedLoading &&
                  isOfficeHourseAttendedLoading ? (
                    <div className="flex items-center justify-center -ml-12">
                      <InfinitySpin
                        width="100"
                        color="#FFFFFF"
                      />
                    </div>
                  ) : (
                    key.number
                  )}
                </div>
                <div className="text-center text-lg relative z-10">
                  {key.desc}
                </div>

                {/* New additions for extra styles */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-transparent via-white to-transparent animate-pulse"></div>
                <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-transparent via-white to-transparent animate-pulse"></div>

                <div className="absolute inset-0 bg-black opacity-10 rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-5 mix-blend-overlay rounded-2xl"></div>

                <div className="absolute inset-0 backdrop-blur-sm rounded-2xl"></div>
              </div>
            ))
          ) : (
            <div>No data available</div>
          )}
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
