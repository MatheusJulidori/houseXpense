interface AppConfig {
    mode: string;
    apiUrl: string;
    appName: string;
    appVersion: string;
}

const requireEnv = (value: string | undefined, key: string): string => {
    if (!value || value.trim().length === 0) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};

export const appConfig: AppConfig = {
    mode: import.meta.env.MODE ?? 'development',
    apiUrl: requireEnv(import.meta.env.VITE_API_URL, 'VITE_API_URL'),
    appName: import.meta.env.VITE_APP_NAME ?? 'houseXpense',
    appVersion: import.meta.env.VITE_APP_VERSION ?? '0.0.0',
};

