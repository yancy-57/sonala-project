
import type { FC } from "react";
import { Token } from "@solana/spl-token";
import {
    Connection,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction,
    PublicKey,
} from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";


export const Transfer: FC = () => {
    // 1. 定义 USDC Mint 地址（Devnet）
    const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
    // 2. 初始化 Token 对象
    const token = new Token(connection, USDC_MINT, TOKEN_PROGRAM_ID, senderKeypair);
    // 3. 获取或创建发送方和接收方的 USDC Token Account（ATA）
    const senderTokenAccount = await token.getOrCreateAssociatedTokenAccount(senderKeypair.publicKey);
    const recipientTokenAccount = await token.getOrCreateAssociatedTokenAccount(toPubkey);
    // 4. 转账 1 USDC（注意：USDC 有 6 位小数）
    const amount = 1 * 10 ** 6; // 1 USDC = 1_000_000 lamports
    const handleTransfer = () => {
        //console.log("transfer");
        const transaction = new Transaction().add(
            Token.createTransferInstruction(
                TOKEN_PROGRAM_ID,
                senderTokenAccount.address, // 发送方 USDC ATA
                recipientTokenAccount.address, // 接收方 USDC ATA
                senderKeypair.publicKey, // 发送方钱包（需签名）
                [],
                amount
            )
        );
        const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);
    };

    return (
        <div >
            <button
                onClick={handleTransfer}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#512da8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                交易 USDC
            </button>
        </div>
    );
};