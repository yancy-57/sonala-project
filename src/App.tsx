import { useMemo } from "react";
import type { FC } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import './App.css'
import { BalanceDisplay } from "./components/BalanceDisplay";
import { TokenAccountInfo } from "./components/TokenAccountInfo";

const App: FC = () => {
  const endpoint = clusterApiUrl("devnet");
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Solana Project</h1>
            <div style={{ marginBottom: '20px' }}>
              <WalletMultiButton />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <BalanceDisplay />
              <TokenAccountInfo />
            </div>

          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
