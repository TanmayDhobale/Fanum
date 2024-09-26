import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Transaction, PublicKey } from '@solana/web3.js';
import { connectToPhantom, sendTransaction } from '../utils/phantom';
import { createWithdrawInstruction } from '../utils/contract';
import * as Notifications from 'expo-notifications';

export default function WithdrawScreen() {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleWithdraw = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const walletPubkey = await connectToPhantom();
      if (typeof walletPubkey === 'string') {
        const pubkey = new PublicKey(walletPubkey);
        const instruction = await createWithdrawInstruction(pubkey);
        const transaction = new Transaction().add(instruction);
        const serializedTransaction = transaction.serialize().toString('base64');
        const signature = await sendTransaction(serializedTransaction);
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Withdrawal Successful",
            body: `You have successfully withdrawn your tokens.`,
          },
          trigger: null,
        });

        Alert.alert('Success', `Withdrawal successful! Signature: ${signature}`);
        navigation.goBack();
      } else {
        throw new Error("Failed to connect to Phantom");
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Withdraw Tokens</Text>
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleWithdraw}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Processing...' : 'Withdraw'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E1E',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  buttonDisabled: {
    backgroundColor: '#888888',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});