const USERNAME_PATTERN = /^[A-Za-z0-9]+$/;

export function isValidUsernameFormat(username) {
  return USERNAME_PATTERN.test(String(username || '').trim());
}

export function getUsernameValidationMessage(username) {
  const trimmedUsername = String(username || '').trim();

  if (!trimmedUsername) {
    return 'Enter a username.';
  }

  if (!isValidUsernameFormat(trimmedUsername)) {
    return 'Use letters and numbers only for your username.';
  }

  if (trimmedUsername.length < 3) {
    return 'Use at least 3 characters for your username.';
  }

  if (trimmedUsername.length > 24) {
    return 'Keep your username under 24 characters.';
  }

  return '';
}
