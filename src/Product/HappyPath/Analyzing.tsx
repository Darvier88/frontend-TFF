import * as React from "react";
import { Box, Paper, Stack, Typography, CircularProgress } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import logoUrl from "../../assets/tff_logo.svg";

interface AnalyzingProps {
  username?: string;
  totalPosts?: number;
  etaHours?: number;
}

const stepDurations = [100, 2000, 1000];

const API_BASE_URL = "http://localhost:8080";

const formatDuration = (hhmmss: string) => {
  // Limpiar el símbolo ≈ si existe
  const cleaned = hhmmss.replace(/≈/g, "").trim();
  
  const [hStr, mStr, sStr] = cleaned.split(":");
  const h = Number(hStr || 0);
  const m = Number(mStr || 0);
  const s = Number(sStr || 0);

  const parts: string[] = [];
  if (h) parts.push(`${h} hour${h > 1 ? 's' : ''}`);
  if (m) parts.push(`${parts.length ? ', ' : ''}${m} minute${m > 1 ? 's' : ''}`);
  if (s) parts.push(`${parts.length ? ' and ' : ''}${s} second${s > 1 ? 's' : ''}`);

  return parts.length ? parts.join("") : hhmmss;
};

const Analyzing: React.FC<AnalyzingProps> = ({
  username, // ✅ REMOVIDO el valor por defecto
  totalPosts = 100,
  etaHours = 1,
}) => {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(0);

  const [resolvedTotalPosts, setResolvedTotalPosts] =
    React.useState(totalPosts);
  const [etaLabel, setEtaLabel] = React.useState<string>(`${etaHours} hours`);
  
  // ✅ SOLUCIÓN: Inicializar con función que lee de localStorage INMEDIATAMENTE
  const [resolvedUsername, setResolvedUsername] = React.useState(() => {
    try {
      const saved = localStorage.getItem("username");
      if (saved) {
        const clean = saved.startsWith("@") ? saved.slice(1) : saved;
        console.log("✅ [Init] Resolved username from localStorage:", clean);
        return clean;
      }
      // Si no hay en localStorage, usar la prop
      if (username) {
        const clean = username.startsWith("@") ? username.slice(1) : username;
        console.log("ℹ️ [Init] Using username from prop:", clean);
        return clean;
      }
      console.warn("⚠️ [Init] No username found, using fallback");
      return "username";
    } catch (err) {
      console.error("❌ [Init] Error reading username:", err);
      return "username";
    }
  });
  
  const [isCalculating, setIsCalculating] = React.useState(true);

  // ✅ Este useEffect ya no es necesario, pero lo dejamos por si acaso
  // localStorage cambia durante la sesión
  React.useEffect(() => {
    console.log("🔍 [useEffect] Checking username in localStorage...");
    try {
      const saved = localStorage.getItem("username");
      if (saved) {
        const clean = saved.startsWith("@") ? saved.slice(1) : saved;
        // Solo actualizar si es diferente
        if (clean !== resolvedUsername) {
          console.log("🔄 [useEffect] Updating username to:", clean);
          setResolvedUsername(clean);
        }
      }
    } catch (err) {
      console.error("❌ [useEffect] Error reading username from localStorage", err);
    }
  }, []); // ✅ Array vacío = solo se ejecuta una vez

  // Obtener tiempo estimado desde la API y ejecutar búsqueda + análisis
  React.useEffect(() => {
    const fetchTiempoEstimado = async () => {
      try {
        setIsCalculating(true);
        
        // Obtener datos de localStorage
        const sessionId = localStorage.getItem("session_id");
        const tweetCount = localStorage.getItem("tweet_count");

        // Si hay tweet_count en localStorage, usarlo como fallback
        if (tweetCount) {
          const count = Number(tweetCount);
          if (!isNaN(count)) {
            setResolvedTotalPosts(count);
          }
        }

        // Si no hay session_id, no podemos llamar a la API
        if (!sessionId) {
          console.warn("No session_id found in localStorage");
          setIsCalculating(false);
          return;
        }

        // Llamar a la API para obtener tiempo estimado
        const res = await fetch(
          `${API_BASE_URL}/api/estimate/time?session_id=${sessionId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          console.error("Error fetching estimated time:", res.status);
          setIsCalculating(false);
          return;
        }

        const data = await res.json();

        // Actualizar tiempo estimado si está disponible
        if (data?.tiempo_estimado_total) {
          const formatted = formatDuration(data.tiempo_estimado_total);
          setEtaLabel(formatted);
        }
      } catch (err) {
        console.error("Error fetching estimated time from API:", err);
      } finally {
        setIsCalculating(false);
      }
    };

    const executeSearchAndAnalysis = async () => {
      const sessionId = localStorage.getItem("session_id");
      const username = localStorage.getItem("username");

      if (!sessionId) {
        console.error("❌ No session_id found, skipping search and analysis");
        return;
      }

      console.log("🚀 Starting automated search and analysis...");

      // PASO 1: Búsqueda de tweets
      try {
        console.log("📡 [1/2] Fetching tweets...");
        
        const searchRes = await fetch(
          `${API_BASE_URL}/api/tweets/search?session_id=${sessionId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              max_tweets: 20,
              save_to_file: false
            }),
          }
        );

        if (!searchRes.ok) {
          console.error("❌ Error fetching tweets:", searchRes.status);
          return;
        }

        const searchData = await searchRes.json();
        console.log("✅ Tweets fetched successfully:", {
          total: searchData.tweets?.length || 0,
          username: searchData.username,
          execution_time: searchData.execution_time
        });

        // Guardar resultados de búsqueda en localStorage
        localStorage.setItem("search_results", JSON.stringify(searchData));
        console.log("💾 Search results saved to localStorage");

        // PASO 2: Clasificación de riesgos
        if (searchData.tweets && searchData.tweets.length > 0) {
          console.log("🔍 [2/2] Classifying risk...");

          const classifyRes = await fetch(
            `${API_BASE_URL}/api/risk/classify?session_id=${sessionId}&save_files=false`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                tweets: searchData.tweets.map((t: any) => t.text),
                max_tweets: 20
              }),
            }
          );

          if (!classifyRes.ok) {
            console.error("❌ Error classifying risk:", classifyRes.status);
            return;
          }

          const riskData = await classifyRes.json();
          console.log("✅ Risk classification completed:", {
            total_analyzed: riskData.total_tweets,
            distribution: riskData.summary?.risk_distribution,
            execution_time: riskData.execution_time
          });

          // Separar y guardar los dos JSONs en localStorage
          const riskSummary = {
            timestamp: new Date().toISOString(),
            username: username?.replace('@', '') || 'unknown',
            total_tweets: riskData.total_tweets,
            summary: riskData.summary,
            execution_time: riskData.execution_time
          };

          const riskDetailed = {
            results: riskData.results
          };

          localStorage.setItem("risk_summary", JSON.stringify(riskSummary));
          localStorage.setItem("risk_detailed", JSON.stringify(riskDetailed));
          
          console.log("💾 Risk summary saved to localStorage (key: risk_summary)");
          console.log("💾 Risk detailed saved to localStorage (key: risk_detailed)");
          console.log("🎉 All processes completed successfully!");
          
          // Redirigir al dashboard después de 1.5 segundos
          console.log("🔄 Redirecting to dashboard in 1.5 seconds...");
          setTimeout(() => {
            navigate("/dashboard");
          }, 1500);

        } else {
          console.warn("⚠️ No tweets found to classify");
        }

      } catch (err) {
        console.error("❌ Error during search and analysis:", err);
      }
    };

    // Ejecutar en secuencia
    const runAll = async () => {
      await fetchTiempoEstimado();
      // Ejecutar búsqueda y análisis después del tiempo estimado
      await executeSearchAndAnalysis();
    };

    runAll();
  }, [navigate]);

  React.useEffect(() => {
    if (step >= 3) return;

    const timeout = setTimeout(() => {
      setStep((prev) => Math.min(prev + 1, 3));
    }, stepDurations[step]);

    return () => clearTimeout(timeout);
  }, [step]);

  const renderContent = () => {
    if (step === 1) {
      return (
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont",
          }}
          className="loader-text"
        >
          Let&apos;s get started
        </Typography>
      );
    }

    if (step === 3) {
      return (
        <Stack spacing={4} alignItems="center" textAlign="center">
          <Stack spacing={1}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                fontFamily:
                  "Inter, system-ui, -apple-system, BlinkMacSystemFont",
              }}
              className="analyze-placeholder"
            >
              Analyzing your posts
            </Typography>

            <Typography
              sx={{
                fontSize: 16,
                color: "#4A5565",
                fontFamily:
                  "Inter, system-ui, -apple-system, BlinkMacSystemFont",
              }}
              className="analyze-subtext"
            >
              You got{" "}
              <Box component="span" sx={{ fontWeight: 600 }}>
                {resolvedTotalPosts.toLocaleString()} posts
              </Box>
              . Estimated analysis time:{" "}
              {isCalculating ? (
                <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                  <CircularProgress size={14} sx={{ color: "#4A5565" }} />
                  <Box component="span" sx={{ fontStyle: "italic" }}>
                    calculating...
                  </Box>
                </Box>
              ) : (
                <Box component="span" sx={{ fontWeight: 600 }}>
                  {etaLabel}
                </Box>
              )}
              .
            </Typography>

            <Typography
              sx={{
                fontSize: 14,
                color: "#4A5565",
                fontFamily:
                  "Inter, system-ui, -apple-system, BlinkMacSystemFont",
              }}
              className="analyze-subtext"
            >
              Your dashboard will open automatically when ready 🚀
            </Typography>
          </Stack>

          <div className="analyze-video-container">
            <video
              className="analyze-video"
              src="/videos/moving-cards.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </Stack>
      );
    }
    return null;
  };
  
  // Debug log
  console.log("📍 [Render] Current resolvedUsername:", resolvedUsername);
  
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F1F1F1",
        display: "flex",
        justifyContent: "center",
        alignItems: "stretch",
        p: { xs: 1.5, md: 3 },
        height: "730px",
      }}
      className="product-back-layout"
    >
      <Paper
        elevation={0}
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
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 4,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              sx={{
                fontSize: 14,
                fontFamily:
                  "Inter, system-ui, -apple-system, BlinkMacSystemFont",
              }}
              className="navbar-dashboard"
            >
              <Box
                component="span"
                sx={{ fontWeight: 700 }}
                className="navbar-username"
              >
                @{resolvedUsername}
              </Box>
              &apos;s Dashboard
            </Typography>
            <KeyboardArrowDownIcon
              sx={{ color: "#0F0F0F" }}
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

        {/* Body */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                duration: step === 2 ? 0.3 : 0.4,
                type: step === 2 ? "tween" : "spring",
                stiffness: 100,
                damping: 15,
              }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Paper>
    </Box>
  );
};

export default Analyzing;