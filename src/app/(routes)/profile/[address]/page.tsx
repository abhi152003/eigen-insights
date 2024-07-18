"use client"
import MainProfile from "@/components/UserProfile/MainProfile";
import client from "@/components/utils/avsExplorerClient";
import { ApolloProvider } from "@apollo/client";
import React from "react";

function page() {
  return (
    <div>
      <ApolloProvider client={client}>
        <MainProfile />
      </ApolloProvider>
    </div>
  );
}

export default page;
