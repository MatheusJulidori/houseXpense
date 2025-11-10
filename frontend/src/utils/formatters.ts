import { CURRENCY_CONFIG, DATE_FORMATS } from './constants';

// Currency formatting
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
        style: 'currency',
        currency: CURRENCY_CONFIG.currency,
    }).format(amount);
};

export function formatLocalYMDString(ymd: string): string {
    const [y, m, d] = ymd.split('-').map((v) => parseInt(v, 10));
    // Use a Date constructed in local timezone to avoid UTC shift in display
    const dateObj = new Date(y, (m || 1) - 1, d || 1);
    return new Intl.DateTimeFormat(DATE_FORMATS.DISPLAY, {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
    }).format(dateObj);
}

// Date formatting
export const formatDate = (date: string | Date, format: string = DATE_FORMATS.DISPLAY): string => {
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        // Format pure Y-M-D strings without timezone shift
        const [y, m, d] = date.split('-').map((v) => parseInt(v, 10));
        const dateObj = new Date(y, (m || 1) - 1, d || 1);
        return new Intl.DateTimeFormat(format, {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
        }).format(dateObj);
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat(format, {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
    }).format(dateObj);
};

// Format date for API
export const formatDateForAPI = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// Format month and year
export const formatMonthYear = (month: number, year: number): string => {
    const date = new Date(year, month - 1, 1);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
    }).format(date);
};

// Get month name
export const getMonthName = (month: number): string => {
    const date = new Date(2024, month - 1, 1);
    return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
};

// Get current month and year
export const getCurrentMonthYear = () => {
    const now = new Date();
    return {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
    };
};

// Get date range for month
export const getMonthDateRange = (month: number, year: number) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return {
        start: formatDateForAPI(startDate),
        end: formatDateForAPI(endDate),
    };
};

// Get date range for year
export const getYearDateRange = (year: number) => {
    return {
        start: `${year}-01-01`,
        end: `${year}-12-31`,
    };
};

// Calculate time ago
export const getTimeAgo = (date: string | Date): string => {
    const now = new Date();
    const past = typeof date === 'string' ? new Date(date) : date;
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};
