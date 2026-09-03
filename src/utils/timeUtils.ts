import { Product, ProductSaleState } from '../types';

/**
 * Vietnam Timezone Helper (GMT+7, Asia/Ho_Chi_Minh)
 */
export const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Format timestamp to formatted Vietnam time strings
 */
export function formatVietnamTime(timestamp: number | Date): {
  timeStr: string; // HH:mm:ss
  hourMinuteStr: string; // HH:mm
  dateStr: string; // DD/MM/YYYY
  isoDateStr: string; // YYYY-MM-DD
  dayOfWeekStr: string; // Thứ Hai, Thứ Ba...
  fullDateTimeStr: string; // 08:09:32 – 24/08/2026
  readableDateTimeStr: string; // 08:09:32 • Thứ Hai, 24/08/2026
  saleScheduleDisplay: string; // 24/08/2026 – 09:00
  saleReadableDisplay: string; // Ngày 24/08/2026 lúc 09:00
} {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;

  const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const hourMinFormatter = new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const isoDateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: VIETNAM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const weekdayFormatter = new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIMEZONE,
    weekday: 'long'
  });

  const timeStr = timeFormatter.format(date);
  const hourMinuteStr = hourMinFormatter.format(date);
  const dateStr = dateFormatter.format(date);
  const isoDateStr = isoDateFormatter.format(date);
  const dayOfWeekStr = weekdayFormatter.format(date);

  return {
    timeStr,
    hourMinuteStr,
    dateStr,
    isoDateStr,
    dayOfWeekStr,
    fullDateTimeStr: `${timeStr} – ${dateStr}`,
    readableDateTimeStr: `${timeStr} • ${dayOfWeekStr}, ${dateStr}`,
    saleScheduleDisplay: `${dateStr} – ${hourMinuteStr}`,
    saleReadableDisplay: `Ngày ${dateStr} lúc ${hourMinuteStr}`
  };
}

/**
 * Calculates remaining time until target timestamp
 */
export function calculateRemainingTime(targetTimestamp: number, currentServerTime: number): {
  isUpcoming: boolean;
  totalMs: number;
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedCountdown: string; // e.g. "00:50:28" or "1 ngày 02:15:30"
  digitalClockCountdown: string; // e.g. "00:50:28"
  detailedText: string;
  humanRemainingShort: string; // e.g. "Còn 51 phút", "Còn 1 ngày 4 giờ"
} {
  const diff = targetTimestamp - currentServerTime;

  if (diff <= 0) {
    return {
      isUpcoming: false,
      totalMs: 0,
      totalSeconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formattedCountdown: '00:00:00',
      digitalClockCountdown: '00:00:00',
      detailedText: 'Đã đến giờ mở bán',
      humanRemainingShort: 'Đã mở bán'
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  const digitalClockCountdown = `${pad(hours + days * 24)}:${pad(minutes)}:${pad(seconds)}`;
  
  let formattedCountdown = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  if (days > 0) {
    formattedCountdown = `${days} ngày ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  let detailedText = '';
  let humanRemainingShort = '';

  if (days > 0) {
    detailedText = `Còn ${days} ngày ${hours} giờ ${minutes} phút`;
    humanRemainingShort = `Còn ${days} ngày ${hours} giờ`;
  } else if (hours > 0) {
    detailedText = `Còn ${hours} giờ ${minutes} phút ${seconds} giây`;
    humanRemainingShort = `Còn ${hours} giờ ${minutes} phút`;
  } else if (minutes > 0) {
    detailedText = `Còn ${minutes} phút ${seconds} giây`;
    humanRemainingShort = `Còn ${minutes} phút`;
  } else {
    detailedText = `Còn ${seconds} giây`;
    humanRemainingShort = `Còn ${seconds}s`;
  }

  return {
    isUpcoming: true,
    totalMs: diff,
    totalSeconds,
    days,
    hours,
    minutes,
    seconds,
    formattedCountdown,
    digitalClockCountdown,
    detailedText,
    humanRemainingShort
  };
}

/**
 * Determine dynamic product sale state
 */
export function getProductSaleState(
  product: Product,
  currentServerTime: number
): ProductSaleState {
  if (product.status === 'SOLD_OUT') return 'SOLD_OUT';
  if (product.status === 'HIDDEN') return 'HIDDEN';
  if (product.openSaleTimestamp && product.openSaleTimestamp > currentServerTime) {
    return 'UPCOMING';
  }
  return 'AVAILABLE';
}

/**
 * Build timestamp from date (YYYY-MM-DD or DD/MM/YYYY) and hour (0-23) + minute (0-59) in Vietnam Time
 */
export function buildVietnamTimestamp(dateStr: string, hour: number, minute: number): number {
  if (!dateStr) {
    return Date.now();
  }

  let year = 2026;
  let month = 8;
  let day = 24;

  if (dateStr.includes('-')) {
    // Format YYYY-MM-DD
    const parts = dateStr.split('-').map(Number);
    year = parts[0];
    month = parts[1];
    day = parts[2];
  } else if (dateStr.includes('/')) {
    // Format DD/MM/YYYY
    const parts = dateStr.split('/').map(Number);
    day = parts[0];
    month = parts[1];
    year = parts[2];
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const safeHour = Math.min(23, Math.max(0, hour || 0));
  const safeMin = Math.min(59, Math.max(0, minute || 0));

  const isoStr = `${year}-${pad(month)}-${pad(day)}T${pad(safeHour)}:${pad(safeMin)}:00+07:00`;
  return new Date(isoStr).getTime();
}

/**
 * Get today's date in Vietnam as YYYY-MM-DD
 */
export function getTodayVietnamDateStr(currentServerTime?: number): string {
  const d = currentServerTime ? new Date(currentServerTime) : new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: VIETNAM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(d);
}

/**
 * Get tomorrow's date in Vietnam as YYYY-MM-DD
 */
export function getTomorrowVietnamDateStr(currentServerTime?: number): string {
  const baseTime = currentServerTime || Date.now();
  const tomorrow = new Date(baseTime + 24 * 60 * 60 * 1000);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: VIETNAM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(tomorrow);
}

/**
 * Parse an existing product's opening time configuration
 */
export function parseProductOpeningValues(product?: Product | null, currentServerTime?: number): {
  dateStr: string; // YYYY-MM-DD
  hour: number; // 0-23
  minute: number; // 0-59
  openSaleTimestamp: number;
} {
  const now = currentServerTime || Date.now();

  if (product && product.openSaleTimestamp) {
    const vnTime = formatVietnamTime(product.openSaleTimestamp);
    const d = new Date(product.openSaleTimestamp);
    
    const hourFormatter = new Intl.DateTimeFormat('vi-VN', {
      timeZone: VIETNAM_TIMEZONE,
      hour: 'numeric',
      hour12: false
    });
    const minFormatter = new Intl.DateTimeFormat('vi-VN', {
      timeZone: VIETNAM_TIMEZONE,
      minute: 'numeric'
    });

    const parsedHour = parseInt(hourFormatter.format(d), 10) || 0;
    const parsedMin = parseInt(minFormatter.format(d), 10) || 0;

    return {
      dateStr: vnTime.isoDateStr,
      hour: parsedHour,
      minute: parsedMin,
      openSaleTimestamp: product.openSaleTimestamp
    };
  }

  // Defaults: today + default time slot
  const defaultValues = getDefaultOpeningTimeValues(now);
  const timestamp = buildVietnamTimestamp(defaultValues.dateStr, defaultValues.hour, defaultValues.minute);

  return {
    dateStr: defaultValues.dateStr,
    hour: defaultValues.hour,
    minute: defaultValues.minute,
    openSaleTimestamp: timestamp
  };
}

/**
 * Extract default hour and minute for opening time
 */
export function getDefaultOpeningTimeValues(currentServerTime: number): {
  dateStr: string;
  hour: number;
  minute: number;
} {
  const dateStr = getTodayVietnamDateStr(currentServerTime);
  const d = new Date(currentServerTime);
  
  // Convert to Vietnam hour/minute
  const hourFormatter = new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIMEZONE,
    hour: 'numeric',
    hour12: false
  });
  const minFormatter = new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIMEZONE,
    minute: 'numeric'
  });

  const currentHour = parseInt(hourFormatter.format(d), 10) || 8;
  const currentMin = parseInt(minFormatter.format(d), 10) || 0;

  // Default to 15 minutes ahead or next hour
  let targetMin = Math.ceil((currentMin + 5) / 5) * 5;
  let targetHour = currentHour;
  if (targetMin >= 60) {
    targetMin = 0;
    targetHour = (targetHour + 1) % 24;
  }

  return {
    dateStr,
    hour: targetHour,
    minute: targetMin
  };
}
