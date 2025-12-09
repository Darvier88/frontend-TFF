import * as React from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  Button,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";
import { useLanguage } from "../../contexts/LanguageContext";
import logoUrl from "../../assets/tff_logo.svg";

interface AnalyzingProps {
  username?: string;
  totalPosts?: number;
  etaHours?: number;
}

const getApiUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const apiOverride = urlParams.get("api");

  if (apiOverride === "local") {
    console.log("🔧 [Override] Using local backend");
    return "http://localhost:8080";
  }

  if (apiOverride === "prod") {
    console.log("🔧 [Override] Using production backend");
    return "https://x-gpt-jet.vercel.app";
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    console.log("🌐 [Config] Using VITE_API_URL:", envUrl);
    return envUrl.replace(/\/$/, "");
  }

  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const defaultUrl = isLocalhost
    ? "http://localhost:8080"
    : "https://x-gpt-jet.vercel.app";

  console.log("🌐 [Auto-detect] API URL:", defaultUrl);
  return defaultUrl;
};

const API_BASE_URL = getApiUrl();
console.log("🌐 [Config] API_BASE_URL set to:", API_BASE_URL);

const formatDuration = (hhmmss: string) => {
  const cleaned = hhmmss.replace(/≈/g, "").trim();

  const [hStr, mStr, sStr] = cleaned.split(":");
  const h = Number(hStr || 0);
  const m = Number(mStr || 0);
  const s = Number(sStr || 0);

  const parts: string[] = [];
  if (h) parts.push(`${h} hour${h > 1 ? "s" : ""}`);
  if (m) parts.push(`${parts.length ? ", " : ""}${m} minute${m > 1 ? "s" : ""}`);
  if (s) parts.push(`${parts.length ? " and " : ""}${s} second${s > 1 ? "s" : ""}`);

  return parts.length ? parts.join("") : hhmmss;
};

const Analyzing: React.FC<AnalyzingProps> = ({
  username,
  totalPosts = 100,
  etaHours = 1,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [step] = React.useState(3);

  const [resolvedTotalPosts, setResolvedTotalPosts] =
    React.useState(totalPosts);
  const [etaLabel, setEtaLabel] = React.useState<string>(`${etaHours} hours`);

  const [resolvedUsername] = React.useState(() => {
    try {
      const saved = sessionStorage.getItem("username");
      if (saved) {
        const clean = saved.startsWith("@") ? saved.slice(1) : saved;
        console.log("✅ [Init] Resolved username from sessionStorage:", clean);
        return clean;
      }
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

  const [searchJobId, setSearchJobId] = React.useState<string | null>(null);
  const [, setSearchStatus] = React.useState<string>("pending");
  const [, setCurrentPhase] =
    React.useState<string>("initializing");
  const [, setProgressPercent] = React.useState(0);
  const [, setTweetsProcessed] = React.useState(0);
  const [, setRateLimitResetTime] = React.useState<string | null>(null);
  const [, setCurrentPage] = React.useState(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fetchedTweets, setFetchedTweets] = React.useState<any[]>([]);

  const hasStartedSearchRef = React.useRef(false);
  const hasStartedClassificationRef = React.useRef(false);

  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [confirmEmail, setConfirmEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState<string | null>(null);

  const handleOpenEmailModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEmailModalOpen(true);
    setEmailError(null);
  };

  const handleCloseEmailModal = () => {
    setIsEmailModalOpen(false);
    setEmail("");
    setConfirmEmail("");
    setEmailError(null);
  };

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !confirmEmail) {
      setEmailError("Please fill in both fields.");
      return;
    }
    if (email !== confirmEmail) {
      setEmailError("Emails do not match.");
      return;
    }

    console.log("✅ New notification email:", email);

    handleCloseEmailModal();
  };

  React.useEffect(() => {
    if (hasStartedSearchRef.current) return;
    hasStartedSearchRef.current = true;

    const fetchTiempoEstimado = async () => {
      try {
        setIsCalculating(true);

        const sessionId = sessionStorage.getItem("session_id");
        const tweetCount = sessionStorage.getItem("tweet_count");

        if (tweetCount) {
          const count = Number(tweetCount);
          if (!isNaN(count)) {
            setResolvedTotalPosts(count);
          }
        }

        if (!sessionId) {
          console.warn("No session_id found in sessionStorage");
          setIsCalculating(false);
          return;
        }

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
      const sessionId = sessionStorage.getItem("session_id");

      if (!sessionId) {
        console.error("❌ No session_id found, skipping search and analysis");
        return;
      }

      console.log("🚀 Starting automated search and analysis...");

      try {
        console.log("📡 [1/2] Starting tweet search job...");
        setCurrentPhase("searching");

        const searchRes = await fetch(
          `${API_BASE_URL}/api/tweets/search?session_id=${sessionId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              max_tweets: 20,
              save_to_firebase: true,
            }),
          }
        );

        if (!searchRes.ok) {
          console.error("❌ Error starting tweet search:", searchRes.status);
          return;
        }

        const searchData = await searchRes.json();

        if (searchData.job_id) {
          console.log("✅ Search job started:", searchData.job_id);
          setSearchJobId(searchData.job_id);
        } else {
          console.error("❌ No job_id received from search endpoint");
        }
      } catch (err) {
        console.error("❌ Error during search initialization:", err);
      }
    };

    const runAll = async () => {
      await fetchTiempoEstimado();
      await executeSearchAndAnalysis();
    };

    runAll();
  }, []);

  React.useEffect(() => {
    if (!searchJobId) return;

    const pollInterval = setInterval(async () => {
      try {
        console.log(`🔄 Polling job ${searchJobId}...`);

        const res = await fetch(
          `${API_BASE_URL}/api/jobs/${searchJobId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          console.error("❌ Error polling job status:", res.status);
          return;
        }

        const jobData = await res.json();
        console.log("📊 Job status:", jobData);

        setSearchStatus(jobData.status);

        if (jobData.total_tweets > 0) {
          setTweetsProcessed(jobData.total_tweets);

          const estimatedTotal = resolvedTotalPosts || 1000;
          const calculatedPercent = Math.min(
            Math.round((jobData.total_tweets / estimatedTotal) * 100),
            99
          );
          setProgressPercent(calculatedPercent);
        }

        if (jobData.current_page !== undefined) {
          setCurrentPage(jobData.current_page);
        }

        if (jobData.message) {
          if (jobData.message.includes("Guardando")) {
            setCurrentPhase("saving");
          } else if (jobData.message.includes("Obteniendo")) {
            setCurrentPhase("searching");
          } else if (jobData.message.includes("completada")) {
            setCurrentPhase("completed");
          }
        }

        if (jobData.status === "waiting_rate_limit") {
          if (jobData.wait_until) {
            const resetTime = new Date(jobData.wait_until).toLocaleTimeString();
            setRateLimitResetTime(resetTime);
          }
        } else {
          setRateLimitResetTime(null);
        }

        if (jobData.status === "completed") {
          console.log("✅ Search job completed!");
          setProgressPercent(100);
          clearInterval(pollInterval);

          if (jobData.result?.firebase_doc_id) {
            sessionStorage.setItem(
              "tweets_firebase_id",
              jobData.result.firebase_doc_id
            );
            console.log(
              "💾 Tweets Firebase Doc ID saved:",
              jobData.result.firebase_doc_id
            );
          }

          if (jobData.result?.tweets) {
            setFetchedTweets(jobData.result.tweets);
            console.log(
              `📦 Stored ${jobData.result.tweets.length} tweets for classification`
            );
          }
        }

        if (jobData.status === "error") {
          console.error("❌ Search job failed:", jobData.error);
          setCurrentPhase("error");
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error("❌ Error during polling:", err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [searchJobId, resolvedTotalPosts]);

  React.useEffect(() => {
    if (fetchedTweets.length === 0 || hasStartedClassificationRef.current)
      return;
    hasStartedClassificationRef.current = true;

    const startRiskClassification = async () => {
      const sessionId = sessionStorage.getItem("session_id");

      if (!sessionId) {
        console.error("❌ No session_id found for risk classification");
        return;
      }

      try {
        console.log("🔍 [2/2] Starting risk classification...");
        setCurrentPhase("classifying");

        const classifyRes = await fetch(
          `${API_BASE_URL}/api/risk/classify?session_id=${sessionId}&save_to_firebase=true`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tweets: fetchedTweets,
              max_tweets: null,
            }),
          }
        );

        if (!classifyRes.ok) {
          const errorText = await classifyRes.text();
          console.error(
            "❌ Error classifying risk:",
            classifyRes.status,
            errorText
          );
          return;
        }

        const riskData = await classifyRes.json();
        console.log("✅ Risk classification completed:", {
          total_analyzed: riskData.total_tweets,
          distribution: riskData.summary?.risk_distribution,
          firebase_doc_id: riskData.firebase_doc_id,
          execution_time: riskData.execution_time,
        });

        if (riskData.firebase_doc_id) {
          sessionStorage.setItem(
            "classification_firebase_id",
            riskData.firebase_doc_id
          );
          console.log("💾 Classification Firebase Doc ID saved to session");
        }

        setCurrentPhase("completed");
        setProgressPercent(100);
        console.log("🔥 All data saved to Firebase!");
        console.log("🎉 All processes completed successfully!");

        console.log("🔄 Redirecting to dashboard in 1.5 seconds...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } catch (err) {
        console.error("❌ Error during risk classification:", err);
        setCurrentPhase("error");
      }
    };

    startRiskClassification();
  }, [fetchedTweets, navigate]);

  const renderContent = () => {
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
              {t('analyzing.title')}
            </Typography>

            <Typography
              sx={{
                fontSize: 16,
                color: "#4A5565",
                fontFamily:
                  "Inter, system-ui, -apple-system, BlinkMacSystemFont",
                mt: 1.5,
              }}
              className="analyze-subtext"
            >
              {t('analyzing.got')}{" "}
              <Box component="span" sx={{ fontWeight: 600 }}>
                {resolvedTotalPosts.toLocaleString()} {t('analyzing.posts')}
              </Box>
              . {t('analyzing.estimatedTime')}{" "}
              {isCalculating ? (
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <CircularProgress size={14} sx={{ color: "#4A5565" }} />
                  <Box component="span" sx={{ fontStyle: "italic" }}>
                    {t('analyzing.calculating')}
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
                mt: 1,
              }}
              className="analyze-subtext"
            >
              {t('analyzing.notification')}{" "}
              <Box component="span" sx={{ fontWeight: 600 }}>
                {t('analyzing.viaEmail')}
              </Box>{" "}
              {t('analyzing.canClose')}
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
              disablePictureInPicture
              disableRemotePlayback
              controlsList="nodownload noremoteplayback noplaybackrate"
            />
          </div>
        </Stack>
      );
    }
    return null;
  };

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
          position: "relative",
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
            <KeyboardArrowDownIcon sx={{ color: "#0F0F0F" }} fontSize="small" />
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
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
            }}
          >
            {renderContent()}
          </motion.div>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            mt: 2,
            textAlign: "center",
          }}
          className="email-notice"
        >
          ({t('analyzing.emailNotice')},{" "}
          <a
            href="#"
            className="email-set-link"
            onClick={handleOpenEmailModal}
          >
            {t('analyzing.clickHere')}
          </a>
          .)
        </Box>

        {isEmailModalOpen && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(15,15,15,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 20,
            }}
          >
            <Paper className="modal-email-noti">
              <IconButton
                size="small"
                onClick={handleCloseEmailModal}
                sx={{
                  alignSelf: "flex-end",
                  mr: "-8%",
                  mt: "-5%"
                }}
                className="modal-email-close"
              >
                <CloseIcon />
              </IconButton>

              <Stack spacing={3} >
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 600,
                    textAlign: "center",
                    fontFamily:
                      "Inter, system-ui, -apple-system, BlinkMacSystemFont",
                  }}
                  className="modal-email-title"
                >
                  {t('modal.title')}
                </Typography>

                <form onSubmit={handleSubmitEmail}>
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 13,
                          mb: 0.75,
                          fontFamily:
                            "Inter, system-ui, -apple-system, BlinkMacSystemFont",
                        }}
                        className="modal-email-text"
                      >
                        {t('modal.addEmail')}
                      </Typography>
                      <input
                        type="email"
                        placeholder="email@address.com"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEmail(e.target.value)
                        }
                        className="modal-email-inner modal-email-inputcontainer"
                      />
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontSize: 13,
                          mb: 0.75,
                          fontFamily:
                            "Inter, system-ui, -apple-system, BlinkMacSystemFont",
                        }}
                        className="modal-email-text"
                      >
                        {t('modal.confirmEmail')}
                      </Typography>
                      <input
                        type="email"
                        placeholder="email@address.com"
                        value={confirmEmail}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setConfirmEmail(e.target.value)
                        }
                        className="modal-email-inner modal-email-inputcontainer"
                      />
                    </Box>

                    {emailError && (
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#B91C1C",
                          mt: -0.5,
                          fontFamily:
                            "Inter, system-ui, -apple-system, BlinkMacSystemFont",
                        }}
                      >
                        {emailError}
                      </Typography>
                    )}

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 999,
                        fontSize: 14,
                        width: "94px",
                        alignSelf: "center",
                      }}
                      className="button-box button-text"
                    >
                      {t('modal.continue')}
                    </Button>
                  </Stack>
                </form>
              </Stack>
            </Paper>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Analyzing;