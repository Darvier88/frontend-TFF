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
  const [imageUrl, setImageUrl] = React.useState<string>("");

  const [visibleCount, setVisibleCount] = React.useState<number>(PAGE_SIZE);

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
  const loadDataFromUrl = async (
  tweetsId: string, 
  classificationId: string, 
  usernameParam: string | null
) => {
  try {
    console.log("🔗 Loading data from URL parameters...");
    console.log("   Tweets ID:", tweetsId);
    console.log("   Classification ID:", classificationId);
    console.log("   Username:", usernameParam);
    
    // Guardar en sessionStorage para que el Dashboard funcione normalmente
    sessionStorage.setItem("tweets_firebase_id", tweetsId);
    sessionStorage.setItem("classification_firebase_id", classificationId);
    
    if (usernameParam) {
      sessionStorage.setItem("username", usernameParam);
    }
    
    // Crear un pseudo session_id (no es necesario para autenticación)
    const pseudoSessionId = `url_${Date.now()}`;
    sessionStorage.setItem("session_id", pseudoSessionId);
    
    console.log("💾 Data saved to sessionStorage");
    
    // Limpiar los parámetros de la URL (opcional, para que se vea más limpio)
    window.history.replaceState({}, document.title, "/dashboard");
    
    console.log("✅ URL parameters processed, reloading page...");
    
    // Forzar recarga para que el useEffect principal se ejecute con los nuevos datos
    window.location.reload();
    
  } catch (error) {
    console.error("❌ Error loading data from URL:", error);
    
    setError(
      error instanceof Error 
        ? error.message 
        : "Error loading data from link. Please try again."
    );
    setLoading(false);
  }
};
 React.useEffect(() => {
  // Detectar si hay Firebase IDs en la URL
  const urlParams = new URLSearchParams(window.location.search);
  const tweetsId = urlParams.get('tweets_id');
  const classificationId = urlParams.get('classification_id');
  const usernameParam = urlParams.get('username');
  
  if (tweetsId && classificationId) {
    console.log("🔗 Firebase IDs detected in URL, loading data...");
    loadDataFromUrl(tweetsId, classificationId, usernameParam);
  }
}, []);

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

  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deletionProgress, setDeletionProgress] = React.useState("");
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = React.useState<number>(0);

  React.useEffect(() => {
    if (rateLimitRetryAfter > 0) {
      const interval = setInterval(() => {
        setRateLimitRetryAfter((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [rateLimitRetryAfter]);

  const handleDeleteFromTwitterAndFirebase = async () => {
    if (selectedIds.size === 0) {
      alert("No tweets selected");
      return;
    }

    // Verificar si hay rate limit activo
    if (rateLimitRetryAfter > 0) {
      const minutes = Math.floor(rateLimitRetryAfter / 60);
      const seconds = rateLimitRetryAfter % 60;
      const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
      alert(`⏳ Please wait ${timeStr} before trying again`);
      return;
    }

    setIsDeleting(true);
    setDeletionProgress("Preparing deletion...");

    try {
      // Obtener datos de sesión
      const sessionId = sessionStorage.getItem("session_id");
      const tweetsDocId = sessionStorage.getItem("tweets_firebase_id");

      console.log("🗑️ Starting deletion process...");
      console.log("   Session ID:", sessionId);
      console.log("   Firebase Doc ID:", tweetsDocId);
      console.log("   Selected tweets:", selectedIds.size);

      if (!sessionId || !tweetsDocId) {
        throw new Error("Missing session data. Please login again.");
      }

      // ✅ FIX: Convertir selectedIds a string separado por comas
      const tweetIdsString = Array.from(selectedIds).join(',');
      console.log("   Tweet IDs to delete:", tweetIdsString);

      setDeletionProgress(`Deleting ${selectedIds.size} tweets from Twitter...`);

      // Llamar al endpoint de eliminación (OPCIÓN A: Twitter + Firebase)
      // ✅ FIX: Agregar tweet_ids como parámetro
      const url = `${API_BASE_URL}/api/tweets/delete?` +
        `session_id=${sessionId}&` +
        `firebase_doc_id=${tweetsDocId}&` +
        `tweet_ids=${encodeURIComponent(tweetIdsString)}&` +  // ← NUEVO
        `delete_retweets=true&` +
        `delete_originals=true&` +
        `delay_seconds=1.0&` +
        `delete_from_firebase=true`;

      console.log("🌐 Calling API:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Response status:", response.status);

      // ✅ MANEJAR RATE LIMIT (429)
      if (response.status === 429) {
        const errorData = await response.json();
        console.warn("⏳ Rate limited:", errorData);
        
        const retryAfter = errorData.detail?.retry_after_seconds || 60;
        setRateLimitRetryAfter(retryAfter);
        
        const timeFormatted = errorData.detail?.retry_after_formatted || `${retryAfter}s`;
        
        alert(
          `⏳ Too many requests\n\n` +
          `Please wait ${timeFormatted} before trying again.\n\n` +
          `A countdown timer will appear.`
        );
        
        setIsDeleting(false);
        setDeletionProgress("");
        setShowConfirmModal(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ API Error:", errorData);
        throw new Error(errorData.detail || "Failed to delete tweets");
      }

      const result = await response.json();
      console.log("✅ Deletion result:", result);

      // Procesar resultado
      const deletionResult = result.result;
      const totalDeleted = deletionResult.retweets_deleted + deletionResult.tweets_deleted;
      const failed = deletionResult.failed || [];

      console.log(`   ✅ Successfully deleted: ${totalDeleted}`);
      console.log(`   ❌ Failed: ${failed.length}`);

      setDeletionProgress("Updating display...");

      // Actualizar UI: remover tweets eliminados exitosamente
      if (failed.length > 0) {
        // Si hay fallidos, mantener solo esos en la UI
        const failedIds = new Set(
          failed.map((f: any) => parseInt(f.tweet_id))
        );

        setRiskItems((prev) =>
          prev.filter((item) => failedIds.has(item.tweet_id))
        );

        alert(
          `⚠️ Partial deletion:\n` +
          `✅ ${totalDeleted} tweets permanently deleted from Twitter & Firebase\n` +
          `❌ ${failed.length} tweets failed to delete\n\n` +
          `The failed tweets remain in your view.`
        );
      } else {
        // Todo exitoso: remover todos los seleccionados
          setRiskItems((prev) =>
            prev.filter((item) => !selectedIds.has(item.tweet_id))
          );

          alert(
            `✅ Success!\n\n` +
            `${totalDeleted} tweets permanently deleted from:\n` +
            `• Twitter/X\n` +
            `• Firebase Database\n\n` +
            `This action cannot be undone.`
          );
          
          // 🆕 FORZAR RECARGA DE DATOS ACTUALIZADOS DESDE FIREBASE
          console.log("🔄 Reloading updated data from Firebase...");
          
          // Limpiar selección primero
          setSelectedIds(new Set());
          setShowConfirmModal(false);
          setDeletionProgress("");
          setIsDeleting(false);
          
          // Esperar 1 segundo para que Firebase termine de actualizarse
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          
          // IMPORTANTE: Salir de la función para evitar que el código de abajo se ejecute
          return;
      }

      // Limpiar selección
      setSelectedIds(new Set());
      setShowConfirmModal(false);
      setDeletionProgress("");
      setIsDeleting(false);

      console.log("✅ Deletion process completed");

    } catch (error) {
      console.error("❌ Deletion error:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error occurred";

      alert(
        `❌ Error deleting tweets:\n\n` +
        `${errorMessage}\n\n` +
        `Please try again or contact support.`
      );

      setIsDeleting(false);
      setDeletionProgress("");
    }
  };

  const handleDeleteSingleTweet = async (tweetId: number) => {
    // Verificar rate limit
    if (rateLimitRetryAfter > 0) {
      const minutes = Math.floor(rateLimitRetryAfter / 60);
      const seconds = rateLimitRetryAfter % 60;
      const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
      alert(`⏳ Please wait ${timeStr} before trying again`);
      return;
    }

    setIsDeleting(true);
    setDeletionProgress("Deleting tweet...");

    try {
      const sessionId = sessionStorage.getItem("session_id");
      const tweetsDocId = sessionStorage.getItem("tweets_firebase_id");

      console.log("🗑️ Starting single tweet deletion...");
      console.log("   Tweet ID:", tweetId);

      if (!sessionId || !tweetsDocId) {
        throw new Error("Missing session data. Please login again.");
      }

      setDeletionProgress("Deleting tweet from Twitter...");

      // ✅ FIX: Enviar solo el ID del tweet específico
      const url = `${API_BASE_URL}/api/tweets/delete?` +
        `session_id=${sessionId}&` +
        `firebase_doc_id=${tweetsDocId}&` +
        `tweet_ids=${tweetId}&` +  // ← SOLO ESTE TWEET
        `delete_retweets=true&` +
        `delete_originals=true&` +
        `delay_seconds=1.0&` +
        `delete_from_firebase=true`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Manejar rate limit
      if (response.status === 429) {
        const errorData = await response.json();
        const retryAfter = errorData.detail?.retry_after_seconds || 60;
        setRateLimitRetryAfter(retryAfter);
        
        const timeFormatted = errorData.detail?.retry_after_formatted || `${retryAfter}s`;
        alert(`⏳ Too many requests. Please wait ${timeFormatted}`);
        
        setIsDeleting(false);
        setDeletionProgress("");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete tweet");
      }

      const result = await response.json();
      const deletionResult = result.result;
      const failed = deletionResult.failed || [];

      console.log("✅ Single tweet deletion result:", result);

      if (failed.length === 0) {
        // Eliminación exitosa
       setRiskItems((prev) =>
          prev.filter((item) => item.tweet_id !== tweetId)
        );

        alert("✅ Tweet permanently deleted from Twitter & Firebase");
        
        // 🆕 FORZAR RECARGA
        console.log("🔄 Reloading updated data from Firebase...");
        setDeletionProgress("");
        setIsDeleting(false);
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        return;
      } else {
        // Falló
        alert("❌ Failed to delete tweet. Please try again.");
      }

      setDeletionProgress("");
      setIsDeleting(false);

    } catch (error) {
      console.error("❌ Single deletion error:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error occurred";

      alert(`❌ Error deleting tweet:\n\n${errorMessage}`);

      setIsDeleting(false);
      setDeletionProgress("");
    }
  };
  const sendAnalysisReadyEmail = async () => {
  try {
    const sessionId = sessionStorage.getItem("session_id");
    const tweetsDocId = sessionStorage.getItem("tweets_firebase_id");
    const classificationDocId = sessionStorage.getItem("classification_firebase_id");

    if (!sessionId || !tweetsDocId || !classificationDocId) {
      console.warn("⚠️ Missing data for email notification, skipping...");
      return;
    }

    console.log("📧 Checking if email needs to be sent...");

    const url = `${API_BASE_URL}/api/notifications/send-analysis-ready?` +
      `session_id=${sessionId}&` +
      `tweets_firebase_id=${tweetsDocId}&` +
      `classification_firebase_id=${classificationDocId}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const result = await response.json();
      
      if (result.already_sent) {
        console.log("ℹ️ Email was already sent for this analysis");
        console.log("   Sent at:", result.sent_at);
      } else {
        console.log("✅ Email notification sent successfully:", result);
        console.log("   Recipient:", result.recipient);
        console.log("   Dashboard link:", result.dashboard_link);
      }
    } else {
      console.warn("⚠️ Failed to send email notification:", response.status);
    }
  } catch (error) {
    console.error("❌ Error sending email notification:", error);
    // No bloquear el Dashboard si el email falla
  }
};

  // ✅ CARGAR DATOS DESDE FIREBASE
  React.useEffect(() => {
  const loadDataFromFirebase = async () => {
    try {
      console.log("🔥 Loading data from Firebase...");

      const sessionId = sessionStorage.getItem("session_id");
      const tweetsDocId = sessionStorage.getItem("tweets_firebase_id");
      const classificationDocId = sessionStorage.getItem("classification_firebase_id");
      const storedUsername = sessionStorage.getItem("username");

      console.log("📋 SessionStorage values:", {
        sessionId,
        tweetsDocId,
        classificationDocId,
        storedUsername
      });

      // Validar que tenemos los datos necesarios
      if (!sessionId) {
        throw new Error("No session ID found. Please login again.");
      }

      if (!tweetsDocId || !classificationDocId) {
        throw new Error("No Firebase document IDs found. Please analyze your account first.");
      }

      // Llamar al endpoint para obtener datos de Firebase
      const url = `${API_BASE_URL}/api/firebase/get-data?session_id=${sessionId}&tweets_doc_id=${tweetsDocId}&classification_doc_id=${classificationDocId}`;
      console.log("🌐 Calling URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error response:", errorData);
        throw new Error(errorData.detail || "Error loading data from Firebase");
      }

      const firebaseData = await response.json();
      console.log("✅ Data loaded from Firebase:", firebaseData);
      
      const tweetsData = firebaseData.data?.tweets;
      const classificationData = firebaseData.data?.classification;

      console.log("📊 tweetsData:", tweetsData);
      console.log("🛡️ classificationData:", classificationData);

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
        console.log("👤 User info:", tweetsUser);
      }

      // Procesar clasificación
      if (classificationData?.results && Array.isArray(classificationData.results)) {
        detailArray = classificationData.results;
        console.log(`🛡️ Loaded ${detailArray.length} risk classifications`);
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
        if (labelsFromSummary.length > 0) {
          labelsToUse = labelsFromSummary;
        } else {
          labelsToUse = FIXED_CONTENT_LABELS;
        }
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
      
      // ═══════════════════════════════════════════════════════════════════
      // ENVIAR EMAIL SOLO SI ES UNA SESIÓN NORMAL (NO desde URL)
      // ═══════════════════════════════════════════════════════════════════
      const isUrlAccess = sessionId?.startsWith('url_');
      
      if (detailArray.length > 0 && !isUrlAccess) {
        console.log("📧 Triggering email notification...");
        await sendAnalysisReadyEmail();
      } else if (isUrlAccess) {
        console.log("ℹ️  Skipping email (accessed via URL link)");
      }
      // ═══════════════════════════════════════════════════════════════════
      
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

  // Solo ejecutar si NO hay Firebase IDs en la URL
  const urlParams = new URLSearchParams(window.location.search);
  const hasFirebaseIds = urlParams.has('tweets_id') && urlParams.has('classification_id');
  
  if (!hasFirebaseIds) {
    loadDataFromFirebase();
  }
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
        return activeLabelFingerprints.some(
          (filterClean) =>
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
    handleDeleteSingleTweet(id);
  };

  const nothingToShow =
    !allRemoved && filteredItems.length === 0 && itemsToShow.length === 0;

  const handleConfirmRemove = () => {
    handleDeleteFromTwitterAndFirebase();
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
                  isDeleting={isDeleting}
                  deletionProgress={deletionProgress}
                  rateLimitRetryAfter={rateLimitRetryAfter}
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