/**
 * Safe date utilities to prevent RangeError: Date value out of bounds
 */

/**
 * Safely converts a date to ISO string
 * @param {Date|string|number} date - The date to convert
 * @param {string} fallback - Fallback value if conversion fails
 * @returns {string} ISO string or fallback
 */
export const safeToISOString = (date, fallback = null) => {
  try {
    // If it's already a string and looks like an ISO string, return it
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(date)) {
      return date;
    }

    // Convert to Date object if needed
    const dateObj = date instanceof Date ? date : new Date(date);

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.error('❌ safeToISOString: Invalid date:', date);
      return fallback || new Date().toISOString();
    }

    return dateObj.toISOString();
  } catch (error) {
    console.error('❌ safeToISOString: Error converting date to ISO string:', error, 'Date:', date);
    return fallback || new Date().toISOString();
  }
};

/**
 * Safely extracts date part (YYYY-MM-DD) from a date
 * @param {Date|string|number} date - The date to extract from
 * @param {string} fallback - Fallback value if extraction fails
 * @returns {string} Date string in YYYY-MM-DD format or fallback
 */
export const safeDateString = (date, fallback = null) => {
  try {
    const isoString = safeToISOString(date, fallback);
    return isoString ? isoString.split('T')[0] : fallback;
  } catch (error) {
    console.error('❌ safeDateString: Error extracting date string:', error, 'Date:', date);
    return fallback || new Date().toISOString().split('T')[0];
  }
};

/**
 * Safely creates a Date object
 * @param {...any} args - Arguments to pass to Date constructor
 * @returns {Date} Valid Date object or current date as fallback
 */
export const safeDate = (...args) => {
  try {
    // If the first argument is a string, check for malformed date strings
    if (args.length === 1 && typeof args[0] === 'string') {
      let dateString = args[0];

      // Detect and fix malformed date strings with duplicate timezone indicators
      // Pattern: "2026-02-03T10:04:44.106ZT06:00:00" -> "2026-02-03T10:04:44.106Z"
      if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?ZT[+-]?\d{2}:\d{2}(:\d{2})?/.test(dateString)) {
        console.warn('⚠️ safeDate: Detected malformed date string with duplicate timezone, cleaning:', dateString);
        // Remove everything after the first Z
        dateString = dateString.split('Z')[0] + 'Z';
        console.log('✅ safeDate: Cleaned date string:', dateString);
      }

      const date = new Date(dateString);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.error('❌ safeDate: Invalid date created from args:', args);
        return new Date(); // Return current date as fallback
      }

      return date;
    }

    // For other argument patterns, use the original logic
    const date = new Date(...args);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error('❌ safeDate: Invalid date created from args:', args);
      return new Date(); // Return current date as fallback
    }

    return date;
  } catch (error) {
    console.error('❌ safeDate: Error creating date:', error, 'Args:', args);
    return new Date(); // Return current date as fallback
  }
};

/**
 * Safely formats a date for display
 * @param {Date|string|number} date - The date to format
 * @param {Intl.DateTimeFormatOptions} options - Formatting options
 * @param {string} fallback - Fallback text if formatting fails
 * @returns {string} Formatted date string or fallback
 */
export const safeFormatDate = (date, options = {}, fallback = 'Invalid Date') => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.error('❌ safeFormatDate: Invalid date:', date);
      return fallback;
    }

    return dateObj.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('❌ safeFormatDate: Error formatting date:', error, 'Date:', date);
    return fallback;
  }
};

/**
 * Safely compares two dates
 * @param {Date|string|number} date1 - First date
 * @param {Date|string|number} date2 - Second date
 * @returns {number} -1, 0, or 1 for comparison, or 0 if either date is invalid
 */
export const safeCompareDate = (date1, date2) => {
  try {
    const d1 = date1 instanceof Date ? date1 : new Date(date1);
    const d2 = date2 instanceof Date ? date2 : new Date(date2);

    // Check if both dates are valid
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      console.error('❌ safeCompareDate: Invalid date(s):', { date1, date2 });
      return 0; // Return equal if either date is invalid
    }

    if (d1 < d2) return -1;
    if (d1 > d2) return 1;
    return 0;
  } catch (error) {
    console.error('❌ safeCompareDate: Error comparing dates:', error, 'Dates:', { date1, date2 });
    return 0;
  }
};

/**
 * Validates if a value is a valid date
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid date, false otherwise
 */
export const isValidDate = (value) => {
  try {
    if (value instanceof Date) {
      return !isNaN(value.getTime());
    }

    const date = new Date(value);
    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * Safely converts Firestore timestamp to ISO string
 * @param {any} timestamp - Firestore timestamp object
 * @param {string} fallback - Fallback value if conversion fails
 * @returns {string} ISO string or fallback
 */
export const safeFirestoreTimestampToISO = (timestamp, fallback = null) => {
  try {
    if (!timestamp) {
      return fallback || new Date().toISOString();
    }

    // If it's already a string, validate it's a proper ISO string
    if (typeof timestamp === 'string') {
      // Check if it's a valid ISO 8601 date string
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?([+-]\d{2}:\d{2})?$/.test(timestamp)) {
        // Validate it can be parsed as a valid date
        const testDate = new Date(timestamp);
        if (!isNaN(testDate.getTime())) {
          // Return the ISO string as-is, ensuring it ends with Z if no timezone is present
          if (!timestamp.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(timestamp)) {
            return timestamp + 'Z';
          }
          return timestamp;
        }
      }
      // If it's not a valid ISO string, try to parse it
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
      return fallback || new Date().toISOString();
    }

    // If it's a Date object
    if (timestamp instanceof Date) {
      return safeToISOString(timestamp, fallback);
    }

    // If it's a Firestore timestamp with toDate method
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      const date = timestamp.toDate();
      return safeToISOString(date, fallback);
    }

    // If it has seconds and nanoseconds (Firestore timestamp structure)
    if (timestamp.seconds !== undefined) {
      const date = new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
      return safeToISOString(date, fallback);
    }

    // Try to create a date from the value
    return safeToISOString(timestamp, fallback);
  } catch (error) {
    console.error('❌ safeFirestoreTimestampToISO: Error converting timestamp:', error, 'Timestamp:', timestamp);
    return fallback || new Date().toISOString();
  }
};

export default {
  safeToISOString,
  safeDateString,
  safeDate,
  safeFormatDate,
  safeCompareDate,
  isValidDate,
  safeFirestoreTimestampToISO
};