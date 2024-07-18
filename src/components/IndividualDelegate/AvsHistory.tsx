import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { ThreeCircles } from "react-loader-spinner";
import { IoCopy } from "react-icons/io5";
import { useRouter } from "next-nprogress-bar";
import copy from "copy-to-clipboard";
import toast, { Toaster } from "react-hot-toast";
import { formatDistanceStrict, formatDistanceToNow } from "date-fns";

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

const GET_DATA = gql`
  query MyQuery($id: ID!) {
    avsactions(
      where: { avs_: { id: $id } }
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      type
      blockTimestamp
      operator {
        id
      }
      blockNumber
      transactionHash
      quorumNumber
    }
  }
`;

function AvsHistory({ props }: { props: Type }) {
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [avsHistory, setAvsHistory] = useState<any[]>([]);
  const router = useRouter();
  const avsId = props.individualDelegate;
  const { loading, error, data } = useQuery(GET_DATA, {
    variables: {id: avsId},
    context: {
      subgraph: "avs"
    }
  });

  useEffect(() => {
    if (data) {
      console.log(data.avsactions);
      setAvsHistory(data.avsactions);
    }
  }, [data]);

  if (loading)
    return (
      <div className="flex items-center justify-center">
        <ThreeCircles
          visible={true}
          height="50"
          width="50"
          color="#FFFFFF"
          ariaLabel="three-circles-loading"
          wrapperStyle={{}}
        />
      </div>
    );
  if (error) {
    console.error("GraphQL Error:", error);
    return <p>Error: {error.message}</p>;
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return formatDistanceStrict(date, new Date(), { addSuffix: true });
  };

  const formatActionType = (type: string, quorumNumber: any) => {
    if (type === "OperatorRemovedFromQuorum") {
      return `Left Quorum ${quorumNumber}`;
    }
    if (type === "OperatorRemoved") {
      return "Left AVS";
    }
    if (type === "OperatorAddedToQuorum") {
      return `Joined Quorum ${quorumNumber}`;
    }
    if (type === "OperatorAdded") {
      return "Joined AVS";
    }
    return type;
  };

  const handleCopy = (addr: string) => {
    copy(addr);
    toast("Address Copied");
  };

  return (
    <div>
      <Toaster />
      <div className="py-8 pe-14 font-poppins">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full bg-midnight-blue overflow-x-auto">
            <thead>
              <tr className="bg-sky-blue bg-opacity-10">
                <th className="px-4 py-2 text-left">Event</th>
                <th className="px-4 py-2 text-left">Operator</th>
                <th className="px-4 py-2 text-left">Age</th>
                <th className="px-4 py-2 text-left">Block Number</th>
                <th className="px-4 py-2 text-left">Transaction Hash</th>
              </tr>
            </thead>
            <tbody>
              {avsHistory.map((action, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-700 hover:bg-sky-blue hover:bg-opacity-5 cursor-pointer transition-colors duration-150"
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    {formatActionType(action.type, action.quorumNumber)}
                  </td>
                  <td
                    className="px-3 py-2 whitespace-nowrap"
                    onClick={() =>
                      router.push(
                        `/operators/${action.operator.id}?active=info`
                      )
                    }
                  >
                    {action.operator.id}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {formatTimestamp(action.blockTimestamp)}
                  </td>
                  <td className="px-3 py-2">{action.blockNumber}</td>
                  <td
                    className="px-3 py-2 whitespace-nowrap"
                    onClick={() =>
                      window.open(
                        `https://etherscan.io/tx/${action.transactionHash}`,
                        "_blank"
                      )
                    }
                  >
                    {action.transactionHash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AvsHistory;
