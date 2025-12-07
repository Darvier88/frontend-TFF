import { Box, Button, Paper, Stack, Typography, CircularProgress } from "@mui/material";
import { useState } from "react";

import logoUrl from "../../assets/tff_logo.svg";
import xLogo from "../../assets/x-logo.png";

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

export default function Connect() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectAccount = async () => {
    try {
      setLoading(true);
      setError(null);

      // Llamar al endpoint de login
      const response = await fetch(`${API_BASE_URL}/api/auth/login`);
      
      if (!response.ok) {
        throw new Error("Error al iniciar el proceso de autenticación");
      }

      const data = await response.json();

      // Guardar el session_id en localStorage temporalmente (opcional, por si lo necesitas después)
      localStorage.setItem("temp_session_id", data.session_id);
      localStorage.setItem("oauth_state", data.state);

      // Redirigir al usuario a Twitter para autorizar
      window.location.href = data.authorization_url;

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  };

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
        height:"730px"
      }}
      className="product-back-layout"
    >
      <Box
        sx={{
          flex: 1,
          mx: "auto",
          px: { xs: 2.5, md: 2 },
          py: { xs: 2, md: 2 },
          width: "100%",
          height: "100%",
          bgcolor: "white",
          borderRadius: 3,
          boxShadow: "0 0 0 1px rgba(15,23,42,0.06)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "right",
            mb: 4,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              component="img"
              src={logoUrl}
              alt="AI Checker logo"
              sx={{
                width: 16.5,
                height: 25.5,
                display: "block",
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontSize: 14,
                fontFamily:
                  "Inter, system-ui, -apple-system, BlinkMacSystemFont",
                fontWeight: 600,
              }}
              className="product-logo-label"
            >
              AI Checker
            </Typography>
          </Stack>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            px: 2,
          }}
        >
          <Paper
            sx={{
              width: 372,
              borderRadius: 4,
              px: 3,
              py: 10.375,
              textAlign: "center",
              bgcolor: "#fff",
            }}
            className="inner-container"
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: "#000",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mx: "auto",
                mb: 2.25,
              }}
            >
              <img
                src={xLogo}
                alt="logo"
                style={{ width: 28, height: 25 }}
              />
            </Box>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2.25,
                fontFamily: "Inter, sans-serif",
              }}
              className="connect-title"
            >
              Connect Your Account
            </Typography>

            <Typography
              sx={{
                fontSize: 14,
                color: "text.secondary",
                maxWidth: 280,
                mx: "auto",
                mb: 4,
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.5,
              }}
              className="connect-subtitle"
            >
              Analyze your Twitter/X history to identify and manage potentially
              problematic content
            </Typography>

            <Typography
              sx={{
                fontSize: 13,
                color: "text.secondary",
                mb: 2,
                fontFamily: "Inter, sans-serif",
              }}
              className="connect-subtitle"
            >
              Secure • Private • Read-only access
            </Typography>

            {error && (
              <Typography
                sx={{
                  fontSize: 13,
                  color: "error.main",
                  mb: 2,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {error}
              </Typography>
            )}

            <Button
              variant="contained"
              fullWidth
              onClick={handleConnectAccount}
              disabled={loading}
              sx={{
                backgroundColor: "#000",
                color: "#fff",
                borderRadius: 2,
                height: 48,
                textTransform: "none",
                fontWeight: 700,
                fontFamily: "Inter, sans-serif",
                "&:hover": { backgroundColor: "#111" },
                "&:disabled": { backgroundColor: "#999" },
                width: "150px",
                maxHeight: "44px",
              }}
              className="button-text button-box connect-button"
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Connect Account"
              )}
            </Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

