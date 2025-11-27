// src/Product/HappyPath/Dashboard.tsx
import * as React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";

// Components
import DashboardHeader from "../components/DashboardHeader";
import FiltersSidebar from "../components/FiltersSidebar";
import ActionPanelWithTweets from "../components/ActionPanelWithTweets";
import CleanAccountOverlay from "../components/CleanAccountOverlay";

import {
  type RiskItem,
  type PostType,
  type TweetMeta,
  PAGE_SIZE,
  formatLabel,
} from "../data/types";

const API_BASE_URL = "http://localhost:8080";

const Dashboard: React.FC = () => {
  const FIXED_CONTENT_LABELS: string[] = [
    "Political sensitive",
    "Offensive",
    "Inappropriate",
    "Unprofessional",
    "Sensitive",
    "Hate speech",
    "NSFW",
  ];

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [riskItems, setRiskItems] = React.useState<RiskItem[]>([]);
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [username, setUsername] = React.useState<string>("");

  const [hadDataInitially, setHadDataInitially] = React.useState(false);

  const [tweetMetaMap, setTweetMetaMap] = React.useState<
    Record<string, TweetMeta>
  >({});
  const [profileName, setProfileName] = React.useState<string>("");
  const [profileHandle, setProfileHandle] = React.useState<string>("");

  const [visibleCount, setVisibleCount] = React.useState<number>(PAGE_SIZE);
  const [imageUrl, setImageUrl] = React.useState<string>("");

  const [contentLabels, setContentLabels] = React.useState<string[]>([]);
  const [contentFilters, setContentFilters] = React.useState<
    Record<string, boolean>
  >({});

  const [riskFilters, setRiskFilters] = React.useState({
    high: true,
    mid: true,
    low: true,
    no: true,
  });

  const [postTypeFilters, setPostTypeFilters] = React.useState({
    original: true,
    reply: true,
    quote: true,
    repost: true,
  });

  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(
    () => new Set()
  );

  const [showCleanOverlay, setShowCleanOverlay] = React.useState(false);

  const hasAnyRiskTweet = React.useMemo(
    () =>
      riskItems.some(
        (item) =>
          item.risk_level === "high" ||
          item.risk_level === "mid" ||
          item.risk_level === "low"
      ),
    [riskItems]
  );

  const isCleanAccount =
    !loading && !error && riskItems.length > 0 && !hasAnyRiskTweet;

  React.useEffect(() => {
    if (isCleanAccount) {
      setShowCleanOverlay(true);
    }
  }, [isCleanAccount]);

  const getPostType = React.useCallback(
    (item: RiskItem): PostType => {
      if (item.post_type) return item.post_type;

      const meta = tweetMetaMap[String(item.tweet_id)];
      const text = (meta?.text || item.text || "").trim();

      const baseHandle = (profileHandle || username || "@user").replace(
        /^@/,
        ""
      );
      const isRt = (meta?.is_retweet ?? item.is_retweet) === true;

      const selfRtRegex = new RegExp(`^RT\\s+@${baseHandle}\\b`, "i");
      const isSelfRt = isRt && selfRtRegex.test(text);
      if (isSelfRt) return "quote";

      if (isRt) return "repost";

      const refType = meta?.referenced_tweets?.[0]?.type;
      const startsWithMention = /^@[\w_]+/.test(text);
      if (!isRt && refType === "replied_to" && startsWithMention) {
        return "reply";
      }

      return "original";
    },
    [profileHandle, username, tweetMetaMap]
  );

  const riskCounts = React.useMemo(() => {
    const counts = { high: 0, mid: 0, low: 0, no: 0 };
    riskItems.forEach((item) => {
      if (item.risk_level === "high") counts.high += 1;
      else if (item.risk_level === "mid") counts.mid += 1;
      else if (item.risk_level === "low") counts.low += 1;
      else if (item.risk_level === "no") counts.no += 1;
    });

    return counts;
  }, [riskItems]);

  const postTypeCounts = React.useMemo(() => {
    const counts = {
      original: 0,
      reply: 0,
      quote: 0,
      repost: 0,
    };

    riskItems.forEach((item) => {
      const pt = getPostType(item);
      if (pt === "original") counts.original += 1;
      else if (pt === "reply") counts.reply += 1;
      else if (pt === "quote") counts.quote += 1;
      else if (pt === "repost") counts.repost += 1;
    });

    return counts;
  }, [riskItems, getPostType]);

  // ✅ CARGAR DATOS DESDE FIREBASE
  React.useEffect(() => {
    const loadDataFromFirebase = async () => {
      try {
        console.log("🔥 Loading data from Firebase...");

        // Obtener datos de sessionStorage
        const sessionId = sessionStorage.getItem("session_id");
        const tweetsDocId = sessionStorage.getItem("tweets_firebase_id");
        const classificationDocId = sessionStorage.getItem("classification_firebase_id");
        const storedUsername = sessionStorage.getItem("username");

        // Validar que tenemos los datos necesarios
        if (!sessionId) {
          throw new Error("No session ID found. Please login again.");
        }

        if (!tweetsDocId || !classificationDocId) {
          throw new Error("No Firebase document IDs found. Please analyze your account first.");
        }

        console.log("📋 Session ID:", sessionId);
        console.log("📋 Tweets Doc ID:", tweetsDocId);
        console.log("📋 Classification Doc ID:", classificationDocId);

        // Llamar al endpoint para obtener datos de Firebase
        const response = await fetch(
          `${API_BASE_URL}/api/firebase/get-data?session_id=${sessionId}&tweets_doc_id=${tweetsDocId}&classification_doc_id=${classificationDocId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Error loading data from Firebase");
        }

        const firebaseData = await response.json();
        console.log("✅ Data loaded from Firebase:", firebaseData);

        // Extraer datos
        const tweetsData = firebaseData.data.tweets_data;
        const classificationData = firebaseData.data.classification_data;

        let detailArray: RiskItem[] = [];
        let tweetsArray: TweetMeta[] = [];
        let tweetsUser: any = undefined;
        let labelsFromSummary: string[] = [];

        // Procesar tweets
        if (tweetsData?.tweets && Array.isArray(tweetsData.tweets)) {
          tweetsArray = tweetsData.tweets;
          console.log(`📊 Loaded ${tweetsArray.length} tweets from Firebase`);
        }

        // Procesar usuario
        if (tweetsData?.user_info) {
          tweetsUser = tweetsData.user_info;
        }

        // Procesar clasificación
        if (classificationData?.results && Array.isArray(classificationData.results)) {
          detailArray = classificationData.results;
          console.log(`🛡️ Loaded ${detailArray.length} risk classifications from Firebase`);
        }

        // Extraer labels del summary
        if (classificationData?.summary?.label_counts) {
          labelsFromSummary = Object.keys(classificationData.summary.label_counts);
        }

        if (detailArray.length > 0) {
          setHadDataInitially(true);
        }

        setRiskItems(detailArray);
        setVisibleCount(PAGE_SIZE);

        // Extraer labels únicos
        const uniqueLabelsSet = new Set<string>();
        detailArray.forEach((item) => {
          if (Array.isArray(item.labels)) {
            item.labels.forEach((lbl) => uniqueLabelsSet.add(String(lbl)));
          }
        });

        let labelsToUse = Array.from(uniqueLabelsSet);

        if (labelsToUse.length === 0) {
          if (labelsFromSummary.length > 0) labelsToUse = labelsFromSummary;
          else labelsToUse = FIXED_CONTENT_LABELS;
        }

        setContentLabels(labelsToUse);

        const initialContentFilters: Record<string, boolean> = {};
        labelsToUse.forEach((lbl) => {
          initialContentFilters[lbl] = true;
        });
        setContentFilters(initialContentFilters);

        // Configurar usuario
        let userFromConfig = storedUsername || tweetsUser?.username || "username";

        if (!userFromConfig.startsWith("@")) {
          userFromConfig = "@" + userFromConfig;
        }
        setUsername(userFromConfig);

        if (tweetsUser?.username) {
          setProfileHandle(`@${tweetsUser.username}`);
        }
        if (tweetsUser?.name) {
          setProfileName(tweetsUser.name);
        }

        // Configurar avatar
        if (tweetsUser?.avatar_url) {
          setImageUrl(tweetsUser.avatar_url);
        } else if (tweetsUser?.profile_image_url) {
          setImageUrl(tweetsUser.profile_image_url);
        } else {
          setImageUrl(
            "https://pbs.twimg.com/profile_images/1967754912487325696/4SlUewFK_400x400.jpg"
          );
        }

        // Mapear tweets por ID
        const map: Record<string, TweetMeta> = {};
        tweetsArray.forEach((t) => {
          if (t && t.id) {
            map[String(t.id)] = t;
          }
        });
        setTweetMetaMap(map);

        console.log("✅ Dashboard data loaded successfully from Firebase");
        setLoading(false);
      } catch (e: unknown) {
        console.error("❌ Error loading dashboard data from Firebase:", e);
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Error desconocido");
        }
        setLoading(false);
      }
    };

    loadDataFromFirebase();
  }, []);

  const toggleContentFilter = (label: string) => {
    setContentFilters((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const toggleRiskFilter = (key: keyof typeof riskFilters) => {
    setRiskFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePostTypeFilter = (key: keyof typeof postTypeFilters) => {
    setPostTypeFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredItems = React.useMemo(() => {
    const activeRiskLevels = Object.keys(riskFilters).filter(
      (k) => riskFilters[k as keyof typeof riskFilters]
    );

    const activePostTypes = Object.keys(postTypeFilters).filter(
      (k) => postTypeFilters[k as keyof typeof postTypeFilters]
    );

    const activeLabelFingerprints = Object.keys(contentFilters)
      .filter((k) => contentFilters[k])
      .map((k) => k.toLowerCase().replace(/[^a-z0-9]/g, ""));

    return riskItems.filter((item) => {
      if (!activeRiskLevels.includes(item.risk_level)) return false;

      const postType = getPostType(item);
      if (!activePostTypes.includes(postType)) return false;

      if (activeLabelFingerprints.length === 0) return false;

      const itemLabels = item.labels || [];
      if (itemLabels.length === 0) return false;

      const matchesLabel = itemLabels.some((lbl) => {
        const itemClean = String(lbl).toLowerCase().replace(/[^a-z0-9]/g, "");
        
        return activeLabelFingerprints.some(filterClean => 
             filterClean === itemClean || 
             filterClean.includes(itemClean) || 
             itemClean.includes(filterClean)
        );
      });

      return matchesLabel;
    });
  }, [riskItems, riskFilters, postTypeFilters, contentFilters, getPostType]);

  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [contentFilters, riskFilters, postTypeFilters]);

  const itemsToShow = filteredItems.slice(0, visibleCount);

  const noDataAvailable =
    !hadDataInitially && !loading && riskItems.length === 0;
  const allRemoved = hadDataInitially && !loading && riskItems.length === 0;

  const allContentUnchecked =
    contentLabels.length > 0 &&
    contentLabels.every((lbl) => contentFilters[lbl] === false);

  const allRiskUnchecked =
    !riskFilters.high &&
    !riskFilters.mid &&
    !riskFilters.low &&
    !riskFilters.no;

  const allPostTypeUnchecked =
    !postTypeFilters.original &&
    !postTypeFilters.reply &&
    !postTypeFilters.quote &&
    !postTypeFilters.repost;

  const allFiltersCategoryOff =
    allContentUnchecked && allRiskUnchecked && allPostTypeUnchecked;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredItems.length));
  };

  const allSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) => selectedIds.has(item.tweet_id));

  const hasSelection = selectedIds.size > 0;

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (allSelected) {
        return new Set();
      }
      const next = new Set<number>(prev);
      filteredItems.forEach((item) => {
        next.add(item.tweet_id);
      });
      return next;
    });
  };

  const handleToggleItemSelected = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSingleRemove = (id: number) => {
    setRiskItems((prev) => prev.filter((item) => item.tweet_id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const nothingToShow =
    !allRemoved && filteredItems.length === 0 && itemsToShow.length === 0;

  const handleConfirmRemove = () => {
    if (selectedIds.size === 0) {
      setShowConfirmModal(false);
      return;
    }

    setRiskItems((prev) =>
      prev.filter((item) => !selectedIds.has(item.tweet_id))
    );
    setSelectedIds(new Set());
    setShowConfirmModal(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#F1F1F1",
          display: "flex",
          justifyContent: "center",
          alignItems: "stretch",
          p: { xs: 1.5, md: 3 },
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
          <DashboardHeader username={username} />

          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <CircularProgress />
            <Typography sx={{ color: "#666", fontSize: 14 }}>
              Loading your data from Firebase...
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#F1F1F1",
          display: "flex",
          justifyContent: "center",
          alignItems: "stretch",
          p: { xs: 1.5, md: 3 },
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
          <DashboardHeader username={username} />

          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography color="error" sx={{ fontSize: 18, fontWeight: 600 }}>
              Error Loading Data
            </Typography>
            <Typography color="error" sx={{ fontSize: 14 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.href = "/"}
              sx={{
                mt: 2,
                bgcolor: "#0F0F0F",
                "&:hover": { bgcolor: "#333" }
              }}
            >
              Go Back
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F1F1F1",
        display: "flex",
        justifyContent: "center",
        alignItems: "stretch",
        p: { xs: 1.5, md: 3 },
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
          height: "92%",
          bgcolor: "white",
          borderRadius: 3,
          boxShadow: "0 0 0 1px rgba(15,23,42,0.06)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <DashboardHeader username={username} />

        <Box
          sx={{
            flex: 1,
            overflowY: { xs: "visible", md: "auto" },
          }}
        >
          <Box
            sx={{
              width: "100%",
              bgcolor: "#FFF",
              display: "flex",
              justifyContent: "center",
              fontFamily:
                "Inter, system-ui, -apple-system, BlinkMacSystemFont",
            }}
          >
            {noDataAvailable ? (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily:
                    "Inter, system-ui, -apple-system, BlinkMacSystemFont",
                }}
                className="removed-container"
              >
                <Box
                  sx={{
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 28,
                      fontWeight: 700,
                      mb: 4,
                      mt: -4.5,
                    }}
                    className="title-nothing"
                  >
                    Nothing to Check Here
                  </Typography>

                  <Typography
                    sx={{
                      textAlign: "center",
                      mb: 3,
                    }}
                    className="removed-text"
                  >
                    We couldn&apos;t find any posts or reposts on your
                    connected account.
                  </Typography>

                  <Box sx={{ mb: 4 }}>
                    <Typography
                      sx={{
                        fontSize: 14,
                        mb: 1,
                        fontWeight: 500,
                        textAlign: "left",
                      }}
                      className="removed-text"
                    >
                      This could mean:
                    </Typography>
                    <ul
                      style={{
                        textAlign: "left",
                      }}
                      className="removed-bullets removed-text"
                    >
                      <li>Your account is brand new</li>
                      <li>You&apos;ve already deleted all previous posts</li>
                    </ul>
                  </Box>

                  <Button
                    variant="contained"
                    onClick={() => {
                      window.location.href = "/";
                    }}
                    sx={{
                      textTransform: "none",
                      borderRadius: "6px",
                      px: 2,
                      py: 1.5,
                      bgcolor: "#0F0F0F",
                    }}
                    className="button-nothing"
                  >
                    Log out
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  width: "100%",
                  mt: 0.1,
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: { xs: "stretch", md: "flex-start" },
                  gap: { xs: 2, md: 3 },
                }}
              >
                <CleanAccountOverlay
                  open={showCleanOverlay}
                  onClose={() => setShowCleanOverlay(false)}
                />
                <FiltersSidebar
                  contentLabels={contentLabels}
                  contentFilters={contentFilters}
                  toggleContentFilter={toggleContentFilter}
                  formatLabel={formatLabel}
                  riskFilters={riskFilters}
                  riskCounts={riskCounts}
                  toggleRiskFilter={toggleRiskFilter}
                  postTypeFilters={postTypeFilters}
                  togglePostTypeFilter={togglePostTypeFilter}
                  postTypeCounts={postTypeCounts}
                />
                <ActionPanelWithTweets
                  itemsToShow={itemsToShow}
                  filteredItems={filteredItems}
                  allRemoved={allRemoved}
                  allFiltersCategoryOff={allFiltersCategoryOff}
                  showConfirmModal={showConfirmModal}
                  onOpenConfirmModal={() => setShowConfirmModal(true)}
                  onCloseConfirmModal={() => setShowConfirmModal(false)}
                  hasSelection={hasSelection}
                  allSelected={allSelected}
                  selectedIds={selectedIds}
                  onToggleSelectAll={handleToggleSelectAll}
                  onToggleItemSelected={handleToggleItemSelected}
                  onConfirmSingleRemove={handleSingleRemove}
                  onConfirmRemove={handleConfirmRemove}
                  onLoadMore={handleLoadMore}
                  getPostType={getPostType}
                  tweetMetaMap={tweetMetaMap}
                  profileName={profileName}
                  profileHandle={profileHandle}
                  username={username}
                  imageUrl={imageUrl}
                  nothingToShow={nothingToShow}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;