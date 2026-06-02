import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlayCircle } from 'lucide-react-native';
import { useStore } from '../store';
import { getThemeColors } from '../constants/theme';

const HELP_VIDEO_TITLE = 'Optimized App Walkthrough';
const HELP_VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

export default function HelpScreen() {
  const { theme } = useStore();
  const colors = getThemeColors(theme);
  const canOpenVideo = Boolean(HELP_VIDEO_URL);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.scroll}>
        <Text style={[styles.title, { color: colors.text }]}>User Support</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          For more details on how to use the app, please watch this video below.
        </Text>

        <TouchableOpacity
          activeOpacity={canOpenVideo ? 0.9 : 1}
          style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => {
            if (canOpenVideo) {
              Linking.openURL(HELP_VIDEO_URL);
            }
          }}
        >
          <View style={styles.thumbnail}>
            <View style={styles.overlay} />
            <PlayCircle color="#FFFFFF" size={54} />
          </View>
          <Text style={[styles.videoTitle, { color: colors.text }]}>{HELP_VIDEO_TITLE}</Text>
          <Text style={[styles.caption, { color: colors.textSecondary }]}>
            {canOpenVideo
              ? 'Tap the preview to open the walkthrough on YouTube.'
              : 'Add your YouTube walkthrough link here before release.'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbnail: {
    height: 210,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(29, 78, 216, 0.24)',
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 18,
  },
});
