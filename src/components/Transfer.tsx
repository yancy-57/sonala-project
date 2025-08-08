
import type { FC } from "react";
import { useState } from "react";
import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createTransferInstruction,
    getAccount as fetchToken,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import {
    Transaction,
    PublicKey,
} from "@solana/web3.js";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

export const Transfer: FC = () => {
    // 收款账号地址
    const [recipientAddress, setRecipientAddress] = useState<string>('');
    // 转账金额
    const [transferAmount, setTransferAmount] = useState<string>('');
    // 转账状态
    const [loading, setLoading] = useState(false);
    // 错误信息
    const [error, setError] = useState<string | null>(null);
    // 成功信息
    const [success, setSuccess] = useState<string | null>(null);
    
    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();
    
    // USDC Mint 地址（Devnet）
    const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

    const handleTransfer = async () => {
        if (!publicKey) {
            setError("请先连接钱包");
            return;
        }

        if (!recipientAddress.trim()) {
            setError("请输入收款地址");
            return;
        }

        if (!transferAmount.trim() || isNaN(Number(transferAmount)) || Number(transferAmount) <= 0) {
            setError("请输入有效的转账金额");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const fromOwner = publicKey; // 发送方（当前连接的钱包）
            let toOwner: PublicKey;

            // 验证收款地址格式
            try {
                toOwner = new PublicKey(recipientAddress.trim());
            } catch (error) {
                setError("收款地址格式无效");
                return;
            }

            // 计算发送方和接收方的ATA地址
            const fromATA = await getAssociatedTokenAddress(
                USDC_MINT,
                fromOwner,
                false,
                TOKEN_PROGRAM_ID
            );

            const toATA = await getAssociatedTokenAddress(
                USDC_MINT,
                toOwner,
                false,
                TOKEN_PROGRAM_ID
            );

            // 检查发送方ATA是否存在
            const fromAccountInfo = await connection.getAccountInfo(fromATA);
            if (!fromAccountInfo) {
                setError("发送方没有USDC账户，请先创建Token Account");
                return;
            }

            // 检查发送方余额是否足够
            const fromTokenAccount = await fetchToken(connection, fromATA);
            const currentBalance = Number(fromTokenAccount.amount) / Math.pow(10, 6); // USDC有6位小数
            if (currentBalance < Number(transferAmount)) {
                setError(`余额不足！当前余额: ${currentBalance} USDC，转账金额: ${transferAmount} USDC`);
                return;
            }

            // 检查接收方ATA是否存在，如果不存在则创建
            const toAccountInfo = await connection.getAccountInfo(toATA);
            
            // 获取最新的区块哈希用于交易确认
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
            
            const transaction = new Transaction({
                feePayer: fromOwner,
                blockhash: blockhash,
                lastValidBlockHeight: lastValidBlockHeight,
            });

            if (!toAccountInfo) {
                console.log("接收方ATA不存在，将自动创建");
                const createATAInstruction = createAssociatedTokenAccountInstruction(
                    fromOwner,  // payer（由发送方支付创建费用）
                    toATA,      // ata
                    toOwner,    // owner
                    USDC_MINT,  // mint
                    TOKEN_PROGRAM_ID
                );
                transaction.add(createATAInstruction);
            }

            // 创建转账指令
            const transferInstruction = createTransferInstruction(
                fromATA,                    // source（发送方ATA）
                toATA,                      // destination（接收方ATA）
                fromOwner,                  // owner（发送方，需要签名）
                BigInt(Number(transferAmount) * Math.pow(10, 6)), // amount（转换为最小单位）
                [],                         // multiSigners
                TOKEN_PROGRAM_ID           // programId
            );

            transaction.add(transferInstruction);

            // 发送交易
            const signature = await sendTransaction(transaction, connection);
            console.log("转账交易签名:", signature);

            // 等待确认 - 使用新的确认策略
            const confirmation = await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            }, 'confirmed');
            
            // 检查交易是否成功
            if (confirmation.value.err) {
                throw new Error(`交易失败: ${JSON.stringify(confirmation.value.err)}`);
            }

            setSuccess(`USDC转账成功！\n金额: ${transferAmount} USDC\n收款地址: ${recipientAddress}\n交易签名: ${signature}`);
            
            // 清空输入框
            setRecipientAddress('');
            setTransferAmount('');

        } catch (error: any) {
            console.error("转账失败:", error);
            setError(`转账失败: ${error.message || '未知错误'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            padding: '20px', 
            border: '1px solid #ddd', 
            borderRadius: '12px', 
            margin: '10px 0',
            backgroundColor: '#f8f9fa'
        }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333', textAlign: 'center' }}>
                💸 USDC 转账
            </h3>
            
            {/* 收款地址输入 */}
            <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 'bold', 
                    color: '#495057' 
                }}>
                    收款地址:
                </label>
                <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="输入收款方的Solana钱包地址"
                    style={{
                        width: '100%',
                        padding: '12px 15px',
                        border: '2px solid #ced4da',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.3s',
                        outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
                    onBlur={(e) => e.target.style.borderColor = '#ced4da'}
                />
            </div>

            {/* 转账金额输入 */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 'bold', 
                    color: '#495057' 
                }}>
                    转账金额 (USDC):
                </label>
                <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="输入转账金额"
                    min="0"
                    step="0.000001"
                    style={{
                        width: '100%',
                        padding: '12px 15px',
                        border: '2px solid #ced4da',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.3s',
                        outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
                    onBlur={(e) => e.target.style.borderColor = '#ced4da'}
                />
            </div>

            {/* 转账按钮 */}
            <button
                onClick={handleTransfer}
                disabled={loading || !publicKey || !recipientAddress.trim() || !transferAmount.trim()}
                style={{
                    width: '100%',
                    padding: '15px 20px',
                    backgroundColor: (loading || !publicKey || !recipientAddress.trim() || !transferAmount.trim()) 
                        ? '#6c757d' : '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (loading || !publicKey || !recipientAddress.trim() || !transferAmount.trim()) 
                        ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    transition: 'background-color 0.3s',
                    marginBottom: '15px'
                }}
                onMouseEnter={(e) => {
                    if (!loading && publicKey && recipientAddress.trim() && transferAmount.trim()) {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#c82333';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!loading && publicKey && recipientAddress.trim() && transferAmount.trim()) {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#dc3545';
                    }
                }}
            >
                {loading ? '转账中...' : '🚀 发送 USDC'}
            </button>

            {/* 错误信息显示 */}
            {error && (
                <div style={{ 
                    padding: '12px 15px', 
                    backgroundColor: '#f8d7da', 
                    color: '#721c24', 
                    borderRadius: '8px',
                    border: '1px solid #f5c6cb',
                    marginBottom: '15px'
                }}>
                    <strong>❌ 错误: </strong>{error}
                </div>
            )}

            {/* 成功信息显示 */}
            {success && (
                <div style={{ 
                    padding: '12px 15px', 
                    backgroundColor: '#d4edda', 
                    color: '#155724', 
                    borderRadius: '8px',
                    border: '1px solid #c3e6cb',
                    marginBottom: '15px',
                    whiteSpace: 'pre-line'
                }}>
                    <strong>✅ </strong>{success}
                </div>
            )}
        </div>
    );
};