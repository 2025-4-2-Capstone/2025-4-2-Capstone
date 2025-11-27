// ui/lib/utils/api.ts

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // ❌ 쿠키 인증을 안 쓰므로 withCredentials 제거!
});

// Axios v1: InternalAxiosRequestConfig 대신 any 처리
api.interceptors.request.use((config: any) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      if (!config.headers) config.headers = {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
