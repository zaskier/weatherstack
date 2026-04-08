/**
 * Converts various date/timestamp formats into a human-readable ISO 8601 string.
 * @param date - Can be a Date object, a Unix timestamp (number or string).
 * @returns ISO 8601 formatted string or the original input as a string if invalid.
 */
export const formatToISO8601 = (date: Date | string | number): string => {
  if (!date) return String(date);
  
  if (date instanceof Date) {
    return date.toISOString();
  }

  // Handle Unix timestamp strings or numbers
  const timestamp = Number(date);
  const parsedDate = new Date(isNaN(timestamp) ? date : timestamp);

  if (isNaN(parsedDate.getTime())) {
    console.warn(`[Utils/Date] Invalid date input: ${date}`);
    return String(date);
  }

  return parsedDate.toISOString();
};
