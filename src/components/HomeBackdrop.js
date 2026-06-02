import React from 'react';
import { StyleSheet, View } from 'react-native';

const paletteByTheme = {
  dark: {
    outerRing: 'rgba(255, 255, 255, 0.08)',
    innerRing: 'rgba(255, 255, 255, 0.08)',
    core: 'rgba(255, 255, 255, 0.08)',
    primaryBar: 'rgba(59, 130, 246, 0.18)',
    secondaryBar: 'rgba(255, 255, 255, 0.06)',
    baseGlow: 'rgba(59, 130, 246, 0.05)',
  },
  light: {
    outerRing: '#D6E0EE',
    innerRing: '#D6E0EE',
    core: '#DCE6F3',
    primaryBar: 'rgba(29, 78, 216, 0.12)',
    secondaryBar: 'rgba(100, 116, 139, 0.10)',
    baseGlow: 'rgba(29, 78, 216, 0.03)',
  },
};

export default function HomeBackdrop({ theme = 'dark' }) {
  const palette = paletteByTheme[theme] || paletteByTheme.dark;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.baseGlow, { backgroundColor: palette.baseGlow }]} />
      <View style={[styles.plateOuter, { borderColor: palette.outerRing }]}>
        <View style={[styles.plateInner, { borderColor: palette.innerRing }]}>
          <View style={[styles.plateCore, { backgroundColor: palette.core }]} />
        </View>
      </View>
      <View style={[styles.accentBarPrimary, { backgroundColor: palette.primaryBar }]} />
      <View style={[styles.accentBarSecondary, { backgroundColor: palette.secondaryBar }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  baseGlow: {
    position: 'absolute',
    bottom: 132,
    left: -72,
    width: 214,
    height: 214,
    borderRadius: 107,
  },
  plateOuter: {
    position: 'absolute',
    bottom: 42,
    left: -58,
    width: 184,
    height: 184,
    borderRadius: 92,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateInner: {
    width: 126,
    height: 126,
    borderRadius: 63,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateCore: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  accentBarPrimary: {
    position: 'absolute',
    bottom: 126,
    left: 84,
    width: 188,
    height: 12,
    borderRadius: 999,
    transform: [{ rotate: '-10deg' }],
  },
  accentBarSecondary: {
    position: 'absolute',
    bottom: 82,
    left: 126,
    width: 132,
    height: 10,
    borderRadius: 999,
    transform: [{ rotate: '-10deg' }],
  },
});
