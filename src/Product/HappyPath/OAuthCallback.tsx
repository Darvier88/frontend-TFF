// src/Product/HappyPath/OAuthCallback.tsx (traducido)
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useLanguage } from "../../contexts/LanguageContext";

const getApiUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const apiOverride = urlParams.get('api');
  
  if (apiOverride === 'local') {
    console.log('🔧 [Override] Using local backend');
    return 'http://localhost:8080';
  }
  
  if (apiOverride === 'prod') {
    console.log('🔧 [Override] Using production backend');
    return 'https://x-gpt-jet.vercel.app';
  }
  
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    console.log('🌐 [Config] Using VITE_API_URL:', envUrl);
    return envUrl.replace(/\/$/, '');
  }
  
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
  
  const defaultUrl = isLocalhost 
    ? 'http://localhost:8080' 
    : 'https://x-gpt-jet.vercel.app';
  
  console.log('🌐 [Auto-detect] API URL:', defaultUrl);
  return defaultUrl;
};

const API_BASE_URL = getApiUrl();

export default function OAuthCallback() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const processCallback = async () => {
      try {
        const sessionId = searchParams.get("session_id");
        const username = searchParams.get("username");
        const error = searchParams.get("error");

        if (error) {
          setStatus("error");
          setErrorMessage(`${t('oauth.error')}: ${error}`);
          setTimeout(() => navigate("/connect"), 3000);
          return;
        }

        if (!sessionId) {
          setStatus("error");
          setErrorMessage("No se recibió el session ID");
          setTimeout(() => navigate("/connect"), 3000);
          return;
        }

        sessionStorage.setItem("session_id", sessionId);
        if (username) {
          sessionStorage.setItem("username", `@${username}`);
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/me?session_id=${sessionId}`);
          
          if (response.ok) {
            const data = await response.json();
            
            console.log("📊 User data received:", data.user);
            
            if (data.user) {
              sessionStorage.setItem("user_id", data.user.id || "");
              sessionStorage.setItem("user_name", data.user.name || "");
              sessionStorage.setItem("tweet_count", (data.user.tweet_count || 0).toString());
              sessionStorage.setItem("followers_count", (data.user.followers_count || 0).toString());
              
              const isProtected = data.user.protected || false;
              sessionStorage.setItem("is_protected", isProtected.toString());
              
              console.log(`🔒 Account protected status: ${isProtected}`);
              
              if (isProtected) {
                console.log("⚠️ Private account detected, redirecting to warning page");
                setStatus("success");
                setTimeout(() => {
                  navigate("/account-private");
                }, 1000);
                return;
              }
            }
          }
        } catch (err) {
          console.error("Error obteniendo datos del usuario:", err);
        }

        sessionStorage.removeItem("temp_session_id");
        sessionStorage.removeItem("oauth_state");

        setStatus("success");

        setTimeout(() => {
          navigate("/analyzing");
        }, 1000);

      } catch (err) {
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Error desconocido");
        setTimeout(() => navigate("/connect"), 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate, t]);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "#EEE",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
      }}
    >
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 3,
          boxShadow: "0 0 0 1px rgba(15,23,42,0.06)",
          p: 6,
          textAlign: "center",
          minWidth: 300,
        }}
      >
        {status === "processing" && (
          <>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" sx={{ fontFamily: "Inter, sans-serif", mb: 1 }}>
              {t('oauth.processing')}
            </Typography>
            <Typography sx={{ fontSize: 14, color: "text.secondary", fontFamily: "Inter, sans-serif" }}>
              {t('oauth.wait')}
            </Typography>
          </>
        )}

        {status === "success" && (
          <>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                bgcolor: "#4caf50",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <Typography sx={{ fontSize: 40, color: "white" }}>✓</Typography>
            </Box>
            <Typography variant="h6" sx={{ fontFamily: "Inter, sans-serif", mb: 1 }}>
              {t('oauth.success')}
            </Typography>
            <Typography sx={{ fontSize: 14, color: "text.secondary", fontFamily: "Inter, sans-serif" }}>
              {t('oauth.redirecting')}
            </Typography>
          </>
        )}

        {status === "error" && (
          <>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                bgcolor: "#f44336",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <Typography sx={{ fontSize: 40, color: "white" }}>✕</Typography>
            </Box>
            <Typography variant="h6" sx={{ fontFamily: "Inter, sans-serif", mb: 1 }}>
              {t('oauth.error')}
            </Typography>
            <Typography sx={{ fontSize: 14, color: "text.secondary", fontFamily: "Inter, sans-serif" }}>
              {errorMessage}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary", fontFamily: "Inter, sans-serif", mt: 2 }}>
              {t('oauth.redirectingHome')}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}