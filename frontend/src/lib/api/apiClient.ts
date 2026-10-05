const rawEnvUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
export const API_BASE_URL = (
  rawEnvUrl && !rawEnvUrl.includes('your-render-backend-url')
    ? rawEnvUrl
    : 'https://beta2-h6y2.onrender.com'
).replace(/\/$/, '');
