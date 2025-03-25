import * as SecureStore from 'expo-secure-store';

interface RequestBody {
  [key: string]: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  status: number;
}

async function getValueFor(key: string) {
  try {
    console.log(`Attempting to retrieve ${key} from SecureStore`);
    const result = await SecureStore.getItemAsync(key);
    console.log(`${key} retrieval result:`, result ? 'Found token' : 'No token found');
    return result;
  } catch (error) {
    console.error(`Error retrieving ${key} from SecureStore:`, error);
    return null;
  }
}

export interface ErrorResponse {
  success: false;
  type: "BadRequest" | "Unauthorized" | "RateLimitExceeded" | "ServerError" | "UnknownError";
  status: number;
  message: string;
  serverMessage?: string;
  details?: any;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL as string;
console.log("API_BASE_URL:", API_BASE_URL);

const apiClient = async <T,>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" = "GET",
  body: RequestBody | FormData | null = null,
): Promise<ApiResponse<T> | ErrorResponse> => {

  console.log("endpoint:", endpoint);
  const headers: Record<string, string> = {};
  
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    const token = await getValueFor("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log("Authorization header set with token");
    } else {
      console.log("No token available for Authorization header");
    }
  }

  const options: RequestInit = {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  };

  try {
    console.log("Sending request with options:", JSON.stringify({
      method: options.method,
      headers: options.headers,
      hasBody: !!options.body
    }));
    const response = await fetch(endpoint, options);
    console.log("Received response status:", response.status);
    
    if (method === 'DELETE' && response.status >= 200 && response.status < 300) {
      return {
        success: true,
        data: null as unknown as T,
        status: response.status,
      };
    }
    
    const contentType = response.headers.get('content-type');
    let data: T | null = null;
    
    if (contentType && contentType.includes('application/json') && response.status !== 204) {
      const text = await response.text();
      data = text ? JSON.parse(text) as T : null;
    }

    return {
      success: response.ok,
      data: data as T,
      status: response.status,
    };
  } catch (error: unknown) {
    console.error("API request failed:", error);
    return {
      success: false,
      type: "UnknownError",
      status: 0,
      message: "A network error occurred. Please check your connection or contact support.",
      serverMessage: error instanceof Error ? error.message : "Unknown fetch error",
    };
  }
};

const handleErrorResponse = async (response: Response): Promise<ErrorResponse> => {
  const status = response.status;
  let serverMessage = "No message provided by the server";
  let details = null;
  
  try {
    const errorData = await response.json();
    serverMessage = errorData.message || serverMessage;
    details = errorData.details || null;
  } catch (e) {
    // If we can't parse the JSON, just use the status text
    serverMessage = response.statusText;
  }

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