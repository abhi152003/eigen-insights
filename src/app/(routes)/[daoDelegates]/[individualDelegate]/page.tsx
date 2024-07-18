"use client";
import SpecificDelegate from "@/components/IndividualDelegate/SpecificDelegate";
import { ApolloProvider } from "@apollo/client";
import { Metadata } from "next";
import React from "react";
import client from "@/components/utils/avsExplorerClient";

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

function page({ params }: { params: Type }) {
  return (
    <div>
      <ApolloProvider client={client}>
        <SpecificDelegate props={params} />
      </ApolloProvider>
    </div>
  );
}

export default page;
