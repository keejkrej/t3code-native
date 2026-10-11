import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface T3WordmarkProps {
  size?: number;
  color?: string;
  style?: any;
}

export const T3Wordmark: React.FC<T3WordmarkProps> = ({
  size = 18,
  color = '#ffffff',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, { fontSize: size, color }]}>
        T<Text style={styles.accent}>3</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  accent: {
    color: '#3b82f6',
  },
});
