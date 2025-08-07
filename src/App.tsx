import { useMemo } from "react";
import type { FC } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  clusterApiUrl, Transaction,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import './App.css'

const App: FC = () => {
  const endpoint = clusterApiUrl("devnet");
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          <div>
            <h1>Solana Project</h1>
            {/* <p>Solana wallet connection is ready!</p> */}
            <WalletMultiButton />
            <p>Put the rest of your app here</p>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
