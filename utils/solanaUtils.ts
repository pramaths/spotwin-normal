import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export const fetchSolanaBalance = async (address: string): Promise<number> => {
  try {
    const connection = new Connection('https://api.testnet.v1.sonic.game', 'confirmed');
    
    const publicKey = new PublicKey(address);
    
    const balanceInLamports = await connection.getBalance(publicKey);
    
    const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;
    
    return balanceInSol;
  } catch (error) {
    console.error('Error fetching Solana balance:', error);
    return 0;
  }
};


export const formatSolBalance = (balance: number): string => {
  if (balance < 0.01) {
    return '< 0.01';
  }
  return `${balance.toFixed(2)} SOL`;
};