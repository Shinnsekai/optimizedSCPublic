import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useStore } from '../store';
import { getThemeColors } from '../constants/theme';
import { LEGAL_POLICY_SECTIONS, LEGAL_POLICY_TITLE } from '../constants/legalPolicy';

export default function LegalPolicyModal({ visible, onClose, confirmLabel, onConfirm }) {
  const { theme } = useStore();
  const colors = getThemeColors(theme);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>{LEGAL_POLICY_TITLE}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color={colors.text} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {LEGAL_POLICY_SECTIONS.map((section) => (
              <View key={section.heading} style={styles.section}>
                <Text style={[styles.sectionHeading, { color: colors.text }]}>{section.heading}</Text>
                <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>{section.body}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {onConfirm ? (
          <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <TouchableOpacity style={[styles.confirmButton, { backgroundColor: colors.primary }]} onPress={onConfirm}>
              <Text style={styles.confirmText}>{confirmLabel || 'Confirm'}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  content: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 18,
  },
  section: {
    gap: 8,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
  },
  confirmButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  confirmText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
