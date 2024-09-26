import * as Linking from 'expo-linking';

const PHANTOM_DEEPLINK_PREFIX = 'phantom://';
const APP_DEEPLINK_PREFIX = 'hodlapp://'; 

export const connectToPhantom = async (): Promise<void> => {
  try {
    const url = `${PHANTOM_DEEPLINK_PREFIX}ul/v1/connect?app_url=${encodeURIComponent(APP_DEEPLINK_PREFIX + 'phantom-connect')}`;
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      const result = await Linking.openURL(url);
      console.log("Phantom URL opened:", result);
    } else {
      console.error("Phantom wallet URL not supported");
      throw new Error("Phantom wallet not installed or not accessible");
    }
  } catch (err) {
    console.error("Error connecting to Phantom wallet:", err);
    throw err;
  }
};

export const sendTransaction = async (transaction: string): Promise<void> => {
  try {
    const url = `${PHANTOM_DEEPLINK_PREFIX}ul/v1/signAndSendTransaction?app_url=${encodeURIComponent(APP_DEEPLINK_PREFIX + 'phantom-transaction')}&tx=${encodeURIComponent(transaction)}`;
    
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      const result = await Linking.openURL(url);
      console.log("Transaction URL opened:", result);
    } else {
      console.error("Phantom wallet URL not supported for transaction");
      throw new Error("Phantom wallet not installed or not accessible");
    }
  } catch (err) {
    console.error("Error sending transaction:", err);
    throw err;
  }
};