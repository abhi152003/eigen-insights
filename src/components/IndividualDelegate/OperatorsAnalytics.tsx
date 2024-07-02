import React, { useMemo, useState } from "react";
import { ThreeCircles } from "react-loader-spinner";
import { Grid, CheckCircle, Clock, X } from "lucide-react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  Check,
  AlertTriangle,
  Wrench,
} from "lucide-react";

import { gql, useQuery } from '@apollo/client';

const GET_DATA = gql`
  query MyQuery {
  avss(where: {id: "0x870679e138bcdf293b7ff14dd44b70fc97e12fc0"}) {
    registrationsCount
    registrations(where: {}, orderBy: registeredTimestamp, orderDirection: asc, first: 292) {
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

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import TotalSharesChart from "./TotalSharesChart";
import TotalOperatorsChart from "./TotalOperatorsChart";

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

function OperatorsAnalytics({ props }: { props: Type }) {
  return (
    <div className="flex justify-center w-full">
      <div style={{ width: '80%', height: '400px' }}>
        {/* <Line options={chartOptions} data={chartDataConfig} /> */}
        {/* <Line data={newData} options={options} /> */}
        <div className="mt-5 pe-16">
          <TotalOperatorsChart props={props} />
        </div>
        <div className="mt-20 pb-20 pe-16">
          <TotalSharesChart props={props}/>
        </div>
      </div>
    </div>
  );
}

export default OperatorsAnalytics;
