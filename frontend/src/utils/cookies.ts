const isBrowser = typeof document !== 'undefined';

export const getCookie = (name: string): string | null => {
    if (!isBrowser) {
        return null;
    }
    const encodedName = encodeURIComponent(name);
    const match = document.cookie.match(
        new RegExp(`(?:^|; )${encodedName.replace(/[-.+*]/g, '\\$&')}=([^;]*)`)
    );
    return match ? decodeURIComponent(match[1]) : null;
};

export const getCsrfToken = (): string | null => getCookie('csrf_token');
export const getRefreshToken = (): string | null => getCookie('refresh_token');

