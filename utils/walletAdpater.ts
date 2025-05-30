// import {
//     Connection,
//     PublicKey,
//     Keypair,
//     Transaction,
//     VersionedTransaction,
//     SendTransactionError,
//   } from "@solana/web3.js";
//   import { Wallet } from "@coral-xyz/anchor";
  
//   export const adaptPrivyWalletToAnchor = (privyWallet: any): Wallet => {
//     console.log("Privy wallet details:", {
//       wallet: privyWallet,
//       hasAddress: !!privyWallet?.address,
//       hasSignTransaction: !!privyWallet?.signTransaction,
//       signTransactionType: typeof privyWallet?.signTransaction,
//       methods: Object.keys(privyWallet || {}),
//     });
  
//     if (!privyWallet?.address) {
//       throw new Error("Privy wallet missing address");
//     }
  
//     const dummyPayer = Keypair.generate();
//     const getConnection = () =>
//       new Connection(
//         process.env.EXPO_PUBLIC_SOLANA_RPC_URL ||
//           "https://rpc.mainnet-alpha.sonic.game",
//         {
//           commitment: "confirmed",
//           disableRetryOnRateLimit: false,
//           confirmTransactionInitialTimeout: 120000,
//         }
//       );
  
//     const signWithProvider = async (
//       tx: Transaction | VersionedTransaction
//     ) => {
//       const provider = await privyWallet.getProvider();
//       const connection = getConnection();
//       const { blockhash } = await connection.getLatestBlockhash("finalized");
  
//       if (tx instanceof Transaction) {
//         tx.recentBlockhash = blockhash;
//         tx.feePayer = new PublicKey(privyWallet.address);
//       }
    
//       await provider.request({
//         method: "signTransaction",
//         params: {
//           transaction: tx,
//           connection,
//           options: { skipPreflight: true, maxRetries: 1 },
//         },
//       });
  
//       return tx;
//     };
  
//     return {
//       publicKey: new PublicKey(privyWallet.address),
//       payer: dummyPayer,
  
//       signTransaction: async <T extends Transaction | VersionedTransaction>(
//         tx: T
//       ): Promise<T> => {
//         console.log("Signing transaction with provider...");
//         return signWithProvider(tx) as Promise<T>;
//       },
  
//       signAllTransactions: async <T extends Transaction | VersionedTransaction>(
//         txs: T[]
//       ): Promise<T[]> => {
//         console.log("Signing multiple transactions with provider...");
//         return Promise.all(txs.map((tx) => signWithProvider(tx) as Promise<T>));
//       },
//     };
//   };
  

import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";

/**
 * Set `signable = false` whenever you only need to generate instructions.
 * When `signable = true` the object fully satisfies Anchor’s Wallet interface
 * and will sign the transaction via Privy’s provider.
 */
export const adaptPrivyWalletToAnchor = (
  privyWallet: any,
  signable = true
): Wallet => {
  if (!privyWallet?.address) throw new Error("Privy wallet missing address");

  const connection = new Connection(
    process.env.EXPO_PUBLIC_SOLANA_RPC_URL ??
      "https://api.devnet.solana.com",
    { commitment: "confirmed" }
  );

  const providerPromise = async () => await privyWallet.getProvider();

  const signWithProvider = async <T extends Transaction | VersionedTransaction>(
    tx: T
  ): Promise<T> => {
    const { blockhash } = await connection.getLatestBlockhash("finalized");
    if (tx instanceof Transaction) {
      tx.recentBlockhash = blockhash;
      tx.feePayer = new PublicKey(privyWallet.address);
    }
    const provider = await providerPromise();
    await provider.request({
      method: "signTransaction",
      params: { transaction: tx }, // Privy accepts the raw tx object
    });
    return tx;
  };

  // When signable = false Anchor will never call these methods, but it still
  // wants them present on the object.
  const passThrough = async <T>(x: T): Promise<T> => x;

  return {
    publicKey: new PublicKey(privyWallet.address),
    payer: Keypair.generate(), // never used – but Anchor requires it
    signTransaction: signable ? signWithProvider : passThrough,
    signAllTransactions: signable
      ? async (txs) => Promise.all(txs.map(signWithProvider))
      : async (txs) => txs,
  };
};
