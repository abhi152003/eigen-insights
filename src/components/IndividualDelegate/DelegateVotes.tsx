import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { Pagination } from "@nextui-org/react";
import styles from "./DelegateVotes.module.css";

Chart.register(ArcElement, Tooltip, Legend);

function DelegateVotes() {
  const proposals = [
    {
      title:
        "Proposal Description Proposal Description Proposal Description Proposal Description",
      status: "For",
    },
    {
      title: "Proposal Description",
      status: "Against",
    },
    {
      title: "Proposal Description",
      status: "For",
    },
    {
      title: "Proposal Description",
      status: "Abstain",
    },
    {
      title: "Proposal Description",
      status: "Against",
    },
    {
      title: "Proposal Description",
      status: "Abstain",
    },
    {
      title: "Proposal Description",
      status: "For",
    },
    {
      title: "Proposal Description",
      status: "For",
    },
    {
      title: "Proposal Description",
      status: "Against",
    },
    {
      title: "Proposal Description",
      status: "For",
    },
    {
      title: "Proposal Description",
      status: "Abstain",
    },
    {
      title: "Proposal Description",
      status: "Against",
    },
    {
      title: "Proposal Description",
      status: "Abstain",
    },
    {
      title: "Proposal Description",
      status: "For",
    },
    {
      title: "Proposal Description",
      status: "Abstain",
    },
    {
      title: "Proposal Description",
      status: "Against",
    },
    {
      title: "Proposal Description",
      status: "Abstain",
    },
    
  ];

  const data = {
    labels: ["For", "Against", "Abstain"],
    datasets: [
      {
        label: "# of Votes",
        data: [12, 19, 9],
        backgroundColor: ["#0033A8", "#6B98FF", "#004DFF"],
        borderWidth: 1,
      },
    ],
  };

  const [allProposals, setAllProposal] = useState(proposals);
  const [currentPage, setCurrentPage] = useState(1);

  const totalData: number = proposals.length;
  const dataPerPage: number = 7;
  const totalPages: number = Math.ceil(totalData / dataPerPage);

  useEffect(() => {
    const offset = (currentPage - 1) * dataPerPage;
    const end = offset + dataPerPage;
    const initialData = proposals.slice(offset, end);
    setAllProposal(initialData);
  }, [currentPage, proposals, dataPerPage]);

  return (
    <div className="grid grid-cols-5 pe-5 gap-4">
      <div className="col-span-2 space-y-4">
        <div className="flex bg-[#3E3D3D] text-white py-6 px-10 rounded-xl">
          <div>
            <div className="font-semibold text-xl">14</div>
            <div className="text-sm"> Proposal&apos;s Voted</div>
          </div>
          <div className="border-[0.5px] border-[#8E8E8E] mx-4 my-1"></div>
          <div>
            <div className="font-semibold text-xl">
              2.56k <span className="text-sm font-normal">delegates</span>
            </div>
            <div className="text-sm"> Proposal&apos;s Voted</div>
          </div>
        </div>

        <div
          style={{ boxShadow: "0px 4px 15.1px 0px rgba(0, 0, 0, 0.17)" }}
          className="p-10 rounded-xl"
        >
          <Doughnut
            data={data}
            width={700}
            height={350}
            options={{
              maintainAspectRatio: false,
              animation: false,
            }}
          />
        </div>
      </div>
      <div
        style={{ boxShadow: "0px 4px 11.8px 0px rgba(0, 0, 0, 0.21)" }}
        className="min-h-10 border border-[#D9D9D9] rounded-xl col-span-3 p-7"
      >
        <div className="font-semibold text-blue-shade-200 text-2xl py-2">
          List of Proposals
        </div>

        <div className="h-[23rem]">
          {allProposals.length > 0 ? (
            allProposals.map((proposal, index) => (
              <div key={index} className="flex justify-between border border-[#7C7C7C] text-sm px-3 py-2 rounded-lg items-center my-3">
                <div className="flex items-center">
                  <div className={`${styles.desc}`}>{proposal.title}</div>
                  <div className="text-xs px-5 text-blue-shade-100 underline cursor-pointer">
                    View
                  </div>
                </div>
                <div
                  className={`text-white rounded-full px-3 py-[2px] ${
                    proposal.status === "For"
                      ? "bg-[#0033A8]"
                      : proposal.status === "Against"
                      ? "bg-[#6B98FF]"
                      : "bg-[#004DFF]"
                  }`}
                >
                  {proposal.status}
                </div>
              </div>
            ))
          ) : (
            <div>No data</div>
          )}
        </div>

        <div className="pt-4 flex items-end bottom-0 justify-center">
          <Pagination
            total={totalPages}
            initialPage={1}
            page={currentPage}
            onChange={setCurrentPage}
            showControls
          />
        </div>
      </div>
    </div>
  );
}

export default DelegateVotes;