import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Phone } from 'lucide-react-native';
import { useStore } from '../store';
import { getThemeColors } from '../constants/theme';

const CONTACT_EMAIL = 'maahirgariba10@gmail.com';
const CONTACT_PHONE = '+91 8591245429';

export default function ContactUsScreen() {
  const { theme } = useStore();
  const colors = getThemeColors(theme);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Contact Us</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            This app was developed by Maahir Gariba with the help of AI.
          </Text>

          <TouchableOpacity style={styles.row} onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
            <Mail color={colors.primary} size={18} />
            <Text style={[styles.linkText, { color: colors.primary }]}>Contact email: {CONTACT_EMAIL}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={() => Linking.openURL(`tel:${CONTACT_PHONE.replace(/\s+/g, '')}`)}>
            <Phone color={colors.primary} size={18} />
            <Text style={[styles.linkText, { color: colors.primary }]}>Contact Number: {CONTACT_PHONE}</Text>
          </TouchableOpacity>

          <Text style={[styles.body, { color: colors.textSecondary }]}>
            In case of any concerns, feel free to reach out.
          </Text>
          <Text style={[styles.thankYou, { color: colors.text }]}>Thank you!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
  },
  thankYou: {
    fontSize: 16,
    fontWeight: '700',
  },
});
