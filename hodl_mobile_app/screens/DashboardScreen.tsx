import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '../theme';
import { connectToPhantom } from '../utils/phantom';
import { useNavigation } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, AnimateStyle, AnimatedTransform } from 'react-native-reanimated';
import { getBalance } from '../utils/solana';

export default function DashboardScreen() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [balance, setBalance] = useState(0);
  const navigation = useNavigation();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (walletConnected) {
      fetchBalance();
    }
  }, [walletConnected]);

  const handleConnectWallet = async () => {
    try {
      await connectToPhantom();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBalance = async () => {
    try {
      const solBalance = await getBalance();
      setBalance(solBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(0);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });


  const handlePress = (action) => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
      if (action === 'deposit') {
        navigation.navigate('Deposit' as never);
      } else if (action === 'withdraw') {
        navigation.navigate('Withdraw' as never);
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.header}
      >
        <Text style={styles.title}>HODL Dashboard</Text>
        {!walletConnected ? (
          <TouchableOpacity style={styles.connectButton} onPress={handleConnectWallet}>
            <Text style={styles.connectButtonText}>Connect Wallet</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceTitle}>Your Balance</Text>
            <Text style={styles.balanceAmount}>{balance} SOL</Text>
          </View>
        )}
      </LinearGradient>
      <View style={styles.actionsContainer}>
        <Animated.View style={[styles.actionButton, animatedStyle]}>
          <TouchableOpacity onPress={() => handlePress('deposit')}>
            <Ionicons name="add-circle" size={40} color={Colors.primary} />
            <Text style={styles.actionText}>Deposit</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.actionButton, animatedStyle]}>
          <TouchableOpacity onPress={() => handlePress('withdraw')}>
            <Ionicons name="remove-circle" size={40} color={Colors.secondary} />
            <Text style={styles.actionText}>Withdraw</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.l,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: FontSizes.xlarge,
    fontWeight: 'bold',
    color: Colors.card,
    marginBottom: Spacing.m,
  },
  connectButton: {
    backgroundColor: Colors.card,
    padding: Spacing.m,
    borderRadius: 10,
    alignItems: 'center',
  },
  connectButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  balanceContainer: {
    alignItems: 'center',
  },
  balanceTitle: {
    fontSize: FontSizes.medium,
    color: Colors.card,
    marginBottom: Spacing.s,
  },
  balanceAmount: {
    fontSize: FontSizes.xlarge,
    fontWeight: 'bold',
    color: Colors.card,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.xl,
  },
  actionButton: {
    backgroundColor: Colors.card,
    padding: Spacing.l,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginTop: Spacing.s,
    color: Colors.text,
    fontWeight: 'bold',
  },
});