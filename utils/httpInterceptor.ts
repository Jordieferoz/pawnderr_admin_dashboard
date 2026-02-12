// httpInterceptor.ts

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { TApiResponse } from "../types";

export const BASE_URL = process.env.NEXT_PUBLIC_DEV_API_URL;
export const CHAT_BASE_URL = process.env.NEXT_PUBLIC_CHAT_API_BASE_URL;

//@ts-ignore
function axiosInstanceCreator(baseURL: string | undefined, accessKey?: string) {
  const axiosInstance: AxiosInstance = axios.create();
  axiosInstance.defaults.baseURL = baseURL;
  axiosInstance.defaults.withCredentials = true; //should not remove this line
  axiosInstance.interceptors.request.use(
    function (config: InternalAxiosRequestConfig) {
      if (!config.headers) {
        config.headers = {} as AxiosRequestHeaders;
      }

      if (accessKey) {
        if (baseURL === BASE_URL) {
          // Merge with existing headers instead of replacing
          config.headers["access-token"] = accessKey;
        } else {
          // Merge with existing headers instead of replacing
          config.headers["AccessKey"] = accessKey;
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
    function (error: AxiosError) {
      return Promise.reject(error);
    },
  );

  return axiosInstance;
}

const mainInstance = axiosInstanceCreator(BASE_URL, "key");
const chatInstance = axiosInstanceCreator(CHAT_BASE_URL, "");

export const API_INSTANCES = {
  mainInstance: mainInstance,
  chatInstance: chatInstance,
};
export default API_INSTANCES;
