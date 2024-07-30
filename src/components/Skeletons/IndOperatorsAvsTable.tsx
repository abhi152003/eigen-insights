import React from "react";

const SkeletonLoader = () => {
  return (
    <div className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="border-b border-gray-700 flex justify-between py-2"
        >
          <div className="flex items-center">
            <div className="bg-gray-700 w-10 h-10 rounded-full mr-3"></div>
            <div className="bg-gray-700 w-32 h-6 rounded"></div>
          </div>
          <div className="bg-gray-700 w-32 h-6 rounded"></div>
          <div className="bg-gray-700 w-20 h-6 rounded"></div>
          <div className="bg-gray-700 w-64 h-6 rounded"></div>
          <div className="bg-gray-700 w-20 h-6 rounded"></div>
          <div className="bg-gray-700 w-20 h-6 rounded"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
