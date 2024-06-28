import React, { useEffect, useState } from "react";
import { useRouter } from "next-nprogress-bar";
import { RotatingLines } from "react-loader-spinner";

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

function Attestations({
  props,
  delegateInfo,
}: {
  props: Type;
  delegateInfo: any;
}) {
    const [loading, setLoading] = useState(true);
  const [isDataLoading, setDataLoading] = useState<boolean>(false);
  const router = useRouter();
  const [sessionHostCount, setSessionHostCount] = useState(0);
  const [sessionAttendCount, setSessionAttendCount] = useState(0);
  const [officehoursHostCount, setOfficehoursHostCount] = useState(0);
  const [officehoursAttendCount, setOfficehoursAttendCount] = useState(0);
  const [isSessionHostedLoading, setSessionHostedLoading] = useState(true);
  const [isSessionAttendedLoading, setSessionAttendedLoading] = useState(true);
  const [isOfficeHoursHostedLoading, setOfficeHoursHostedLoading] =
    useState(true);
  const [isOfficeHoursAttendedLoading, setOfficeHoursAttendedLoading] =
    useState(true);
  const [activeButton, setActiveButton] = useState("onchain");
  const [isPageLoading, setPageLoading] = useState<boolean>(true);
  const [avsOperators, setAVSOperators] = useState<any[]>([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

    useEffect(() => {
        if (activeButton === "onchain") {
          fetchAttestation("onchain");
        } else if (activeButton === "offchain") {
          fetchAttestation("offchain");
        }
      }, [activeButton, props.individualDelegate, props.daoDelegates]);
    
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
            const response = await fetch(
              `/api/get-meeting/${props.individualDelegate}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            const result = await response.json();
            if (result.success) {
              result.data.forEach((item: any) => {
                if (
                  item.meeting_status === "Recorded" &&
                  item.operator_or_avs === props.daoDelegates &&
                  item[host_uid_key]
                ) {
                  sessionHostingCount++;
                }
                // console.log("op host count: ", sessionHostingCount);
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
            const response = await fetch(
              `/api/get-session-data/${props.individualDelegate}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  operator_or_avs: props.daoDelegates,
                }),
              }
            );
            const result = await response.json();
            if (result.success) {
              result.data.forEach((item: any) => {
                if (
                  item.meeting_status === "Recorded" &&
                  item.operator_or_avs === props.daoDelegates &&
                  item.attendees.some((attendee: any) => attendee[attendee_uid_key])
                ) {
                  sessionAttendingCount++;
                }
                // console.log("op attended count: ", sessionAttendingCount);
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
                address: props.individualDelegate,
              }),
            });
            const result = await response.json();
            // console.log("office hours result: ", result);
            if (result.length > 0) {
              result.forEach((item: any) => {
                if (
                  item.meeting_status === "inactive" &&
                  item.operator_or_avs === props.daoDelegates &&
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
                attendee_address: props.individualDelegate,
              }),
            });
            const result = await response.json();
            // console.log("office hours attended result: ", result);
            if (result.length > 0) {
              result.forEach((item: any) => {
                if (
                  item.meeting_status === "inactive" &&
                  item.operator_or_avs === props.daoDelegates &&
                  item.attendees.some((attendee: any) => attendee[attendee_uid_key])
                ) {
                  officehoursAttendingCount++;
                }
                // console.log("officehours attended: ", officehoursAttendingCount);
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
    
      const details = [
        {
          number: sessionHostCount,
          desc: "Sessions hosted",
          ref: `/${props.daoDelegates}/${props.individualDelegate}?active=delegatesSession&session=hosted`,
        },
        {
          number: sessionAttendCount,
          desc: "Sessions attended",
          ref: `/${props.daoDelegates}/${props.individualDelegate}?active=delegatesSession&session=attended`,
        },
        {
          number: officehoursHostCount,
          desc: "Office Hours hosted",
          ref: `/${props.daoDelegates}/${props.individualDelegate}?active=officeHours&hours=hosted`,
        },
        {
          number: officehoursAttendCount,
          desc: "Office Hours attended",
          ref: `/${props.daoDelegates}/${props.individualDelegate}?active=officeHours&hours=attended`,
        },
      ];
  return (
    <div>
      <div className="flex gap-16 text-sm py-3 mb-6 items-center justify-center">
        <button
          className={`
              ml-[-90px] p-9 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-100 outline-none duration-300 group
             ${
               activeButton === "onchain"
                 ? "text-light-cyan"
                 : "text-white font-bold border-white"
             } `}
          onClick={() => fetchAttestation("onchain")}
        >
          Onchain
        </button>
        <button
          className={` 
              ml-[-30px] p-5 border-[#A7DBF2] border-1 rounded-full px-6 
              border-b-3 font-medium overflow-hidden relative py-2 hover:brightness-150 hover:border-t-3 hover:border-b active:opacity-100 outline-none duration-300 group
            ${
              activeButton === "offchain"
                ? "text-light-cyan"
                : "text-white font-bold border-white"
            }`}
          onClick={() => fetchAttestation("offchain")}
        >
          Offchain
        </button>
      </div>

      <div className="grid grid-cols-4 pe-32 gap-10 px-12">
        {details.length > 0 ? (
          details.map((key, index) => (
            <div
              key={index}
              className="relative bg-gradient-to-r from-midnight-blue via-deep-blue to-slate-blue text-white rounded-2xl py-7 px-3 transform transition-transform duration-500 hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 border-2 border-transparent hover:border-white hover:border-dashed hover:border-opacity-50"
              onClick={() => router.push(`${key.ref}`)}
            >
              <div className="font-semibold text-3xl text-center pb-2 relative z-10">
                {isSessionHostedLoading &&
                isSessionAttendedLoading &&
                isOfficeHoursHostedLoading &&
                isOfficeHoursAttendedLoading ? (
                  <div className="flex items-center justify-center">
                    <RotatingLines
                      visible={true}
                      width="36"
                      strokeColor="grey"
                      ariaLabel="oval-loading"
                    />
                  </div>
                ) : (
                  key.number
                )}
              </div>
              <div className="text-center text-sm relative z-10">
                {key.desc}
              </div>
            </div>
          ))
        ) : (
          <div>No data available</div>
        )}
      </div>
    </div>
  );
}

export default Attestations;
