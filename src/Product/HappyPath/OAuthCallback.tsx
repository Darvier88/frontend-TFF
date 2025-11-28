import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";

const getApiUrl = () => {
  // 1. Permitir override con query parameter ?api=local
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
  
  // 2. Variable de entorno
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    console.log('🌐 [Config] Using VITE_API_URL:', envUrl);
    return envUrl.replace(/\/$/, '');
  }
  
  // 3. Auto-detect
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Obtener parámetros de la URL
        const sessionId = searchParams.get("session_id");
        const username = searchParams.get("username");
        const error = searchParams.get("error");

        // Si hay error
        if (error) {
          setStatus("error");
          setErrorMessage(`Error de autenticación: ${error}`);
          setTimeout(() => navigate("/connect"), 3000);
          return;
        }

        // Si no hay session_id
        if (!sessionId) {
          setStatus("error");
          setErrorMessage("No se recibió el session ID");
          setTimeout(() => navigate("/connect"), 3000);
          return;
        }

        // ✅ Guardar en sessionStorage (no localStorage)
        sessionStorage.setItem("session_id", sessionId);
        if (username) {
          sessionStorage.setItem("username", `@${username}`);
        }

        // Obtener datos completos del usuario desde el backend
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/me?session_id=${sessionId}`);
          
          if (response.ok) {
            const data = await response.json();
            
            // Guardar tweet_count en sessionStorage
            if (data.user && data.user.tweet_count !== undefined) {
              sessionStorage.setItem("tweet_count", data.user.tweet_count.toString());
            }
            
            // Opcional: guardar otros datos si los necesitas
            if (data.user) {
              sessionStorage.setItem("user_id", data.user.id || "");
              sessionStorage.setItem("user_name", data.user.name || "");
              sessionStorage.setItem("followers_count", (data.user.followers_count || 0).toString());
            }
          }
        } catch (err) {
          console.error("Error obteniendo datos del usuario:", err);
          // No falla el flujo si no se pueden obtener los datos adicionales
        }

        // ✅ Limpiar datos temporales de sessionStorage
        sessionStorage.removeItem("temp_session_id");
        sessionStorage.removeItem("oauth_state");

        setStatus("success");

        // Redirigir a analyzing después de 1 segundo
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
  }, [searchParams, navigate]);

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
              Procesando autenticación...
            </Typography>
            <Typography sx={{ fontSize: 14, color: "text.secondary", fontFamily: "Inter, sans-serif" }}>
              Por favor espera un momento
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
              ¡Autenticación exitosa!
            </Typography>
            <Typography sx={{ fontSize: 14, color: "text.secondary", fontFamily: "Inter, sans-serif" }}>
              Redirigiendo...
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
              Error de autenticación
            </Typography>
            <Typography sx={{ fontSize: 14, color: "text.secondary", fontFamily: "Inter, sans-serif" }}>
              {errorMessage}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary", fontFamily: "Inter, sans-serif", mt: 2 }}>
              Redirigiendo al inicio...
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}