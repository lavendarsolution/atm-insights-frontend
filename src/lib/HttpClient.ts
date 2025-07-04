import axios, { AxiosRequestConfig } from "axios";
import nprogress from "nprogress";

import env from "./env";

const Axios = axios.create({
  baseURL: env.BACKEND_URL,
});

Axios.interceptors.request.use(function (config) {
  nprogress.start();

  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

Axios.interceptors.response.use(
  function (response) {
    nprogress.done();
    return response;
  },
  function (error) {
    nprogress.done();
    return Promise.reject(error);
  }
);

const HttpClient = {
  setToken: (token: string) => {
    if (token) {
      Axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete Axios.defaults.headers.common["Authorization"];
    }
  },
  Get: async (url: string, params?: any) => {
    return await Axios.get(url, {
      params,
    }).then((res) => res.data);
  },
  Post: async (url: string, body?: any, options?: AxiosRequestConfig) => {
    return await Axios.post(url, body, options).then((res) => res.data);
  },
  Put: async (url: string, body: any, options?: AxiosRequestConfig) => {
    return await Axios.put(url, body, options).then((res) => res.data);
  },
  Delete: async (url: string) => {
    return await Axios.delete(url).then((res) => res.data);
  },
};

export default HttpClient;
