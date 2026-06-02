import { LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function runSmoothLayoutAnimation() {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
}
