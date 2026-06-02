const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmailFormat(email) {
  return EMAIL_PATTERN.test(String(email || '').trim().toLowerCase());
}
