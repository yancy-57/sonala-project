import {
    getAccount as fetchToken,
    getAssociatedTokenAddress,
} from "@solana/spl-token";
import { address } from "@solana/kit";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useState } from "react";
import type { FC } from "react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";


export const TokenAccountInfo: FC = () => {
    //token account info
    //const [ataDetails, setAtaDetails] = useState<any>(null);
    //balance
    const [balance, setBalance] = useState<number|null>(null);
    const { publicKey } = useWallet();
    const { connection } = useConnection();

    const handleFetchTokenInfo = async () => {
        if (!publicKey) {
            alert("请先连接钱包");
            return;
        }

        try {
            const mintAddress = address("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
            const authority = address("7zubBqber5Hk6aHBybPM3XAmqR6N7vzfeCtaxv23jPe5");
          
            const associatedTokenAddress = await getAssociatedTokenAddress(
                new PublicKey(mintAddress),
                new PublicKey(authority),
                false,
                TOKEN_PROGRAM_ID
            );

            const ataDetails = await fetchToken(connection, associatedTokenAddress);
            
            // 🔢 计算可读的余额
            const rawBalance = ataDetails.amount; // BigInt 原始余额
            const decimals = 6; // USDC 有 6 位小数
            const readableBalance = Number(rawBalance) / Math.pow(10, decimals);
            setBalance(readableBalance)
            
            //setAtaDetails(ataDetails);
        } catch (error) {
            console.error("Failed to fetch token info:", error);
        }
    };

    return (
        <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '8px', margin: '10px 0' }}>
            <h3>Token Account Info</h3>
            <button
                onClick={handleFetchTokenInfo}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#512da8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                查询 Token Account 余额
            </button>

            {/* {ataDetails && (
                <div style={{ marginTop: '15px' }}>
                    <p><strong>ataDetails:</strong></p>
                    <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
                        {JSON.stringify(ataDetails, (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value, 2
                        )}
                    </pre>
                </div>
            )} */}
            {balance && (
                <div style={{ marginTop: '15px' }}>
                    <p><strong>balance:{balance} USDC</strong></p>
                </div>
            )}
        </div>
    );
};