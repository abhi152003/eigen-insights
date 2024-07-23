import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function ChartSkeletonLoader() {
  return (
    <div
      style={{
        backgroundColor: "#1d4059",
        padding: "20px",
        borderRadius: "10px",
      }}
      className="w-full h-[300px] sm:h-[400px] md:h-[500px] flex flex-col"
    >
      {/* Title */}
      <div className="text-center mb-4">
        <Skeleton height={24} width="60%" />
      </div>

      {/* Legend */}
      <div className="flex justify-center mb-4">
        <Skeleton height={20} width={250} />
      </div>

      {/* Chart area */}
      <div className="flex-grow relative">
        {/* Y-axis label */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -rotate-90">
          <Skeleton height={16} width={120} />
        </div>

        {/* Chart grid and line */}
        <div className="w-full h-full flex flex-col justify-between">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="w-full flex items-center">
              <Skeleton height={12} width={30} className="ml-2" />
              <Skeleton height={1} width="100%" />
            </div>
          ))}
          <Skeleton height={2} width="100%" className="mt-[-64px]" style={{ marginBottom: '-2px' }} />
        </div>


        {/* X-axis title */}
        <div className="text-center mt-[-10px]">
          <Skeleton height={16} width={60} />
        </div>
      </div>
    </div>
  );
}

export default ChartSkeletonLoader;