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
const ensureLeadingSlash = (s: string) => (s ? (s.startsWith("/") ? s.replace(/^\/+/, "/") : `/${s}`) : "/");

export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let raw = typeof input === "string" ? input : input.toString();

  if (!isAbsoluteUrl(raw) && !raw.startsWith("/")) raw = ensureLeadingSlash(raw);
  if (raw.startsWith("/")) {
    const base = getBaseUrl().replace(/\/+$/, "");
    raw = `${base}${raw}`;
  }

  const urlObj = new URL(raw, getBaseUrl());

  const method = (init?.method ?? "GET").toUpperCase();
  if (method === "GET") urlObj.searchParams.set("_ts", String(Date.now()));

  const finalUrl = urlObj.toString();

  const isFormData = init?.body instanceof FormData;
  const headers = new Headers(init?.headers);

  // Keep headers minimal to avoid unnecessary preflights
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (!headers.has("Content-Type") && !isFormData) headers.set("Content-Type", "application/json");

  // Auth / role headers (these will cause a preflight; make sure backend allows them)
  const isRoleApi = finalUrl.includes("/api/roles");
  if (isRoleApi && ROLE_MANAGEMENT_HEADER && ROLE_MANAGEMENT_VALUE) {
    headers.set(ROLE_MANAGEMENT_HEADER, ROLE_MANAGEMENT_VALUE);
  } else if (API_KEY_NAME && API_KEY_VALUE) {
    headers.set(API_KEY_NAME, API_KEY_VALUE);
  }

  // Let browser set multipart boundary
  if (isFormData && headers.has("Content-Type")) headers.delete("Content-Type");

  // IMPORTANT: do NOT set request 'Cache-Control'/'Pragma' — they cause CORS errors on many servers

  const updatedOptions: RequestInit = {
    mode: "cors",
    cache: "no-store",
    ...init,
    method,
    headers,
  };

  try {
    const response = await fetch(finalUrl, updatedOptions);

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