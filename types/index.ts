export type TApiResponse = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  data: {};
  status_code: number;
  message: string;
  success?: boolean;
};

export type TResponse<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  data: T;
  statusCode: number;
  message: string;
  success?: boolean;
  error?: {
    code: number;
    message: string;
  };
};
