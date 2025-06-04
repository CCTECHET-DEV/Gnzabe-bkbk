/**
 * Removes the last segment (e.g., 'signup') from a URL path string and returns the result.
 * @param {string} path - The URL path string (e.g., '/v1/authentication/user/signup').
 * @returns {string} The path with the last segment removed (e.g., '/v1/authentication/user').
 */
import otpGenerator from 'otp-generator';

export function removeLastPathSegment(path: string): string {
  if (!path) return path;
  // Remove trailing slash if present
  const normalized = path.endsWith('/') ? path.slice(0, -1) : path;
  const lastSlash = normalized.lastIndexOf('/');
  if (lastSlash <= 0) return '';
  return normalized.slice(0, lastSlash);
}

export const generateOtp = () =>
  otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
