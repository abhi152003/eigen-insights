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
import { ThreeCircles } from "react-loader-spinner";

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

interface TotalOperatorsChartProps {
  avsId: string;
}

function TotalOperatorsChart(
  { props }: { props: Type },
  { avsId }: TotalOperatorsChartProps
) {
  avsId = props.individualDelegate;
  const { loading, error, data } = useQuery(GET_DATA, {
    variables: { id: avsId },
    context: {
      subgraph: 'avs' // Specify which subgraph to use
    }
  });

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
    const monthCounts: { [key: string]: number } = {};
    let cumulativeCount = 0;

    data.avss[0].registrations.forEach(
      (item: { registeredTimestamp: string }) => {
        const date = new Date(parseInt(item.registeredTimestamp) * 1000);
        const monthYear = formatDate(date);

        cumulativeCount++;
        monthCounts[monthYear] = cumulativeCount;
      }
    );

    const sortedMonths = Object.keys(monthCounts).sort((a, b) => {
      const dateA = new Date(Date.parse(`01 ${a}`));
      const dateB = new Date(Date.parse(`01 ${b}`));
      return dateA.getTime() - dateB.getTime();
    });
    const cumulativeRegistrationCounts = sortedMonths.map((month) => monthCounts[month]);

    return { sortedMonths, cumulativeRegistrationCounts };
  };

  const { sortedMonths, cumulativeRegistrationCounts } = processData();

  const newData = {
    labels: sortedMonths,
    datasets: [
      {
        label: "Cumulative Number of Operators Registered",
        data: cumulativeRegistrationCounts,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
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
          color: "rgb(255, 255, 255)", // White color for legend text
          font: {
            size: 14, // Adjust legend font size
          },
        },
      },
      title: {
        display: true,
        text: "Operator Registrations Over Time",
        color: "rgb(255, 255, 255)", // White color for title
        font: {
          size: 18, // Adjust title font size
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Month",
          color: "rgb(255, 255, 255)", // White color for x-axis title
          font: {
            size: 14, // Adjust x-axis title font size
          },
        },
        ticks: {
          color: "rgb(255, 255, 255)", // White color for x-axis labels
          font: {
            size: 12, // Adjust x-axis tick font size
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)", // Slightly visible white grid lines
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Operators",
          color: "rgb(255, 255, 255)", // White color for y-axis title
          font: {
            size: 14, // Adjust y-axis title font size
          },
        },
        ticks: {
          color: "rgb(255, 255, 255)", // White color for y-axis labels
          font: {
            size: 12, // Adjust y-axis tick font size
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)", // Slightly visible white grid lines
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

export default TotalOperatorsChart;