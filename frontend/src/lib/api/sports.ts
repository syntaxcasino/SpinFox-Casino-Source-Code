import axios, { AxiosRequestConfig, Method } from 'axios';

export const SportsAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

SportsAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("gambitAccessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

SportsAPI.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("gambitAccessToken");
    }

    return Promise.reject(error);
  }
);

export const safeRequest = async (
  method: Method,
  url: string,
  config?: AxiosRequestConfig,
): Promise<any> => {
  try {
    const response = await SportsAPI.request({
      method,
      url,
      ...config,
    });
    return response.data; // Return only the data property
  } catch (err) {
    console.error(`Error during ${method} request to ${url}:`, err);
    return null; // Return null or a default value in case of error
  }
};
