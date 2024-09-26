import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, AnimateStyle, AnimatedTransform } from 'react-native-reanimated';

export default function HomeScreen() {
  const navigation = useNavigation();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = (screen) => {
    scale.value = withSpring(0.9, {}, () => {
      scale.value = withSpring(1);
      navigation.navigate(screen as never);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HODL Project</Text>
      <Animated.View style={[styles.buttonContainer, animatedStyle]}>
        <TouchableOpacity style={styles.button} onPress={() => handlePress('Deposit')}>
          <Text style={styles.buttonText}>Deposit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handlePress('Withdraw')}>
          <Text style={styles.buttonText}>Withdraw</Text>
        </TouchableOpacity>
      </Animated.View>
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
  buttonContainer: {
    width: '80%',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});