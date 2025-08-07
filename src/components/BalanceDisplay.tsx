import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {  useEffect, useState } from "react";
import type { FC } from "react";

export const BalanceDisplay: FC = () => {
  const [balance, setBalance] = useState(0);
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    const updateBalance = async () => {
      if (!connection || !publicKey) {
        console.error("Wallet not connected or connection unavailable");
        setBalance(0);
        return;
      }

      try {
        connection.onAccountChange(
          publicKey,
          (updatedAccountInfo) => {
            setBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL);
          },
          "confirmed",
        );

        const accountInfo = await connection.getAccountInfo(publicKey);

        if (accountInfo) {
          setBalance(accountInfo.lamports / LAMPORTS_PER_SOL);
        } else {
          console.warn("Account info not found, setting balance to 0");
          setBalance(0);
        }
      } catch (error) {
        console.error("Failed to retrieve account info:", error);
        setBalance(0);
      }
    };

    updateBalance();
  }, [connection, publicKey]);

  return (
    <div>
        {/* System Account（系统账户） */}
      <p>{publicKey ? `Balance: ${balance} SOL` : ""}</p>
    </div>
  );
};