import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import logoUrl from "../../assets/tff_logo.svg";

export default function AccountPrivate() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    sessionStorage.clear();
    navigate("/connect");
  };

  const username = sessionStorage.getItem("username") || "@username";

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "#FAFAFA",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 650,
          mx: "auto",
        }}
      >
        {/* Header con logo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 4,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              component="img"
              src={logoUrl}
              alt="AI Checker logo"
              sx={{
                width: 20,
                height: 30,
                display: "block",
                objectFit: "contain",
              }}
            />
            <Typography
              sx={{
                fontSize: 18,
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                color: "#0F172A",
              }}
            >
              AI Checker
            </Typography>
          </Stack>
        </Box>

        {/* Card principal */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
          }}
        >
          {/* Hero section con gradiente */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              px: 5,
              py: 6,
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decoración de fondo */}
            <Box
              sx={{
                position: "absolute",
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.1)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -30,
                left: -30,
                width: 150,
                height: 150,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.1)",
              }}
            />

            {/* Icono principal */}
            <Box
              sx={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.95)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mx: "auto",
                mb: 3,
                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                position: "relative",
                zIndex: 1,
              }}
            >
              <LockIcon sx={{ fontSize: 45, color: "#667eea" }} />
            </Box>

            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 700,
                color: "white",
                mb: 2,
                fontFamily: "Inter, sans-serif",
                position: "relative",
                zIndex: 1,
              }}
            >
              Private Account Detected
            </Typography>

            <Typography
              sx={{
                fontSize: 16,
                color: "rgba(255,255,255,0.95)",
                fontFamily: "Inter, sans-serif",
                maxWidth: 450,
                mx: "auto",
                position: "relative",
                zIndex: 1,
              }}
            >
              We can't analyze {username} because it's set to private
            </Typography>
          </Box>

          {/* Contenido principal */}
          <Box sx={{ px: 5, py: 5, bgcolor: "white" }}>
            {/* Por qué importa */}
            <Box sx={{ mb: 4 }}>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  mb: 3,
                  fontFamily: "Inter, sans-serif",
                  color: "#0F172A",
                }}
              >
                🔒 Why This Matters
              </Typography>

              <Stack spacing={2.5}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box
                    sx={{
                      width: 6,
                      bgcolor: "#EF4444",
                      borderRadius: 1,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 15,
                      color: "#475569",
                      fontFamily: "Inter, sans-serif",
                      lineHeight: 1.7,
                    }}
                  >
                    <strong>Private accounts restrict API access</strong> to your tweets, 
                    making it impossible for our tool to retrieve your content
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box
                    sx={{
                      width: 6,
                      bgcolor: "#F59E0B",
                      borderRadius: 1,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 15,
                      color: "#475569",
                      fontFamily: "Inter, sans-serif",
                      lineHeight: 1.7,
                    }}
                  >
                    Even with your authorization, <strong>Twitter/X's privacy settings</strong> prevent 
                    third-party apps from accessing protected tweets
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box
                    sx={{
                      width: 6,
                      bgcolor: "#10B981",
                      borderRadius: 1,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 15,
                      color: "#475569",
                      fontFamily: "Inter, sans-serif",
                      lineHeight: 1.7,
                    }}
                  >
                    You can <strong>temporarily make your account public</strong>, run the analysis, 
                    then switch it back to private
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Divider */}
            <Box sx={{ height: 1, bgcolor: "#E5E7EB", my: 4 }} />

            {/* Instrucciones paso a paso */}
            <Box sx={{ mb: 4 }}>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  mb: 3,
                  fontFamily: "Inter, sans-serif",
                  color: "#0F172A",
                }}
              >
                📋 How to Make Your Account Public
              </Typography>

              <Stack spacing={2.5}>
                {[
                  { num: "1", text: "Go to Twitter/X Settings", bold: "Settings" },
                  { num: "2", text: "Navigate to Privacy and Safety", bold: "Privacy and Safety" },
                  { num: "3", text: 'Uncheck "Protect your posts"', bold: '"Protect your posts"' },
                  { num: "4", text: "Come back and reconnect your account", bold: "reconnect" },
                ].map((step) => (
                  <Box
                    key={step.num}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        bgcolor: "#EEF2FF",
                        color: "#667eea",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 14,
                        fontFamily: "Inter, sans-serif",
                        flexShrink: 0,
                      }}
                    >
                      {step.num}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 15,
                        color: "#475569",
                        fontFamily: "Inter, sans-serif",
                        lineHeight: 1.7,
                        pt: 0.5,
                      }}
                    >
                      {step.text.split(step.bold)[0]}
                      <strong>{step.bold}</strong>
                      {step.text.split(step.bold)[1]}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              {/* Nota informativa */}
              <Box
                sx={{
                  mt: 3,
                  bgcolor: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                  borderRadius: 2,
                  p: 2.5,
                  display: "flex",
                  gap: 2,
                }}
              >
                <CheckCircleOutlineIcon sx={{ color: "#16A34A", fontSize: 24 }} />
                <Typography
                  sx={{
                    fontSize: 14,
                    color: "#166534",
                    fontFamily: "Inter, sans-serif",
                    lineHeight: 1.6,
                  }}
                >
                  <strong>Privacy Tip:</strong> You can make your account private again 
                  immediately after the analysis is complete. Your data stays secure with us.
                </Typography>
              </Box>
            </Box>

            {/* Botón de acción */}
            <Button
              variant="contained"
              fullWidth
              onClick={handleGoBack}
              startIcon={<ArrowBackIcon />}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                fontSize: 16,
                py: 1.75,
                fontFamily: "Inter, sans-serif",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5568d3 0%, #6941a0 100%)",
                  boxShadow: "0 6px 16px rgba(102, 126, 234, 0.5)",
                },
              }}
            >
              Go Back to Connect
            </Button>

            <Typography
              sx={{
                fontSize: 13,
                color: "#94A3B8",
                textAlign: "center",
                mt: 2.5,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Need help? Contact us at support@aichecker.com
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}