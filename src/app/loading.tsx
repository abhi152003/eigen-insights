"use client";
import React from "react";
import { Bars, MutatingDots } from "react-loader-spinner";

function loading() {
  return (
    <div className="flex h-screen justify-center items-center">
      <MutatingDots
        visible={true}
        height="100"
        width="100"
        color="#FFFFFF"
        secondaryColor="#FFFFFF"
        radius="12.5"
        ariaLabel="mutating-dots-loading"
        wrapperStyle={{}}
        wrapperClass=""
        />
    </div>
  );
}

export default loading;
