/**
 * Formats a raw phone number string into the specified format: 0XX XXX XX XX
 * @param {string} value - The raw input string
 * @returns {string} - The formatted phone number
 */
export const formatPhoneNumber = (value) => {
    if (!value) return value;

    // Remove all non-digit characters
    const phoneNumber = value.replace(/[^\d]/g, '');

    // Limit to 10 digits
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength <= 3) {
        return phoneNumber;
    }
    if (phoneNumberLength <= 6) {
        return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`;
    }
    if (phoneNumberLength <= 8) {
        return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6)}`;
    }
    return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 8)} ${phoneNumber.slice(8, 10)}`;
};

/**
 * Validates if the phone number is in the correct format
 * @param {string} value - The formatted phone number
 * @returns {boolean}
 */
export const isValidPhoneNumber = (value) => {
    const digitsOnly = value.replace(/[^\d]/g, '');
    return digitsOnly.length === 10 && digitsOnly.startsWith('0');
};
