import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";

const USDC_POOL_MINT = new PublicKey(process.env.EXPO_PUBLIC_USDC_POOL_MINT!); 
const SPOT_POOL_MINT = new PublicKey(process.env.EXPO_PUBLIC_SPOT_POOL_MINT!); 
const RPC_ENDPOINT = process.env.EXPO_PUBLIC_SOLANA_RPC_URL!;

const connection = new Connection(RPC_ENDPOINT);

export async function fetchUserBalance(userPubkey: string): Promise< number> {
  let usdc_ata = await getAssociatedTokenAddress(SPOT_POOL_MINT, new PublicKey(userPubkey));
 
  try {
    const usdc_accountInfo = await getAccount(connection, usdc_ata);
    return Number(usdc_accountInfo.amount);
  } catch (err: any) {
    if (err.message.includes("Failed to find account")) {
      return 0;
    }
    throw err;
  }
}