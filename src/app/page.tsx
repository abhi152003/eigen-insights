"use client";
import ExploreDAOs from "@/components/DAOs/ExploreDAOs";
import { ApolloProvider } from "@apollo/client";
import client from "@/components/utils/avsExplorerClient";

export default function Home() {
  return (
    <main>
      <ApolloProvider client={client}>
        <ExploreDAOs />
      </ApolloProvider>
    </main>
  );
}
