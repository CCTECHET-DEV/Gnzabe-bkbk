/**
 * Removes the last segment (e.g., 'signup') from a URL path string and returns the result.
 * @param {string} path - The URL path string (e.g., '/v1/authentication/user/signup').
 * @returns {string} The path with the last segment removed (e.g., '/v1/authentication/user').
 */
import otpGenerator from 'otp-generator';
import { ICompany } from '../interfaces/companyInterface';

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

/**
 * Filters a company object to only include _id, name, and departments fields.
 * @param company The company object from the database
 */
export function filterCompanyForRegistration(company: ICompany) {
  return {
    id: company._id,
    name: company.name,
    departments: company.departments?.filter((dept: any) => dept.isActive),
  };
}
