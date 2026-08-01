import axios from "axios";

// Request auth is handled via HTTP-only cookies (withCredentials: true).
// NEXT_PUBLIC_API_URL must be set in the Vercel dashboard; the fallback
// ensures requests always reach Railway even if the env var is missing.
const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://pure-courtesy-production-8cb1.up.railway.app",
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
        // Redirect to login on unauthorized
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
