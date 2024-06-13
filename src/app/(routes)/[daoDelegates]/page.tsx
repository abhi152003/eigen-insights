import IndividualDAO from "@/components/IndividualDAO/SpecificDAO";
import PageNotFound from "@/components/PageNotFound/PageNotFound";
import React from "react";
import type { Metadata, ResolvingMetadata } from "next";

const metadataConfig: any = {
  operators: {
    title: "Operators",
    description:
      "Operators are entities that help run AVS software built on EigenLayer. They register in EigenLayer and allow stakers to delegate to them, then opt in to provide various services (AVSs) built on top of EigenLayer.",
    image:"",
  },
  avss: {
    title: "AVSs",
    description:
      "Actively Validated Services (AVSs) are services built on the EigenLayer protocol that leverage Ethereum's shared security.Operators perform validation tasks for AVSs, contributing to the security and integrity of the network.AVSs deliver services to users (AVS Consumers) and the broader Web3 ecosystem.",
    image:"",
  },
};

export async function generateMetadata(
  { params }: { params: { daoDelegates: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { daoDelegates } = params;
  const delegateMetadata = metadataConfig[daoDelegates];

  return {
    metadataBase: new URL("https://app.chora.club/"),
    title: "Eigen Insights",
    description: "Discover. Learn. Engage.",
  };
}

function page({ params }: { params: { daoDelegates: string } }) {
  return (
    <div>
      {params.daoDelegates === "operators" ||
      params.daoDelegates === "avss" ? (
        <IndividualDAO props={params} />
      ) : (
        <PageNotFound />
      )}
    </div>
  );
}

export default page;
