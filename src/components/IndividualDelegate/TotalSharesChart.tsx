import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { useQuery } from "@apollo/client";
import { gql } from "urql";
import ChartSkeletonLoader from './ChartSkeletonLoader';

const GET_DATA = gql`
  query MyQuery($id: ID!) {
    avss(where: { id: $id }) {
      registrationsCount
      registrations(
        where: {}
        orderBy: registeredTimestamp
        orderDirection: asc
        first: 900
      ) {
        status
        registeredTimestamp
        operator {
          id
          totalShares
        }
      }
    }
  }
`;

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface OperatorData {
  __typename: string;
  status: number;
  registeredTimestamp: string;
  operator: {
    __typename: string;
    id: string;
    totalShares: string;
  };
}

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

interface TotalSharesChartProps {
  avsId: string;
}

function TotalSharesChart(
  { props }: { props: Type },
  { avsId }: TotalSharesChartProps
) {
  avsId = props.individualDelegate;
  const { loading, error, data } = useQuery(GET_DATA, {
    variables: { id: avsId },
    context: {
      subgraph: 'avs' // Specify which subgraph to use
    }
  });

  if (loading) return <ChartSkeletonLoader />;
  if (error) {
    console.error("GraphQL Error:", error);
    return <p>Error: {error.message}</p>;
  }

  console.log("Data from GraphQL:", data.avss[0].registrations);

  const formatDate = (date: Date): string => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[date.getMonth()]}'${date
      .getFullYear()
      .toString()
      .slice(-2)}`;
  };

  const processData = () => {
    const monthlyShares: { [key: string]: bigint } = {};
    let cumulativeShares = BigInt(0);

    data.avss[0].registrations.forEach(
      (item: {
        registeredTimestamp: string;
        operator: { totalShares: string | number | bigint | boolean };
      }) => {
        const date = new Date(parseInt(item.registeredTimestamp) * 1000);
        const monthYear = formatDate(date);
        const shares = BigInt(item.operator.totalShares);

        cumulativeShares += shares;
        monthlyShares[monthYear] = cumulativeShares;
      }
    );

    const sortedMonths = Object.keys(monthlyShares).sort((a, b) => {
      const dateA = new Date(Date.parse(`01 ${a}`));
      const dateB = new Date(Date.parse(`01 ${b}`));
      return dateA.getTime() - dateB.getTime();
    });
    const cumulativeTotalShares = sortedMonths.map((month) =>
      Number(monthlyShares[month] / BigInt(1e18))
    ); // Convert to Ether for readability

    return { sortedMonths, cumulativeTotalShares };
  };

  const { sortedMonths, cumulativeTotalShares } = processData();

  const newData = {
    labels: sortedMonths,
    datasets: [
      {
        label: "Cumulative Total Shares (in Ether)",
        data: cumulativeTotalShares,
        fill: false,
        borderColor: "rgb(78, 255, 78)",
        tension: 0.1,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "rgb(255, 255, 255)",
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: "Total Shares Over Time",
        color: "rgb(255, 255, 255)",
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Month",
          color: "rgb(255, 255, 255)",
          font: {
            size: 14,
          },
        },
        ticks: {
          color: "rgb(255, 255, 255)",
          font: {
            size: 12,
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        title: {
          display: true,
          color: "rgb(255, 255, 255)",
          text: " Total Shares (in Ether)",
          font: {
            size: 14,
          },
        },
        ticks: {
          color: "rgb(255, 255, 255)",
          font: {
            size: 12,
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div
      style={{
        backgroundColor: "#1d4059",
        padding: "20px",
        borderRadius: "10px",
      }}
      className="w-full h-[300px] sm:h-[400px] md:h-[500px]"
    >
      <Line data={newData} options={options} />
    </div>
  );
}

export default TotalSharesChart;