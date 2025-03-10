import axios, { AxiosRequestConfig, AxiosError } from "axios";

interface RequestBody {
  [key: string]: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  type: "BadRequest" | "Unauthorized" | "RateLimitExceeded" | "ServerError" | "UnknownError";
  status: number;
  message: string;
  serverMessage?: string; // Full server-provided message for debugging
  details?: any;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL as string;


const apiClient = async <T,>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body: RequestBody | FormData | null = null,
): Promise<ApiResponse<T> | ErrorResponse> => {


  const headers: Record<string, string> = {};
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const axiosConfig: AxiosRequestConfig = {
    url: endpoint,
    method,
    data: body,
    headers,
  };

  try {
    const response = await axios(axiosConfig);
    return { 
      success: true, 
      data: response.data, 
      message: response.data.message || "Request successful" 
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return handleSpecificError(error);
    }
    console.error("Unknown error:", error);
    return {
      success: false,
      type: "UnknownError",
      status: 0,
      message: "A network error occurred. Please check your connection or contact support.",
      serverMessage: error instanceof Error ? error.message : "Unknown fetch error",
    };
  }
};

const handleSpecificError = (error: AxiosError): ErrorResponse => {
  const status = error.response?.status || 0;
  const serverMessage = (error.response?.data as { message?: string })?.message || "No message provided by the server";
  const details = (error.response?.data as { details?: any })?.details || null;

  switch (status) {
    case 400:
      return {
        success: false,
        type: "BadRequest",
        status,
        message: "Bad request - check your input",
        serverMessage,
        details,
      };
    case 401:
      // For mobile, we'll handle navigation in the component that uses this
      return {
        success: false,
        type: "Unauthorized",
        status,
        message: "Unauthorized. Please login again!",
        serverMessage,
      };
    case 429:
      return {
        success: false,
        type: "RateLimitExceeded",
        status,
        message: "Rate limit exceeded. Please try again later.",
        serverMessage,
      };
    case 500:
      return {
        success: false,
        type: "ServerError",
        status,
        message: "Internal server error occurred.",
        serverMessage,
      };
    default:
      return {
        success: false,
        type: "UnknownError",
        status,
        message: `An unexpected error occurred (Status: ${status})`,
        serverMessage,
        details,
      };
  }
};


export default apiClient;