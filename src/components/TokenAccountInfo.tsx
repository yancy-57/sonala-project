import {
    fetchToken,
    findAssociatedTokenPda,
    TOKEN_2022_PROGRAM_ADDRESS
} from "@solana-program/token-2022";
import { address, createSolanaRpc } from "@solana/kit";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import type { FC } from "react";

export const TokenAccountInfo: FC = () => {
    const [ataDetails, setAtaDetails] = useState<any>(null);
    const { publicKey } = useWallet();

    const handleFetchTokenInfo = async () => {
        if (!publicKey) {
            alert("请先连接钱包");
            return;
        }

        try {
            // 你的原始代码逻辑
            const rpc = createSolanaRpc("https://api.devnet.solana.com");

            const mintAddress = address("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
            const authority = address("7zubBqber5Hk6aHBybPM3XAmqR6N7vzfeCtaxv23jPe5");
            //const authority = address(publicKey.toString());

            const [associatedTokenAddress] = await findAssociatedTokenPda({
                mint: mintAddress,
                owner: authority,
                tokenProgram: TOKEN_2022_PROGRAM_ADDRESS
            });

            const ataDetails = await fetchToken(rpc, associatedTokenAddress);
            setAtaDetails(ataDetails);
        } catch (error) {
            console.error("Failed to fetch token info:", error);
            alert("查询失败，可能 Token 账户不存在");
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
                查询 Token 信息
            </button>

            {ataDetails && (
                <div style={{ marginTop: '15px' }}>
                    <p><strong>ataDetails:</strong></p>
                    <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
                        {JSON.stringify(ataDetails, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};