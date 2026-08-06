// FIX: was using bare axios.post without withCredentials.
// Cookies (accessToken / refreshToken) would NOT be sent with these requests
// because browsers require withCredentials: true for cross-origin cookie sending.
// Switched to axios.create with withCredentials: true so cookies are included.
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pure-courtesy-production-8cb1.up.railway.app';

// Shared axios instance with credentials enabled — cookies will be sent cross-origin
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const userService = {
  // ... existing methods

  generateVerificationCode: async (email: string) => {
    const response = await api.post(`/auth/generate-verification-code`, { email });
    return response;
  },

  sendVerificationEmail: async ({ email, code }: { email: string; code: string }) => {
    const response = await api.post(`/auth/send-verification-email`, { email, code });
    return response;
  },

  verifyEmail: async ({ email, verificationCode }: { email: string; verificationCode: string }) => {
    const response = await api.post(`/auth/verify-email`, { email, verificationCode });
    return response;
  },
};
