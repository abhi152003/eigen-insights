import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const PieChartSkeleton: React.FC = () => (
  <div className="w-full md:w-1/2 flex items-center justify-center">
    <div style={{ width: "300px", height: "300px" }}>
      <Skeleton circle={true} height={300} width={300} />
    </div>
  </div>
);

export const DataListSkeleton: React.FC = () => (
  <div className="w-full md:w-1/2 pr-10">
    <div className="space-y-2">
      {[...Array(12)].map((_, index) => (
        <div key={index} className="flex justify-between items-center">
          <div className="flex items-center gap-2">
          <Skeleton circle={true} height={20} width={20} />
          <Skeleton width={100} />
          </div>
          <div className="flex justify-end items-center gap-5">
            <Skeleton width={60} />
            <Skeleton width={60} />
          </div>
        </div>
      ))}
    </div>
  </div>
);