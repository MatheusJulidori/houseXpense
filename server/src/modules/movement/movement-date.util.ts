export const toLocalDateString = (date: Date, offsetMinutes = 180): string => {
  const utcMs = date.getTime() - offsetMinutes * 60 * 1000;
  const shifted = new Date(utcMs);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const day = String(shifted.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseUtcDate = (ymd: string): Date => {
  const [year, month, day] = ymd.split('-').map(Number);
  if ([year, month, day].some((value) => Number.isNaN(value))) {
    throw new Error(`Invalid date format: ${ymd}`);
  }
  return new Date(Date.UTC(year, month - 1, day));
};
