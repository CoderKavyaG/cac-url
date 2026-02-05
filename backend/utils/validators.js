/**
 * Validate URL format
 */
const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

/**
 * Validate custom alias format
 * Only allows letters, numbers, hyphens, and underscores
 * Length: 3-50 characters
 */
const isValidAlias = (alias) => {
  if (!alias || typeof alias !== 'string') return false;
  if (alias.length < 3 || alias.length > 50) return false;
  return /^[a-zA-Z0-9_-]+$/.test(alias);
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize user input to prevent XSS
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Extract username from email
 */
const getUsernameFromEmail = (email) => {
  if (!email || typeof email !== 'string') return null;
  return email.split('@')[0];
};

/**
 * Calculate days remaining until expiration
 */
const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const msRemaining = expiry.getTime() - now.getTime();
  return Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
};

/**
 * Check if a date is expired
 */
const isExpired = (expiryDate) => {
  if (!expiryDate) return false;
  return new Date() > new Date(expiryDate);
};

module.exports = {
  isValidUrl,
  isValidAlias,
  isValidEmail,
  sanitizeInput,
  getUsernameFromEmail,
  getDaysUntilExpiry,
  isExpired,
};
