// httpInterceptor.ts

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getSession } from "next-auth/react";
import { TApiResponse } from "../types";

export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

//@ts-ignore
function axiosInstanceCreator(baseURL: string | undefined, accessKey?: string) {
  const axiosInstance: AxiosInstance = axios.create();
  axiosInstance.defaults.baseURL = baseURL;

  axiosInstance.interceptors.request.use(
    async function (config: InternalAxiosRequestConfig) {
      if (!config.headers) {
        config.headers = {} as AxiosRequestHeaders;
      }

      if (typeof window !== "undefined") {
        const session = await getSession();
        if (session?.accessToken) {
          if (baseURL === BASE_URL) {
            config.headers["access-token"] = session.accessToken;
            config.headers["Authorization"] = `Bearer ${session.accessToken}`;
          } else {
            config.headers["AccessKey"] = session.accessToken;
            config.headers["Authorization"] = `Bearer ${session.accessToken}`;
          }
        } else if (accessKey) {
          // Fallback to static key if no session (e.g. server side or not logged in)
          if (baseURL === BASE_URL) {
            config.headers["access-token"] = accessKey;
            config.headers["Authorization"] = `Bearer ${accessKey}`;
          } else {
            config.headers["AccessKey"] = accessKey;
            config.headers["Authorization"] = `Bearer ${accessKey}`;
          }
        }
      } else if (accessKey) {
        if (baseURL === BASE_URL) {
          config.headers["access-token"] = accessKey;
          config.headers["Authorization"] = `Bearer ${accessKey}`;
        } else {
          config.headers["AccessKey"] = accessKey;
          config.headers["Authorization"] = `Bearer ${accessKey}`;
        }
      }

      return config;
    },
    function (error: AxiosError) {
      return Promise.reject(error);
    },
  );

  axiosInstance.interceptors.response.use(
    function (response: AxiosResponse<TApiResponse>) {
      if (response.status >= 200 && response.status <= 299) {
        return response;
      } else {
        return Promise.reject(response);
      }
    },
    async function (error: AxiosError) {
      if (error.response?.status === 401 && typeof window !== "undefined") {
        // Avoid triggering signOut multiple times for concurrent expired requests
        if (!(window as any).__signingOut) {
          (window as any).__signingOut = true;
          const { signOut } = await import("next-auth/react");
          await signOut({ callbackUrl: "/login" });
        }
      }
      return Promise.reject(error);
    },
  );

  return axiosInstance;
}

const mainInstance = axiosInstanceCreator(BASE_URL);

export const API_INSTANCES = {
  mainInstance: mainInstance,
};
export default API_INSTANCES;
