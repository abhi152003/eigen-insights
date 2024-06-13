import { createWalletClient, createPublicClient, custom } from "viem";
import { mainnet } from "viem/chains";
import { useNetwork } from "wagmi";
import { defineChain } from "viem";

declare global {
  interface Window {
    ethereum?: any;
    // Add other properties if needed
  }
}

const WalletAndPublicClient = () => {
  let publicClient: any;
  let walletClient: any;

  const { chain } = useNetwork();
  let chainName: any;
  console.log("the chain", chain?.name);
  if (chain?.name === "Ethereum") {
    chainName = mainnet;
  } else if (chain?.name === "Ethereum") {
    chainName = mainnet;
  } else {
    chainName = "";
  }

  if (typeof window !== "undefined" && window.ethereum) {
    // Instantiate public client and wallet client
    publicClient = createPublicClient({
      chain: chainName,
      transport: custom(window.ethereum),
    });

    walletClient = createWalletClient({
      chain: chainName,
      transport: custom(window.ethereum),
    });

    // Now you can use publicClient and walletClient as needed
  } else {
    console.error("window.ethereum is not available");
  }

  return { publicClient, walletClient };
};

export default WalletAndPublicClient;
