import { appConfig } from '../config';

// App constants
export const APP_CONFIG = {
    name: appConfig.appName,
    version: appConfig.appVersion,
    apiUrl: appConfig.apiUrl,
};

// Local storage keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER: 'user',
    THEME: 'theme',
    PREFERENCES: 'preferences',
} as const;

// Date formatting
export const DATE_FORMATS = {
    DISPLAY: 'pt-BR',
    API: 'yyyy-MM-dd',
    MONTH_YEAR: 'MMMM yyyy',
    YEAR: 'yyyy',
} as const;

// Currency formatting
export const CURRENCY_CONFIG = {
    locale: 'pt-BR',
    currency: 'BRL',
    symbol: 'R$',
} as const;

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
} as const;

// Query keys
export const QUERY_KEYS = {
    AUTH: ['auth'],
    MOVEMENTS: ['movements'],
    TAGS: ['tags'],
} as const;
