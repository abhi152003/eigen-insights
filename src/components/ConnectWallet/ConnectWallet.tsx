"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import wallet from "../../assets/images/sidebar/new_wallet.png";
import Image from "next/image";
import styles from "../../components/MainSidebar/sidebar.module.css";
import { PiWalletFill } from "react-icons/pi";
import { Badge, Tooltip } from "@nextui-org/react";

export const ConnectWallet = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");
        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Tooltip
                    content={<div className="capitalize">Wallet</div>}
                    placement="right"
                    className="rounded-md bg-opacity-90 bg-light-blue"
                    closeDelay={1}
                  >
                    <button onClick={openConnectModal} type="button">
                      <div
                        className={`p-[12px] cursor-pointer ${styles.image_hover} rounded-full border border-white `}
                      >
                        <PiWalletFill className="w-5 h-5" />
                      </div>
                    </button>
                  </Tooltip>
                );
              }
              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button">
                    Wrong network
                  </button>
                );
              }
              return (
                <div style={{ display: "flex", gap: 12 }}>
                  <Tooltip
                    content={<div className="capitalize">Wallet</div>}
                    placement="right"
                    className="rounded-md bg-opacity-90 bg-light-blue"
                    closeDelay={1}
                  >
                    <button onClick={openAccountModal} type="button">
                      <div
                        className={`p-[12px] cursor-pointer ${styles.image_hover} rounded-full border border-white `}
                      >
                        <PiWalletFill className="w-5 h-5" />
                      </div>
                    </button>
                  </Tooltip>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
