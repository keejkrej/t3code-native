import React from 'react';
import { View, StyleSheet } from 'react-native';

export const SidebarStageBackdrop: React.FC = () => {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.glow} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 52,
    backgroundColor: '#0c1527',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.2)',
    overflow: 'hidden',
    zIndex: 0,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
});
