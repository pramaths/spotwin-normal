import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";

const USDC_POOL_MINT = new PublicKey(process.env.EXPO_PUBLIC_USDC_POOL_MINT!); 
const SPOT_POOL_MINT = new PublicKey(process.env.EXPO_PUBLIC_SPOT_POOL_MINT!); 
const RPC_ENDPOINT = process.env.EXPO_PUBLIC_SOLANA_RPC_URL!;


const connection = new Connection(RPC_ENDPOINT, {
    commitment: "confirmed",
    disableRetryOnRateLimit: false,
    confirmTransactionInitialTimeout: 120000,
  });


export async function fetchUserBalance(userPubkey: string): Promise<{ spotBalance: number; usdcBalance: number; }> {
let usdc_ata = await getAssociatedTokenAddress(SPOT_POOL_MINT, new PublicKey(userPubkey));
let spot_ata = await getAssociatedTokenAddress(USDC_POOL_MINT, new PublicKey(userPubkey));
try {
    const spot_accountInfo = await getAccount(connection, spot_ata);
    const usdc_accountInfo = await getAccount(connection, usdc_ata);
    return {
        spotBalance: Number(spot_accountInfo.amount) / 10 ** 6,
        usdcBalance: Number(usdc_accountInfo.amount) / 10 ** 6
    };
} catch (err: any) {
    if (err.message.includes("Failed to find account")) {
    return { spotBalance: 0, usdcBalance: 0 };
    }
    throw err;
}
}