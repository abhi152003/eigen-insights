import operators_logo from "@/assets/images/daos/Operator1.jpg";
import avss_logo from "@/assets/images/daos/AVSs1.jpg";

export const dao_details: any = {
  operators: {
    title: "Operators",
    dao_name: "operators",
    chain_name: "Operators",
    description:
      "Operators are entities that help run AVS software built on EigenLayer. They register in EigenLayer and allow stakers to delegate to them, then opt in to provide various services (AVSs) built on top of EigenLayer.",
    contract_address: "",
    token_name: "NO",
    logo: operators_logo,
  },
  avss: {
    title: "AVSs",
    dao_name: "AVSs",
    chain_name: "AVSs",
    description:
      "Actively Validated Services (AVSs) are services built on the EigenLayer protocol that leverage Ethereum's shared security.Operators perform validation tasks for AVSs, contributing to the security and integrity of the network.AVSs deliver services to users (AVS Consumers) and the broader Web3 ecosystem.",
    contract_address: "",
    token_name: "AVS",
    logo: avss_logo,
  },
};
