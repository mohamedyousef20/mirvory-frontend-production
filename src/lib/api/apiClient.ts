import axios from "axios";

// Browser: empty baseURL → Next.js /api/* proxy forwards to Railway with cookies.
// SSR: full Railway URL (server-to-server, no browser cookie domain restriction).
// NEXT_PUBLIC_API_URL must be set in the Vercel dashboard.
const apiClient = axios.create({
  baseURL: typeof window !== "undefined"
    ? ""
    : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor – auth is handled via HTTP-only cookies (withCredentials: true)
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 401) {
        // Only redirect to login if we're not already on the auth page
        // and not calling an auth endpoint (avoids redirect loops)
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/auth/")
        ) {
          window.location.href = "/auth/login";
        }
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
