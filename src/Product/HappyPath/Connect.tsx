import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import logoUrl from "../../assets/tff_logo.svg";
import xLogo from "../../assets/x-logo.png";

export default function Connect() {
  const navigate = useNavigate();
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

            <Button
              variant="contained"
              fullWidth
              onClick={() => {localStorage.setItem("username", "@TheDarkraimola"); navigate("/analyzing")}}
              sx={{
                backgroundColor: "#000",
                color: "#fff",
                borderRadius: 2,
                height: 48,
                textTransform: "none",
                fontWeight: 700,
                fontFamily: "Inter, sans-serif",
                "&:hover": { backgroundColor: "#111" },
                width: "150px",
                maxHeight: "44px",
              }}
              className="button-text button-box connect-button"
            >
              Connect Account
            </Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
