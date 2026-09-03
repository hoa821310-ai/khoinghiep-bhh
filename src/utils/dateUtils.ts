/**
 * Date and calculation utilities according to CLB rules
 */

const DAY_NAMES = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy'
];

/**
 * Calculates the next working day (Monday to Friday only).
 * Rules:
 * Monday -> Tuesday
 * Tuesday -> Wednesday
 * Wednesday -> Thursday
 * Thursday -> Friday
 * Friday -> Monday
 * Saturday -> Monday
 * Sunday -> Monday
 */
export function getNextWorkingDay(baseDate: Date = new Date()): {
  dayName: string;
  formattedDate: string;
  fullDescription: string;
} {
  const currentDay = baseDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  let daysToAdd = 1;

  if (currentDay === 5) {
    // Friday -> Monday (+3 days)
    daysToAdd = 3;
  } else if (currentDay === 6) {
    // Saturday -> Monday (+2 days)
    daysToAdd = 2;
  } else if (currentDay === 0) {
    // Sunday -> Monday (+1 day)
    daysToAdd = 1;
  } else {
    // Mon-Thu -> Next day (+1 day)
    daysToAdd = 1;
  }

  const nextDate = new Date(baseDate);
  nextDate.setDate(baseDate.getDate() + daysToAdd);

  const nextDayName = DAY_NAMES[nextDate.getDay()];
  const dateNum = String(nextDate.getDate()).padStart(2, '0');
  const monthNum = String(nextDate.getMonth() + 1).padStart(2, '0');
  const yearNum = nextDate.getFullYear();

  const formattedDate = `${dateNum}/${monthNum}/${yearNum}`;

  return {
    dayName: nextDayName,
    formattedDate,
    fullDescription: `${nextDayName} (${formattedDate})`
  };
}

/**
 * Format currency in Vietnamese Dong (VND)
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

/**
 * Validate Vietnamese phone number format
 * Valid: 10 digits starting with 0 (e.g. 0901234567, 0388123456)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleanPhone = phone.trim().replace(/\s+/g, '');
  const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
  return phoneRegex.test(cleanPhone);
}

/**
 * Format phone number with spaces for display (e.g. 0988 781 310)
 */
export function formatPhoneDisplay(phone: string): string {
  const clean = phone.trim().replace(/\s+/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
  }
  return phone;
}
