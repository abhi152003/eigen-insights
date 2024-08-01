import React, { useEffect, useMemo } from "react";
import { gql, useQuery } from "@apollo/client";

const GET_OPERATOR_TOTAL_BATCHES = gql`
  query MyQuery($operatorId: String!) {
    operatorEigenDABatches(first: 1) {
      avs {
        activeOperators(where: { id: $operatorId }) {
          id
          totalUnsignedBatches
        }
        totalBatches
        totalBatches1W
        totalBatches4W
        totalBatches24H
      }
    }
  }
`;

const GET_OPERATOR_PERIODIC_BATCHES = gql`
  query MyQuery($operatorId: String!, $first: Int!) {
    operatorEigenDABatches(
      where: { nonSigningOperatorIds_contains: [$operatorId] }
      orderBy: blockTimestamp
      orderDirection: desc
      first: $first
    ) {
      blockTimestamp
      batchId
    }
  }
`;

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

function OperatorBatches({ props }: { props: Type }) {
  const {
    loading: totalBatchesLoading,
    error: totalBatchesError,
    data: totalBatchesData,
  } = useQuery(GET_OPERATOR_TOTAL_BATCHES, {
    variables: {
      operatorId: props.individualDelegate,
    },
  });

  const operatorData = useMemo(() => {
    if (!totalBatchesData) return null;
    const activeOperators =
      totalBatchesData.operatorEigenDABatches[0]?.avs?.activeOperators;
    return activeOperators?.find(
      (op: any) => op.id === props.individualDelegate
    );
  }, [totalBatchesData, props.individualDelegate]);

  const {
    loading: periodicBatchesLoading,
    error: periodicBatchesError,
    data: periodicBatchesData,
  } = useQuery(GET_OPERATOR_PERIODIC_BATCHES, {
    variables: {
      operatorId: props.individualDelegate,
      first: operatorData?.totalUnsignedBatches || 100,
    },
    skip: !operatorData,
  });

  const batchesData = useMemo(() => {
    if (!totalBatchesData || !periodicBatchesData || !operatorData) return [];

    const avs = totalBatchesData.operatorEigenDABatches[0].avs;
    const now = Date.now() / 1000; // current timestamp in seconds

    const calculateUnsignedBatches = (period: number) => {
      return periodicBatchesData.operatorEigenDABatches.filter((batch: any) => {
        const batchTime = parseInt(batch.blockTimestamp);
        return now - batchTime <= period;
      }).length;
    };

    const day1 = 24 * 60 * 60;
    const day7 = 7 * day1;
    const day28 = 28 * day1;

    const unsigned1d = calculateUnsignedBatches(day1);
    const unsigned7d = calculateUnsignedBatches(day7);
    const unsigned28d = calculateUnsignedBatches(day28);

    const totalUnsigned = operatorData.totalUnsignedBatches;
    const totalSigned = parseInt(avs.totalBatches) - totalUnsigned;

    return [
      {
        period: "1 day",
        signed: Math.max(0, parseInt(avs.totalBatches24H) - unsigned1d),
        missed: unsigned1d,
      },
      {
        period: "7 days",
        signed: Math.max(0, parseInt(avs.totalBatches1W) - unsigned7d),
        missed: unsigned7d,
      },
      {
        period: "28 days",
        signed: Math.max(0, parseInt(avs.totalBatches4W) - unsigned28d),
        missed: unsigned28d,
      },
      { period: "Overall", signed: totalSigned, missed: totalUnsigned },
    ];
  }, [totalBatchesData, periodicBatchesData, operatorData]);

  if (totalBatchesLoading || periodicBatchesLoading) return <p>Loading...</p>;
  if (totalBatchesError || periodicBatchesError) return <p>Error :(</p>;

  if (!operatorData) {
    return (
      <p className="justify-center text-center pe-16">
        No data available for this operator
      </p>
    );
  }

  const calculateSignPercentage = (signed: number, total: number) => {
    if (total === 0) return "100%";
    return ((signed / total) * 100).toFixed(2) + "%";
  };

  if (totalBatchesLoading || periodicBatchesLoading) {
    return (
      <div className="space-y-4 pe-16">
        <h2 className="text-2xl font-bold">EigenDA Batches</h2>
        <table className="w-full border-collapse bg-midnight-blue">
          <thead>
            <tr className="bg-[#1d4059]">
              <th className="p-2 text-left">Sign %</th>
              <th className="p-2 text-left">Period</th>
              <th className="p-2 text-left">Signed</th>
              <th className="p-2 text-left">Missed</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="border-b border-gray-700">
                <td className="p-2">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-600 mr-2 animate-pulse"></div>
                    <div className="w-16 h-4 bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </td>
                <td className="p-2">
                  <div className="w-24 h-4 bg-gray-600 rounded animate-pulse"></div>
                </td>
                <td className="p-2">
                  <div className="w-16 h-4 bg-gray-600 rounded animate-pulse"></div>
                </td>
                <td className="p-2">
                  <div className="w-16 h-4 bg-gray-600 rounded animate-pulse"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (totalBatchesError || periodicBatchesError) {
    console.log(totalBatchesError, periodicBatchesError);
  }

  return (
    <div className="space-y-4 pe-16">
      <h2 className="text-2xl font-bold">EigenDA Batches</h2>
      <table className="w-full border-collapse bg-midnight-blue">
        <thead>
          <tr className="bg-[#1d4059]">
            <th className="p-2 text-left">Sign %</th>
            <th className="p-2 text-left">Period</th>
            <th className="p-2 text-left">Signed</th>
            <th className="p-2 text-left">Missed</th>
          </tr>
        </thead>
        <tbody>
          {batchesData.map((batch, index) => (
            <tr key={index} className="border-b border-gray-700">
              <td className="p-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-green-500 mr-2"></div>
                  {calculateSignPercentage(
                    batch.signed,
                    batch.signed + batch.missed
                  )}
                </div>
              </td>
              <td className="p-2">{batch.period}</td>
              <td className="p-2">{batch.signed}</td>
              <td className="p-2">{batch.missed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OperatorBatches;
