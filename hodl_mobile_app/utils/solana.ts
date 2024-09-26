import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOLANA_NETWORK = 'https://api.mainnet-beta.solana.com';

export const getBalance = async (): Promise<number> => {
  try {
    const connection = new Connection(SOLANA_NETWORK);
    const publicKeyString = await AsyncStorage.getItem('walletPublicKey');
    
    if (!publicKeyString) {
      throw new Error('No wallet public key found');
    }

    const publicKey = new PublicKey(publicKeyString);
    const balance = await connection.getBalance(publicKey);
    
    return Number((balance / LAMPORTS_PER_SOL).toFixed(4));
  } catch (error) {
    console.error('Error fetching Solana balance:', error);
    throw error;
  }
};
