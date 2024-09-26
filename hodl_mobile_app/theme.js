import { DefaultTheme } from '@react-navigation/native';

export const Colors = {
  primary: '#4CAF50',
  secondary: '#2196F3',
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#333333',
  border: '#E0E0E0',
  notification: '#FF5722',
};

export const Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...Colors,
  },
};

export const Spacing = {
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

export const FontSizes = {
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 24,
};