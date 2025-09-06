"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  InputAdornment,
  Avatar,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import { apiFetch } from "../../utils/apiFetch";

export default function LoginPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [year, setYear] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  // 🔥 Warm up the API connection on page load (cuts first-request latency)
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    
    apiFetch("/health", { signal: controller.signal })
      .catch(() => {
        if (!mounted) return;
        // Handle error if needed
      });
      
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const setAuthCookie = (isSuperAdmin: boolean, permissions: Record<string, boolean>) => {
    document.cookie = "admin-auth=true; path=/; max-age=86400";
    localStorage.setItem("admin-auth", "true");
    localStorage.setItem("admin-email", email.trim().toLowerCase());
    localStorage.setItem("is-super-admin", String(isSuperAdmin));
    localStorage.setItem("permissions", JSON.stringify(permissions));
  };

  // Small helper for soft timeouts (prevents “hanging” request on first call)
  const fetchWithTimeout = async (url: string, init: RequestInit, ms = 15000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
      return await apiFetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const cleanedEmail = email.trim().toLowerCase();
    if (!cleanedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetchWithTimeout(`/admin/sendotp`, {
        method: "POST",
        body: JSON.stringify({ email: cleanedEmail }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep(2);
      } else {
        setError(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError(
        "Network is slow or unreachable. Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const cleanedOtp = otp.trim();
    if (!cleanedOtp) {
      setError("Please enter the OTP.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetchWithTimeout(`/admin/verifyotp`, {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: cleanedOtp }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const { isSuperAdmin, permissions } = data.data;
        setAuthCookie(isSuperAdmin, permissions);

        // Store permissions in localStorage
        localStorage.setItem(
          "admin-permissions",
          JSON.stringify({
            ...permissions,
            name: data.data.name || "Admin User",
            email: email.trim().toLowerCase(),
          })
        );

        // Use replace to avoid back button returning to login
        router.replace("/dashboard");
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError("Network is slow or unreachable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        p: 2,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 450, mx: "auto" }}>
        <Card
          sx={{
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "#3498db",
                  mb: 2,
                  boxShadow: "0 4px 20px rgba(52,152,219,0.3)",
                }}
              >
                <PersonIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  color: "#2c3e50",
                  mb: 1,
                  textAlign: "center",
                }}
              >
                Admin Login
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#7f8c8d", textAlign: "center", fontSize: "16px" }}
              >
                Welcome back! Please sign in to your account.
              </Typography>
            </Box>

            {step === 1 && (
              <form onSubmit={handleSendOtp}>
                <TextField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  disabled={loading}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      "&:hover fieldset": { borderColor: "#3498db" },
                      "&.Mui-focused fieldset": { borderColor: "#3498db" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#3498db" },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: "#7f8c8d" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                {error && (
                  <Typography color="error" sx={{ mt: 1, mb: 1, textAlign: "center" }}>
                    {error}
                  </Typography>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 3,
                    mb: 2,
                    fontWeight: 600,
                    borderRadius: "8px",
                    py: 1.5,
                    fontSize: "16px",
                    bgcolor: "#3498db",
                    "&:hover": { bgcolor: "#2980b9" },
                  }}
                  disabled={loading}
                  endIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp}>
                <TextField
                  label="Email Address"
                  value={email}
                  fullWidth
                  margin="normal"
                  disabled
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      bgcolor: "#f8f9fa",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: "#7f8c8d" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="OTP Code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  disabled={loading}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      "&:hover fieldset": { borderColor: "#3498db" },
                      "&.Mui-focused fieldset": { borderColor: "#3498db" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#3498db" },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: "#7f8c8d" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                {error && (
                  <Typography color="error" sx={{ mt: 1, mb: 1, textAlign: "center" }}>
                    {error}
                  </Typography>
                )}
                <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                      fontWeight: 600,
                      borderRadius: "8px",
                      py: 1.5,
                      fontSize: "16px",
                      bgcolor: "#3498db",
                      "&:hover": { bgcolor: "#2980b9" },
                    }}
                    disabled={loading}
                    endIcon={loading && <CircularProgress size={20} color="inherit" />}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setStep(1)}
                    disabled={loading}
                    sx={{
                      fontWeight: 600,
                      borderRadius: "8px",
                      py: 1.5,
                      fontSize: "16px",
                      borderColor: "#bdc3c7",
                      color: "#7f8c8d",
                      "&:hover": { borderColor: "#95a5a6", bgcolor: "#f8f9fa" },
                    }}
                  >
                    Back
                  </Button>
                </Box>
              </form>
            )}

            <Box sx={{ mt: 4, textAlign: "center", pt: 2, borderTop: "1px solid #ecf0f1" }}>
              {year && (
                <Typography variant="body2" sx={{ color: "#7f8c8d", fontSize: "14px" }}>
                  © {year} Vivek Project Admin Panel
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}