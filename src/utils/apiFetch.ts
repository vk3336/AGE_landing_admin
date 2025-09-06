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

// Endpoints to try as "simple requests" (no preflight) first.
const SIMPLE_ENDPOINTS: RegExp[] = [
  /^\/admin\/sendotp\b/i,
  /^\/admin\/verifyotp\b/i,
  /^\/auth\/login\b/i,
];

// Small helper: clone init with different headers/body
const withOverrides = (init: RequestInit | undefined, overrides: Partial<RequestInit>): RequestInit => {
  const merged: RequestInit = { ...(init || {}), ...overrides };
  // Merge headers nicely
  if (init?.headers || overrides.headers) {
    const h = new Headers(init?.headers as HeadersInit | undefined);
    const oh = new Headers(overrides.headers as HeadersInit | undefined);
    oh.forEach((v, k) => h.set(k, v));
    merged.headers = h;
  }
  return merged;
};

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

  // First attempt options (no request Cache-Control/Pragma)
  const opts1: RequestInit = {
    mode: "cors",
    cache: "no-store",
    ...init,
    method,
    headers: headers1,
  };

  // Helper to decide if we should retry as JSON
  const shouldRetryAsJson = (res: Response, textSnippet: string) => {
    if (!isSimpleEndpoint) return false;
    // Common cases when server expects JSON
    if (res.status === 415) return true; // Unsupported Media Type
    if (res.status === 400 && /json|body/i.test(textSnippet)) return true;
    return false;
  };

  try {
    // ---- First attempt (simple if login/otp)
    let response = await fetch(finalUrl, opts1);

    if (!response.ok) {
      // Try to read a short text to decide on fallback
      let snippet = "";
      try {
        const txt = await response.clone().text();
        snippet = txt.slice(0, 300);
      } catch {
        /* ignore */
      }

      // ---- Auto-fallback: retry ONCE with application/json if server rejected text/plain
      if (shouldRetryAsJson(response, snippet)) {
        const headers2 = new Headers(init?.headers);
        if (!headers2.has("Accept")) headers2.set("Accept", "application/json");
        if (!isFormData) headers2.set("Content-Type", "application/json");

        // Add auth headers like normal endpoints (this may cause preflight, but it's a one-time fallback)
        const isRoleApi = finalUrl.includes("/api/roles");
        if (isRoleApi && ROLE_MANAGEMENT_HEADER && ROLE_MANAGEMENT_VALUE) {
          headers2.set(ROLE_MANAGEMENT_HEADER, ROLE_MANAGEMENT_VALUE);
        } else if (API_KEY_NAME && API_KEY_VALUE) {
          headers2.set(API_KEY_NAME, API_KEY_VALUE);
        }
        if (isFormData && headers2.has("Content-Type")) headers2.delete("Content-Type");

        const opts2: RequestInit = {
          mode: "cors",
          cache: "no-store",
          ...withOverrides(init, { headers: headers2, method }),
        };

        response = await fetch(finalUrl, opts2);
      }
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