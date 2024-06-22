// import { useRouter } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import React, { useEffect, useState } from "react";
import {
  Comment,
  Hourglass,
  Oval,
  RotatingLines,
  ThreeDots,
} from "react-loader-spinner";


import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Toaster } from "react-hot-toast";
import { IoCopy } from "react-icons/io5";
import Image from "next/image";
import NOLogo from "@/assets/images/daos/operators.png";
import AVSLogo from "@/assets/images/daos/avss.png";
import EILogo from "@/assets/images/daos/eigen_logo.png";
import styles from "@/components/IndividualDelegate/DelegateVotes.module.css";

import { IoSearchSharp } from "react-icons/io5";
import "../../css/SearchShine.css";
import "../../css/ImagePulse.css"

// Register ChartJS modules
ChartJS.register(Title, Tooltip, Legend, ArcElement);

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

function DelegateInfo({ props, desc, delegateInfo }: { props: Type; desc: string, delegateInfo: any }) {

  const [loading, setLoading] = useState(true);
  const [isDataLoading, setDataLoading] = useState(true);
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
  const [avsOperators, setAVSOperators] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);

  
    useEffect(() => {
      if (props.daoDelegates === 'avss') {
        const fetchData = async () => {
          if (isDataFetched) return;

          const options = {method: 'GET'};
          const avsOperatorsrRes = await fetch(`https://api.eigenexplorer.com/avs/${props.individualDelegate}/operators?withTvl=true&skip=0&take=12`, options)
          
          const avsOperators = await avsOperatorsrRes.json();

          console.log("operatorsassssssssssssssss", avsOperators.data);
          setIsDataFetched(true); 
          setAVSOperators(avsOperators.data);
          setLoading(false);
          setDataLoading(false);
          setPageLoading(false);
        }
        fetchData();
      }
    })
  

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
              item.dao_name === props.daoDelegates &&
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
              dao_name: props.daoDelegates,
            }),
          }
        );
        const result = await response.json();
        if (result.success) {
          result.data.forEach((item: any) => {
            if (
              item.meeting_status === "Recorded" &&
              item.dao_name === props.daoDelegates &&
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
              item.dao_name === props.daoDelegates &&
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
              item.dao_name === props.daoDelegates &&
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(props.individualDelegate);
        const res = await fetch(
          `/api/get-statement?individualDelegate=${props.individualDelegate}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            // body: JSON.stringify({ individualDelegate: props.individualDelegate }),
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await res.json();
        const statement = data.statement.payload.delegateStatement;
        console.log("statement", statement);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [props.individualDelegate]);

  const renderParagraphs = (text: string) => {
    return text
      .split("\n")
      .filter((paragraph) => paragraph.trim() !== "")
      .map((paragraph, index) => (
        <p key={index} className="mb-3">
          {paragraph}
        </p>
      ));
  };

  type FilteredData = [string, number];

  const filteredData: FilteredData[] = Object.entries(delegateInfo.tvl.tvlStrategies)
    .filter(([key, value]) => value !== 0 && key !== "Eigen")
    .map(([key, value]) => [key, value as number]);

  // Create labels and data arrays
  const labels = filteredData.map(([key, value]) => key);
  const dataValues = filteredData.map(([key, value]) => value);

  // Define the data for the Pie chart
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'TVL Strategies',
        data: dataValues,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(199, 199, 199, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(83, 102, 255, 0.6)',
          'rgba(132, 206, 86, 0.6)',
          'rgba(192, 192, 75, 0.6)',
          'rgba(199, 83, 64, 0.6)',
          'rgba(102, 153, 255, 0.6)',
          'rgba(255, 83, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(199, 199, 199, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(83, 102, 255, 0.6)',
          'rgba(132, 206, 86, 0.6)',
          'rgba(192, 192, 75, 0.6)',
          'rgba(199, 83, 64, 0.6)',
          'rgba(102, 153, 255, 0.6)',
          'rgba(255, 83, 64, 0.6)',
        ],     
        borderWidth: 2
      }
    ]
  };

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalEth = delegateInfo.tvl.tvlRestaking

  const chartData = {
    labels: filteredData.map(([label]) => label),
    datasets: [
      {
        data: filteredData.map(([_, value]) => value),
        backgroundColor: [
          '#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#e74c3c',
          '#1abc9c', '#34495e', '#95a5a6', '#d35400', '#c0392b',
          '#16a085', '#8e44ad', '#2c3e50'
        ],
        borderColor: 'white',
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: false
      }
    },
    onHover: (event: any, chartElement: any) => {
      if (chartElement.length > 0) {
        setHoveredIndex(chartElement[0].index);
      } else {
        setHoveredIndex(null);
      }
    }
  };

  console.log("avs operatorsassssssssss", avsOperators);

  return (
    <div>
      {/* <div className="flex w-fit gap-16 border-1 border-white rounded-xl text-sm px-4 py-3 mb-6 ml-8">
      {/* <div
        style={{ boxShadow: "0px 4px 30.9px 0px rgba(0, 0, 0, 0.12)" }}
        className={`rounded-xl my-7 me-32 py-6 px-7 text-sm ${
          desc ? "" : "min-h-52"
        }`}
      >
        {loading ? (
          <div className="flex pt-6 justify-center">
            <ThreeDots
              visible={true}
              height="60"
              width="60"
              color="#0500FF"
              ariaLabel="oval-loading"
            />
          </div>
        ) : desc !== "" ? (
          desc
        ) : (
          <div className="font-semibold text-base flex justify-center">
            Descrption has not been provided
          </div>
        )}
      </div>
      <div className="flex w-fit gap-16 border-1 border-[#7C7C7C] px-6 rounded-xl text-sm mb-6">
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
      </div> */}
      <div className="grid grid-cols-4 pe-32 gap-10">
        {details.length > 0 ? (
          details.map((key, index) => (
            <div
              key={index}
              className="relative bg-gradient-to-r from-midnight-blue via-deep-blue to-slate-blue text-white w-[20rem] rounded-2xl p-7 transform transition-transform duration-500 hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 border-2 border-transparent hover:border-white hover:border-dashed hover:border-opacity-50"
              onClick={() => router.push(`${key.ref}`)}
            >
              {/* <div className="absolute top-2 right-2 h-4 w-4 bg-light-cyan rounded-full animate-ping"></div> */}
              <div className="font-semibold text-3xl text-center pb-2">
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
              <div className="text-center text-sm">{key.desc}</div>
            </div>
          ))
        ) : (
          <div>No data available</div>
        )}
      </div>

      <div className="flex justify-center mt-5 pe-16">
        {filteredData.length > 0 ? (
          <div className="w-full max-w-full md:max-w-4xl bg-gray-800 rounded-lg shadow-lg overflow-hidden mx-auto px-4">
          <div className="bg-light-blue p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Total</h2>
              <div className="text-right">
                <p className="text-2xl font-bold">{totalEth.toLocaleString(undefined, { maximumFractionDigits: 3 })} ETH</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-x-40">
              <div className="w-full md:w-1/2 pr-10">
                <div className="space-y-2">
                  {filteredData.map(([label, value], index) => (
                    <div key={label} className={`flex justify-between items-center rounded-md ${hoveredIndex === index ? 'bg-gray-600' : ''}`}>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full mr-1" style={{ backgroundColor: chartData.datasets[0].backgroundColor[index % chartData.datasets[0].backgroundColor.length] }}></div>
                        <span>{label}</span>
                      </div>
                      <span className="font-semibold">{value.toLocaleString(undefined, { maximumFractionDigits: 3 })}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full md:w-1/2 flex items-center justify-center mt-6 md:mt-0">
                <div style={{ width: '300px', height: '300px' }}>
                  <Pie data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        ) : (
          <p>No ETH stacked</p>
        )}
      </div>

      <h1 className="mt-10 mb-5 font-bold text-3xl">Node Operators</h1>
      <div className="py-8 pe-10 font-poppins">
        {isPageLoading ? (
          <div className="flex items-center justify-center">
            <Oval
              visible={true}
              height="40"
              width="40"
              color="#0500FF"
              secondaryColor="#cdccff"
              ariaLabel="oval-loading"
            />
          </div>
        ) : avsOperators.length > 0 ? (
          <div> 
            <div className="grid min-[475px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-4 gap-10">
              {avsOperators.map((daos: any, index: number) => (
                <div
                  onClick={(event) =>{
                    // handleMouseMove(event,index);
                    router.push(`/${props}/${daos.address}?active=info  `)
                  }}
                  key={index}
                  style={{
                    boxShadow: "0px 4px 50.8px 0px rgba(0, 0, 0, 0.11)",
                  }}
                  
                  className="px-5 py-7 rounded-2xl flex flex-col justify-between cursor-pointer relative bg-midnight-blue"
                >
                  {/* {clickedTileIndex === index && (
                    <div
                    className="absolute bg-blue-200 rounded-full animate-ping"
                    style={{
                    width: "30px",
                    height: "30px",
                    left: `${circlePosition.x -10}px`,
                    top: `${circlePosition.y - 10}px`,
                    zIndex: "9999",
                   }}
                   ></div>
                  )} */}
                  <div className="flex items-center justify-around">
                    <div className="flex justify-center">
                      <Image
                        src={
                          daos.metadataLogo == null
                            ? props.daoDelegates == "operators"
                              ? NOLogo
                              : props.daoDelegates == "avss"
                              ? AVSLogo
                              : ""
                            : daos.metadataLogo
                        }
                        alt="Image not found"
                        width={80}
                        height={80}
                        // layout="fixed"
                        className="rounded-full"
                        style={{ width: '80px', height: '80px' }} 
                      ></Image>

                      <Image
                        src={EILogo}
                        alt="EigenInsights Logo"
                        className="absolute top-7 right-4 pulsatingImage"
                        style={{
                          width: "35px",
                          height: "35px",
                          marginTop: "-20px",
                          marginRight: "-5px",
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <div className="py-3">
                        <div
                          className={`font-semibold overflow-hidden ${styles.desc}`}
                        >
                          {daos.metadataName == null ? (
                            <span>
                              {daos.address.slice(0, 6) +
                                "..." +
                                daos.address.slice(-4)}
                            </span>
                          ) : (
                            <span>
                              {daos.metadataName.length > 15
                                ? daos.metadataName.slice(0, 15) + "..."
                                : daos.metadataName}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-center items-center gap-2 pb-2 pt-1">
                          {daos.address.slice(0, 6) +
                            "..." +
                            daos.address.slice(-4)}
                        </div>
                        <div className="text-sm border border-[#D9D9D9] py-2 px-1 rounded-lg w-full">
                          <span className="text-light-cyan font-semibold">
                            {daos.totalStakers}&nbsp;
                          </span>
                          total stakers
                        </div>
                        <div
                          className={`font-semibold overflow-hidden ${styles.desc}`}
                        >
                          {daos.metadataDescription}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ zIndex: "21474836462" }}>
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
                </div>
              ))}
            </div>
            
            {isDataLoading && (
              <div className="flex items-center justify-center my-4">
                <RotatingLines
                  visible={true}
                  width="40"
                  strokeColor="#0500FF"
                  ariaLabel="oval-loading"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center pt-10">
            <div className="text-5xl">☹️</div>{" "}
            <div className="pt-4 font-semibold text-lg">
              Oops, no such result available!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DelegateInfo;
