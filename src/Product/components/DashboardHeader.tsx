import * as React from "react";
import { Box, Stack, Typography, ClickAwayListener } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import logoUrl from "../../assets/tff_logo.svg";

interface DashboardHeaderProps {
  username?: string;
  totalPosts?: number;
  analyzedDate?: string;
}

interface TiemposEstimadosMinimal {
  timestamp: string;
  num_tweets: number;
  tiempo_estimado_total: string;
}

const formatTimestamp = (isoString: string): string => {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";

  const datePart = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${datePart}`;
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  username,
  totalPosts = 0,
  analyzedDate = "--- -, ----",
}) => {
  const [open, setOpen] = React.useState(false);
  const [storedUsername, setStoredUsername] = React.useState<string>("");
  const [stats, setStats] = React.useState<TiemposEstimadosMinimal | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem("username");
    if (saved) setStoredUsername(saved);

    const fetchStats = async () => {
      try {
        const res = await fetch("/tiempos_estimados_minimal.json");
        if (!res.ok) return;

        const data: TiemposEstimadosMinimal = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Error loading tiempos_estimados_minimal.json", err);
      }
    };

    fetchStats();
  }, []);

  const finalUsername =
    username && username.trim() !== ""
      ? username.trim()
      : storedUsername || "Your";

  const isGeneric = finalUsername === "Your";

  const effectiveTotalPosts = stats?.num_tweets ?? totalPosts;
  const effectiveAnalyzedDate =
    (stats?.timestamp && formatTimestamp(stats.timestamp)) || analyzedDate;

  const toggleDropdown = () => setOpen((prev) => !prev);
  const closeDropdown = () => setOpen(false);

  return (
    <ClickAwayListener onClickAway={closeDropdown}>
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 4,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            onClick={toggleDropdown}
            sx={{ cursor: "pointer" }}
          >
            <Typography
              sx={{
                fontSize: 14,
                fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont",
              }}
              className="navbar-dashboard"
            >
              {isGeneric ? (
                "Your Dashboard"
              ) : (
                <>
                  <Box
                    component="span"
                    sx={{ fontWeight: 700 }}
                    className="navbar-username"
                  >
                    {finalUsername}
                  </Box>
                  &apos;s Dashboard
                </>
              )}
            </Typography>

            <KeyboardArrowDownIcon
              sx={{
                color: "#2E2E2E",
                transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: open ? "rotate(-180deg)" : "rotate(0deg)",
              }}
              fontSize="small"
            />
          </Stack>

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
                fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont",
                fontWeight: 600,
              }}
              className="product-logo-label"
            >
              AI Checker
            </Typography>
          </Stack>
        </Box>

        {open && (
          <Box
            sx={{
              position: "absolute",
              display: "inline-flex",
              top: "40px",
              left: 0,
              background: "#FFF",
              borderRadius: "16px",
              boxShadow: "0 0 4px 2px rgba(0, 0, 0, 0.25)",
              border: "0.5px solid #DADADA",
              px: 2.375,
              py: 2,
              zIndex: 20,
              fontFamily: "Inter",
            }}
          >
            <Stack spacing={0.5}>
              <Typography
                sx={{
                  fontSize: 14,
                  color: "#0F0F0F",
                  whiteSpace: "nowrap",
                }}
              >
                {effectiveTotalPosts} Posts analyzed as of {effectiveAnalyzedDate}
              </Typography>
            </Stack>
          </Box>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default DashboardHeader;