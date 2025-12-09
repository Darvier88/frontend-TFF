// src/Product/HappyPath/Connect.tsx (con traducciones)
import { Box, Button, Paper, Stack, Typography, CircularProgress } from "@mui/material";
import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

import logoUrl from "../../assets/tff_logo.svg";
import xLogo from "../../assets/x-logo.png";

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

export default function Connect() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectAccount = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`);
      
      if (!response.ok) {
        throw new Error("Error al iniciar el proceso de autenticación");
      }

      const data = await response.json();

      localStorage.setItem("temp_session_id", data.session_id);
      localStorage.setItem("oauth_state", data.state);

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
            justifyContent: "space-between",
            mb: 4,
          }}
        >
          {/* Botón de idioma a la izquierda */}
          <LanguageSwitcher />

          {/* Logo a la derecha */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              component="img"
              src={logoUrl}
              alt={t('header.logoAlt')}
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
                fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont",
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
              {t('connect.title')}
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
              {t('connect.subtitle')}
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
              {t('connect.security')}
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
                t('connect.button')
              )}
            </Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}