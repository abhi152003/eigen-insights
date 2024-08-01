import React, { useEffect, useState } from "react";
import {
  gql,
  useQuery,
  ApolloClient,
  NormalizedCacheObject,
} from "@apollo/client";
import client from "../utils/avsExplorerClient";
import { Tooltip } from "@nextui-org/react";
import { useRouter } from "next-nprogress-bar";

interface Props {
  client: ApolloClient<NormalizedCacheObject>;
}

interface Batch {
  nonSigningOperatorIds: string[];
  batchId: string;
  blockTimestamp: string;
}

interface OperatorMetadata {
  id: string;
  metadataURI: string;
}

interface OperatorDetails {
  name: string;
  logo: string;
}

interface ProcessedOperator {
  id: string;
  name: string;
  logo: string;
  missed: string;
  lastMissed: string;
  missedCount: number;
  batches: BatchInfo[];
}

interface BatchInfo {
  batchId: string;
  timestamp: string;
  status: "missed" | "signed";
}

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

const GET_OPERATOR_WITH_ISSUES = gql`
  query GetOperatorWithIssues {
    operatorEigenDABatches(
      orderBy: blockTimestamp
      orderDirection: desc
      first: 100
    ) {
      nonSigningOperatorIds
      batchId
      blockTimestamp
    }
  }
`;

const GET_OPERATOR_METADATA = gql`
  query GetOperatorMetadata($operatorId: ID!) {
    operator(id: $operatorId) {
      id
      metadataURI
    }
  }
`;

function OperatorsWithIssues({ props }: { props: Type }): JSX.Element {
  const router = useRouter();
  const [operatorsData, setOperatorsData] = useState<ProcessedOperator[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    data: batchesData,
    loading: batchesLoading,
    error: batchesError,
  } = useQuery<{ operatorEigenDABatches: Batch[] }>(GET_OPERATOR_WITH_ISSUES);

  useEffect(() => {
    const processData = async () => {
      if (!batchesData) return;

      try {
        console.log("Processing batches data:", batchesData);
        const operators: {
          [key: string]: {
            id: string;
            missedCount: number;
            lastMissed: number;
          };
        } = {};
        batchesData.operatorEigenDABatches.forEach((batch) => {
          batch.nonSigningOperatorIds.forEach((operatorId) => {
            if (!operators[operatorId]) {
              operators[operatorId] = {
                id: operatorId,
                missedCount: 1,
                lastMissed: parseInt(batch.blockTimestamp),
              };
            } else {
              operators[operatorId].missedCount++;
              operators[operatorId].lastMissed = Math.max(
                operators[operatorId].lastMissed,
                parseInt(batch.blockTimestamp)
              );
            }
          });
        });

        console.log("Processed operators:", operators);

        const operatorPromises = Object.values(operators).map(
          async (operator) => {
            try {
              const { data } = await client.query<{
                operator: OperatorMetadata;
              }>({
                query: GET_OPERATOR_METADATA,
                variables: { operatorId: operator.id },
                context: {
                  subgraph: "avs",
                },
              });
              console.log("Operator metadata:", data);
              const metadata: OperatorDetails = await fetch(
                data.operator.metadataURI
              ).then((res) => res.json());
              console.log("Fetched metadata:", metadata);

              const batches: BatchInfo[] =
                batchesData.operatorEigenDABatches.map((batch, index) => ({
                  batchId: batch.batchId,
                  timestamp: new Date(
                    parseInt(batch.blockTimestamp) * 1000
                  ).toLocaleString(),
                  status: batch.nonSigningOperatorIds.includes(operator.id)
                    ? "missed"
                    : "signed",
                }));

              return {
                ...operator,
                name: metadata.name,
                logo: metadata.logo,
                missed:
                  (
                    (operator.missedCount /
                      batchesData.operatorEigenDABatches.length) *
                    100
                  ).toFixed(0) + "%",
                lastMissed: formatLastMissed(
                  Date.now() / 1000 - operator.lastMissed
                ),

                batches,
              };
            } catch (error) {
              console.error("Error processing operator:", operator.id, error);
              return null;
            }
          }
        );

        const formatLastMissed = (timeDiff: number): string => {
          const hours = Math.floor(timeDiff / 3600);
          const minutes = Math.floor((timeDiff % 3600) / 60);

          if (hours < 1) {
            return `${minutes} mins`;
          } else {
            return `${hours} h ${minutes} m`;
          }
        };

        const processedOperators = (await Promise.all(operatorPromises)).filter(
          (op): op is ProcessedOperator => op !== null
        );
        console.log("Processed operators data:", processedOperators);
        setOperatorsData(
          processedOperators.sort(
            (a, b) => parseInt(a.missed) - parseInt(b.missed)
          )
        );
      } catch (error) {
        console.error("Error processing data:", error);
        setError("An error occurred while processing the data.");
      }
    };

    processData();
  }, [batchesData, client]);

  if (batchesLoading) return <p>Loading...</p>;
  if (batchesError) return <p>Error loading batches: {batchesError.message}</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4 pe-16">
      <table className="w-full bg-midnight-blue">
        <thead>
          <tr className="text-left bg-[#1d4059]">
            <th className="p-2">Operator</th>
            <th className="p-2">Missed</th>
            <th className="p-2 whitespace-nowrap">Last missed</th>
            <th className="p-2">Batches</th>
          </tr>
        </thead>
        <tbody>
          {operatorsData.length === 0 ? (
            <tr>
              <td className="p-2" colSpan={4}>
                No data available
              </td>
            </tr>
          ) : (
            operatorsData.map((operator, index) => (
              <tr key={operator.id} className="border-b border-gray-700">
                <td
                  className="p-2 flex items-center cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/operators/${operator.id}?active=info`
                    )
                  }
                >
                  <span className="mr-2">{index + 1}</span>
                  <img
                    src={operator.logo}
                    alt={operator.name}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <span>{operator.name}</span>
                </td>
                <td className="p-2 text-red-500">{operator.missed}</td>
                <td className="p-2">{operator.lastMissed}</td>
                <td className="p-2">
                  <div className="flex flex-wrap">
                    {operator.batches.map((batch, i) => (
                      <Tooltip
                        key={i}
                        content={
                          <div className="bg-gray-800 text-white p-2 rounded shadow-lg">
                            <p className="font-bold">{batch.batchId}</p>
                            <p>{batch.timestamp}</p>
                            <p
                              className={
                                batch.status === "missed"
                                  ? "text-red-400"
                                  : "text-green-400"
                              }
                            >
                              Status: {batch.status}
                            </p>
                          </div>
                        }
                      >
                        <div
                          className={`w-2 h-2 m-[1px] ${
                            batch.status === "missed"
                              ? "bg-red-500"
                              : "bg-green-500"
                          }`}
                        />
                      </Tooltip>
                    ))}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default OperatorsWithIssues;
