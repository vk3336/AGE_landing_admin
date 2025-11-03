// utils/apiFetch.ts

const API_KEY_NAME = process.env.NEXT_PUBLIC_API_KEY_NAME;
const API_KEY_VALUE = process.env.NEXT_PUBLIC_API_SECRET_KEY;
const ROLE_MANAGEMENT_HEADER = process.env.NEXT_PUBLIC_Role_Management_Key;
const ROLE_MANAGEMENT_VALUE = process.env.NEXT_PUBLIC_Role_Management_Key_Value;

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return (process.env.NEXT_PUBLIC_API_URL?.trim() || window.location.origin);
  }
  return (process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:7000");
};

const isAbsoluteUrl = (s: string) => /^https?:\/\//i.test(s);
const ensureLeadingSlash = (s: string) =>
  (s ? (s.startsWith("/") ? s.replace(/^\/+/, "/") : `/${s}`) : "/");

// Use consistent headers for all requests to avoid preflight issues
const SIMPLE_ENDPOINTS: RegExp[] = []; // Empty array to disable simple request optimization

export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let raw = typeof input === "string" ? input : input.toString();

  if (!isAbsoluteUrl(raw) && !raw.startsWith("/")) raw = ensureLeadingSlash(raw);
  if (raw.startsWith("/")) {
    const base = getBaseUrl().replace(/\/+$/, "");
    raw = `${base}${raw}`;
  }

  const urlObj = new URL(raw, getBaseUrl());
  const method = (init?.method ?? "GET").toUpperCase();

  // Cache-bust GETs
  if (method === "GET") urlObj.searchParams.set("_ts", String(Date.now()));

  const finalUrl = urlObj.toString();
  const pathname = urlObj.pathname;
  
  // Skip for health check to prevent infinite loops
  if (pathname.includes('/health')) {
    return fetch(finalUrl, {
      ...init,
      method,
      headers: {
        'Accept': 'application/json',
        ...(init?.headers || {})
      }
    });
  }

  const isSimpleEndpoint = SIMPLE_ENDPOINTS.some((re) => re.test(pathname));
  const isFormData = init?.body instanceof FormData;

  // ---- Build headers for first attempt
  const headers1 = new Headers(init?.headers);

  // Keep headers minimal
  if (!headers1.has("Accept")) headers1.set("Accept", "application/json");

  if (isSimpleEndpoint) {
    // SIMPLE attempt: avoid preflight
    if (!isFormData && !headers1.has("Content-Type")) {
      headers1.set("Content-Type", "text/plain;charset=UTF-8");
    }
    // Strip custom auth headers if present
    if (API_KEY_NAME && headers1.has(API_KEY_NAME)) headers1.delete(API_KEY_NAME);
    if (ROLE_MANAGEMENT_HEADER && headers1.has(ROLE_MANAGEMENT_HEADER)) headers1.delete(ROLE_MANAGEMENT_HEADER);
  } else {
    // Normal path
    if (!headers1.has("Content-Type") && !isFormData) {
      headers1.set("Content-Type", "application/json");
    }
    const isRoleApi = finalUrl.includes("/api/roles");
    if (isRoleApi && ROLE_MANAGEMENT_HEADER && ROLE_MANAGEMENT_VALUE) {
      headers1.set(ROLE_MANAGEMENT_HEADER, ROLE_MANAGEMENT_VALUE);
    } else if (API_KEY_NAME && API_KEY_VALUE) {
      headers1.set(API_KEY_NAME, API_KEY_VALUE);
    }
  }

  // Let browser set boundary for FormData
  if (isFormData && headers1.has("Content-Type")) headers1.delete("Content-Type");

  // Prepare headers with proper CORS and authentication
  const headers = new Headers();
  
  // Set default headers
  headers.set('Accept', 'application/json');
  
  // Only set Content-Type for non-GET requests and when not FormData
  if (method !== 'GET' && !(init?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Add API key if available
  if (API_KEY_NAME && API_KEY_VALUE) {
    headers.set(API_KEY_NAME, API_KEY_VALUE);
  }
  
  // Add role management header if needed
  const isRoleApi = finalUrl.includes("/api/roles");
  if (isRoleApi && ROLE_MANAGEMENT_HEADER && ROLE_MANAGEMENT_VALUE) {
    headers.set(ROLE_MANAGEMENT_HEADER, ROLE_MANAGEMENT_VALUE);
  }
  
  // Merge with any headers from init
  if (init?.headers) {
    const initHeaders = new Headers(init.headers);
    initHeaders.forEach((value, key) => {
      if (value) headers.set(key, value);
    });
  }
  
  // Prepare request options
  const requestOptions: RequestInit = {
    ...init,
    method,
    headers,
    mode: 'cors',
    credentials: 'include', // Important for cookies/auth
    cache: 'no-store',
  };


  try {
    // Make the request with proper headers and options
    const response = await fetch(finalUrl, requestOptions);
    
    // If we get a 401, try to refresh the token or handle auth
    if (response.status === 401) {
      // You might want to implement token refresh logic here if needed
      console.warn('Authentication required, please log in again');
    }

    // Normalize 204
    if (response.status === 204) {
      return new Response(JSON.stringify({ status: "success" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    if (response.status === 200 && response.body === null) {
      return new Response(JSON.stringify({ status: "success" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (isJson) return response;

    const text = await response.text();

    if (response.ok && (!text || text.trim() === "")) {
      return new Response(JSON.stringify({ status: "success" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (contentType.includes("text/html")) {
      console.error("Non-JSON (HTML) response:", text.slice(0, 500));
      throw new Error(`Received HTML response. Check API endpoint (${finalUrl}).`);
    }

    if (response.ok) {
      return new Response(JSON.stringify({ status: "success" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("Non-JSON error response:", text.slice(0, 500));
    throw new Error(text || "Request failed");
  } catch (error) {
    console.error("API Request Failed:", {
      url: finalUrl,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};

export default apiFetch;