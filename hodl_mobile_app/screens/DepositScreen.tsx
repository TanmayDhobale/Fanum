import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Transaction, PublicKey } from '@solana/web3.js';
import { connectToPhantom, sendTransaction } from '../utils/phantom';
import { createDepositInstruction } from '../utils/contract';
import * as Notifications from 'expo-notifications';

export default function DepositScreen() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  const handleDeposit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (!connected) {
        await connectToPhantom();
        return;
      }

      if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        Alert.alert('Error', 'Please enter a valid amount greater than 0');
        setLoading(false);
        return;
      }

      const instruction = await createDepositInstruction(publicKey, parseFloat(amount));
      const transaction = new Transaction().add(instruction);
      const serializedTransaction = transaction.serialize().toString('base64');
      const signature = await sendTransaction(serializedTransaction);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Deposit Successful",
          body: `You have successfully deposited ${amount} tokens.`,
        },
        trigger: null,
      });

      Alert.alert('Success', `Deposit successful! Signature: ${signature}`);
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deposit Tokens</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      {loading && <ActivityIndicator size="large" color="#4CAF50" />}
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleDeposit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Processing...' : 'Deposit'}</Text>
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
  input: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
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

function handleDeepLink(event: { url: string; }): void {
    throw new Error('Function not implemented.');
}
