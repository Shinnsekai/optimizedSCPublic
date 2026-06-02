// src/constants/theme.js
// Holds the primary color tokens for the application based on Light/Dark modes.
export const getThemeColors = (mode) => {
  if (mode === 'dark') {
    return {
      background: '#050816',
      surface: '#0D1526',
      primary: '#3B82F6', // Vibrant blue — high contrast on dark backgrounds
      text: '#FFFFFF',
      textSecondary: '#8896B0',
      border: '#1B2740',
      danger: '#EF4444',
      success: '#10B981',
      warning: '#F59E0B',
    };
  } else {
    return {
      background: '#F4F7FB',
      surface: '#FFFFFF',
      primary: '#2563EB', // Slightly brighter for light backgrounds
      text: '#0F172A',
      textSecondary: '#64748B',
      border: '#D6E0EE',
      danger: '#DC2626',
      success: '#059669',
      warning: '#D97706',
    };
  }
}
