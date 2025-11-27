import * as React from "react";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Paper,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRetweet,
  faComment,
  faQuoteRight,
  faReply,
  faEraser,
  faArrowRotateLeft,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { faShareFromSquare } from "@fortawesome/free-regular-svg-icons";

import TweetPreview from "./TweetPreview";
import {
  type RiskItem,
  type RiskLabel,
  type RiskLevel,
  type PostType,
  type TweetMeta,
} from "../data/types";

interface ActionPanelWithTweetsProps {
  itemsToShow: RiskItem[];
  filteredItems: RiskItem[];
  allRemoved: boolean;
  allFiltersCategoryOff: boolean;
  showConfirmModal: boolean;
  onOpenConfirmModal: () => void;
  onCloseConfirmModal: () => void;
  hasSelection: boolean;
  allSelected: boolean;
  selectedIds: Set<number>;
  onToggleSelectAll: () => void;
  onToggleItemSelected: (id: number) => void;
  onConfirmRemove: () => void;
  onConfirmSingleRemove: (id: number) => void;
  onLoadMore: () => void;
  getPostType: (item: RiskItem) => PostType;
  tweetMetaMap: Record<string, TweetMeta>;
  profileName: string;
  profileHandle: string;
  username: string;
  imageUrl: string;
  nothingToShow: boolean;
  isDeleting?: boolean;
  deletionProgress?: string;
  rateLimitRetryAfter?: number;
}

const checkboxBoxStyles = {
  display: "flex",
  width: 16,
  height: 16,
  padding: "4px",
  flexDirection: "column" as const,
  justifyContent: "center",
  alignItems: "center",
  gap: "10px",
  aspectRatio: "1 / 1",
  borderRadius: "2px",
  border: "1px solid #0F0F0F",
  background: "#FFF",
};

const RiskLevelChip: React.FC<{ level: RiskLevel }> = ({ level }) => {
  let label: string;
  let color: string;
  let bgColor: string;

  if (level === "high") {
    label = "High Risk";
    color = "#AC3516";
    bgColor = "#FFE5DF";
  } else if (level === "mid") {
    label = "Medium Risk";
    color = "#906021";
    bgColor = "#FFE8C9";
  } else if (level === "low") {
    label = "Low Risk";
    color = "#325CBF";
    bgColor = "#D9E2F9";
  } else {
    label = "No Risk ✅";
    color = "#345938";
    bgColor = "#E9FFEB";
  }

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: bgColor,
        border: `1px solid ${color}`,
        color,
        fontWeight: 600,
        fontSize: 11,
        height: 24,
      }}
      className="dashboard-chips"
    />
  );
};

const RiskLabelChips: React.FC<{ labels: RiskLabel[] }> = ({ labels }) => {
  const unique = Array.from(new Set(labels));

  const format = (label: string) =>
    label
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      {unique.map((label) => (
        <Chip
          key={String(label)}
          label={format(String(label))}
          size="small"
          sx={{
            bgcolor: "#FBFBFB",
            color: "#0F0F0F",
            border: "1px solid #0F0F0F",
            fontSize: 11,
            height: 24,
            borderRadius: 999,
          }}
          className="dashboard-chips"
        />
      ))}
    </>
  );
};

const ConfirmModal: React.FC<{
  open: boolean;
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  deletionProgress?: string;
  isSingleTweet?: boolean; 
}> = ({ open, count, onCancel, onConfirm, isDeleting, deletionProgress }) => {
  if (!open) return null;

  const noun = count === 1 ? "post" : "posts";

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        bgcolor: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={isDeleting ? undefined : onCancel} 
    >
      <Paper
        elevation={0}
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: 480,
          maxWidth: "90vw",
          borderRadius: 3,
          p: 4,
          bgcolor: "white",
        }}
        className="modal-config"
      >
        {/* Header con ícono de advertencia */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography sx={{ fontSize: 28 }}>⚠️</Typography>
          <Typography
            fontSize={18}
            fontWeight={700}
            className="confirm-modal"
          >
            Confirm Permanent Deletion
          </Typography>
        </Box>

        {/* Descripción */}
        <Typography
          fontSize={14}
          color="text.secondary"
          sx={{ mb: 2 }}
          className="modal-text"
        >
          You're about to <strong>permanently delete {count} {noun}</strong> from:
        </Typography>

        {/* Lista de lo que se eliminará */}
        <Box
          sx={{
            bgcolor: "#FFF9E6",
            border: "1px solid #FFE082",
            borderRadius: 2,
            p: 2,
            mb: 2.5,
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>
            ✓ What will be deleted:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5, fontSize: 13 }}>
            <li>
              <strong>Twitter/X:</strong> Removed from your public profile forever
            </li>
            <li>
              <strong>Firebase Database:</strong> All copies deleted from our servers
            </li>
          </Box>
        </Box>

        {/* Advertencia de irreversibilidad */}
        <Box
          sx={{
            bgcolor: "#FFE5DF",
            border: "1px solid #AC3516",
            borderRadius: 2,
            p: 2,
            mb: 3,
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#AC3516", mb: 0.5 }}>
            ⚠️ THIS ACTION CANNOT BE UNDONE
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#AC3516" }}>
            Once deleted, these tweets cannot be recovered by you, Twitter, or us.
          </Typography>
        </Box>

        {/* Progress bar durante eliminación */}
        {isDeleting && (
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                width: "100%",
                height: 4,
                bgcolor: "#E0E0E0",
                borderRadius: 2,
                overflow: "hidden",
                mb: 1.5,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  bgcolor: "#BA4D4B",
                  animation: "progress 1.5s ease-in-out infinite",
                  "@keyframes progress": {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(100%)" },
                  },
                }}
              />
            </Box>
            <Typography sx={{ fontSize: 13, color: "#666", textAlign: "center" }}>
              {deletionProgress || "Deleting tweets..."}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#999", textAlign: "center", mt: 0.5 }}>
              Please wait, this may take a few minutes...
            </Typography>
          </Box>
        )}

        {/* Botones */}
        <Stack direction="row" spacing={1.5} justifyContent="center">
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={isDeleting}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              px: 3,
              borderColor: "#111827",
              color: "#111827",
              "&:hover": {
                bgcolor: "#F3F4F6",
                borderColor: "#111827",
              },
              "&:disabled": {
                borderColor: "#BDBDBD",
                color: "#BDBDBD",
              },
            }}
            className="modal-buttons"
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={onConfirm}
            disabled={isDeleting}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              px: 3,
              bgcolor: "#BA4D4B",
              color: "#fff",
              "&:hover": {
                bgcolor: "#A03E3C",
              },
              "&:disabled": {
                bgcolor: "#BDBDBD",
              },
            }}
            className="modal-buttons"
          >
            {isDeleting ? "Deleting..." : "Yes, Delete Permanently"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};


const AllRemovedState: React.FC = () => (
  <Box
    sx={{
      minHeight: 420,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: 2,
    }}
  >
    <Typography fontSize={28} fontWeight={700} className="removed-title">
      All posts removed - nice work!
    </Typography>

    <Typography fontSize={14} color="text.secondary" className="removed-text">
      Want to help your friends clean up too?
    </Typography>
    <Typography
      fontSize={14}
      color="text.secondary"
      sx={{ mb: 2, mt: -1.5 }}
      className="removed-text"
    >
      Share AI Checker only with the people you choose
    </Typography>

    <Button
      variant="contained"
      sx={{
        display: "flex",
        textTransform: "none",
        borderRadius: 1.5,
        px: 2,
        py: 1,
        bgcolor: "#000",
        "&:hover": { bgcolor: "#111" },
      }}
      className="recommend-button"
    >
      Recommend Us
      <FontAwesomeIcon
        icon={faShareFromSquare}
        style={{
          fontSize: 18,
          fontWeight: 900,
          marginLeft: 8,
        }}
      />
    </Button>
  </Box>
);

const AllFiltersOffState: React.FC = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: 1.5,
      mt: { xs: 0, md: 25 },
      minHeight: { xs: 550, md: 0 },
    }}
  >
    <Typography fontSize={28} fontWeight={700} className="title-nothing">
      Nothing to Show Here
    </Typography>
    <Typography fontSize={14} color="text.secondary" className="removed-text">
      You&apos;ve unchecked all filter options.
    </Typography>
    <Typography fontSize={14} color="text.secondary" className="removed-text">
      Select at least one category to view results.
    </Typography>
  </Box>
);

const ActionPanelWithTweets: React.FC<ActionPanelWithTweetsProps> = ({
  itemsToShow,
  filteredItems,
  allRemoved,
  allFiltersCategoryOff,
  showConfirmModal,
  onOpenConfirmModal,
  onCloseConfirmModal,
  hasSelection,
  allSelected,
  selectedIds,
  onToggleSelectAll,
  onToggleItemSelected,
  onConfirmRemove,
  onConfirmSingleRemove,
  onLoadMore,
  getPostType,
  tweetMetaMap,
  profileName,
  profileHandle,
  username,
  imageUrl,
  nothingToShow,
  isDeleting,
  deletionProgress,
  rateLimitRetryAfter,
}) => {
  const [isAutoLoading, setIsAutoLoading] = React.useState(false);
  const [singleConfirmId, setSingleConfirmId] = React.useState<number | null>(
    null
  );
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const handleConfirmRemove = () => {
    onConfirmRemove();
  };

  const handleConfirmSingle = () => {
    if (singleConfirmId !== null) {
      onConfirmSingleRemove(singleConfirmId);
    }
    setSingleConfirmId(null);
  };

  const formatRetryTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  React.useEffect(() => {
    setIsAutoLoading(false);
  }, [itemsToShow.length]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (allRemoved || allFiltersCategoryOff) return;
      if (itemsToShow.length >= filteredItems.length) return;
      if (isAutoLoading) return;

      const { scrollTop, clientHeight, scrollHeight } = el;
      const threshold = 160;

      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        setIsAutoLoading(true);
        onLoadMore();
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [
    allRemoved,
    allFiltersCategoryOff,
    itemsToShow.length,
    filteredItems.length,
    isAutoLoading,
    onLoadMore,
  ]);

  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        borderRadius: 4,
        border: "1px solid #E5E7EB",
        bgcolor: "#FFF",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      className="paper-tweets"
    >
      {/* HEADER */}
      <Box
        sx={{
          px: { xs: 2, md: 10.125 },
          py: 2,
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: { xs: "flex-start", md: "space-between" },
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 1.5, md: 0 },
          flexShrink: 0,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ flexShrink: 0 }}
        >
          <FontAwesomeIcon icon={faEraser} />

          <Box
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            gap={0.5}
          >
            <Typography
              fontWeight={600}
              fontSize={14}
              className="filter-title"
              sx={{ whiteSpace: { xs: "normal", md: "nowrap" } }}
            >
              Action panel
            </Typography>

            {!allRemoved && (
              <Typography
                variant="body2"
                color="text.secondary"
                className="availability-text"
                sx={{ whiteSpace: { xs: "normal", md: "nowrap" } }}
              >
                Dashboard available until November 5, 2025 at 10:00 a.m.
              </Typography>
            )}
          </Box>
        </Stack>

        {!allRemoved && (
          <Stack
            direction={{ xs: "row", md: "row" }}
            spacing={1}
            sx={{
              mt: { xs: 1.5, md: 0 },
              width: { xs: "100%", md: "auto" },
              justifyContent: { xs: "flex-start", md: "flex-end" },
              flexShrink: 0,
            }}
          >
            {/* ✅ MOSTRAR COUNTDOWN SI HAY RATE LIMIT */}
            {rateLimitRetryAfter && rateLimitRetryAfter > 0 ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 1,
                  bgcolor: "#FFF9E6",
                  border: "1px solid #FFE082",
                  borderRadius: 2,
                  fontSize: 13,
                }}
              >
                <Typography sx={{ fontSize: 16 }}>⏳</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                  Wait {formatRetryTime(rateLimitRetryAfter)} to delete again
                </Typography>
              </Box>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="small"
                  className={`action-buttons ${
                    hasSelection ? "action-buttons--danger" : ""
                  }`}
                  onClick={onOpenConfirmModal}
                  disabled={isDeleting}
                  sx={{
                    flexGrow: { xs: 1, md: 0 },
                  }}
                >
                  {isDeleting ? "Deleting..." : "Remove all"}
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  className="action-buttons action-buttons--select-all"
                  onClick={onToggleSelectAll}
                  disabled={isDeleting}
                  sx={{
                    flexGrow: { xs: 1, md: 0 },
                  }}
                >
                  {allSelected ? "Un-select all" : "Select all"}
                </Button>
              </>
            )}
          </Stack>
        )}
      </Box>

      <Divider sx={{ flexShrink: 0 }} />

      {/* BODY */}
      <Box
        ref={scrollRef}
        sx={{
          px: { xs: 2, md: 10.125 },
          py: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        <ConfirmModal
          open={showConfirmModal}
          count={selectedIds.size}
          onCancel={onCloseConfirmModal}
          onConfirm={handleConfirmRemove}
          isDeleting={isDeleting}
          deletionProgress={deletionProgress}
        />

        <ConfirmModal
          open={singleConfirmId !== null}
          count={1}
          onCancel={() => setSingleConfirmId(null)}
          onConfirm={handleConfirmSingle}
        />

        {allRemoved ? (
          <AllRemovedState />
        ) : allFiltersCategoryOff ? (
          <AllFiltersOffState />
        ) : nothingToShow ? (
          <AllFiltersOffState />
        ) : (
          <>
            {itemsToShow.map((item, idx) => {
              const postType = getPostType(item);
              const tweetMeta = tweetMetaMap[String(item.tweet_id)];

              return (
                <Paper
                  key={`${item.tweet_id}-${idx}`}
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    border: "1px solid #DADADA",
                    bgcolor: "#FFF7F1",
                    px: { xs: 2.5, md: 3.5 },
                    py: { xs: 2, md: 2.5 },
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "minmax(0,1fr) auto",
                    },
                    gap: { xs: 1.5, md: 2 },
                    alignItems: { md: "flex-start" },
                  }}
                  className="post-card-container"
                >
                  <Box
                    sx={{
                      marginRight: { xs: 0, md: "15px" },
                    }}
                  >
                    <Stack direction="row" spacing={1} mb={1.875}>
                      <RiskLevelChip level={item.risk_level} />
                      <RiskLabelChips labels={item.labels} />
                    </Stack>

                    <Typography
                      variant="caption"
                      sx={{ color: "#6B7280", mb: 0.5 }}
                      className="type-tweet"
                    >
                      <Stack
                        direction="row"
                        spacing={0.75}
                        alignItems="center"
                        component="span"
                      >
                        {postType === "repost" && (
                          <>
                            <span>Repost</span>
                            <FontAwesomeIcon icon={faRetweet} />
                          </>
                        )}

                        {postType === "reply" && (
                          <>
                            <span>Reply</span>
                            <FontAwesomeIcon icon={faReply} />
                          </>
                        )}

                        {postType === "quote" && (
                          <>
                            <span>Quote post</span>
                            <FontAwesomeIcon icon={faQuoteRight} />
                          </>
                        )}

                        {postType === "original" && (
                          <>
                            <span>Post</span>
                            <FontAwesomeIcon icon={faComment} />
                          </>
                        )}
                      </Stack>
                    </Typography>

                    <TweetPreview
                      item={item}
                      postType={postType}
                      tweetMeta={tweetMeta}
                      profileHandle={profileHandle}
                      profileName={profileName}
                      username={username}
                      imageUrl={imageUrl}
                    />

                    <Typography
                      variant="caption"
                      sx={{ color: "#6B7280", fontWeight: 600 }}
                      className="motive-title"
                    >
                      Motive
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      className="motive-text"
                    >
                      {item.rationale}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "row", md: "column" },
                      alignItems: { xs: "center", md: "flex-end" },
                      justifyContent: {
                        xs: "flex-start",
                        md: "space-between",
                      },
                      gap: { xs: 2, md: 1.5 },
                      alignSelf: { xs: "auto", md: "stretch" },
                      borderLeft: { xs: "none", md: "1px solid #DADADA" },
                      borderTop: { xs: "1px solid #DADADA", md: "none" },
                      pt: { xs: 2, md: 0 },
                      mt: { xs: 2, md: 0 },
                      pl: { xs: 0, md: 3 },
                    }}
                  >
                    <Checkbox
                      checked={selectedIds.has(item.tweet_id)}
                      onChange={() => onToggleItemSelected(item.tweet_id)}
                      disableRipple
                      disabled={allRemoved}
                      icon={<Box sx={checkboxBoxStyles} />}
                      checkedIcon={
                        <Box
                          sx={{
                            ...checkboxBoxStyles,
                            padding: "1px",
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="60%"
                            height="60%"
                            viewBox="0 0 9 8"
                            preserveAspectRatio="xMidYMid meet"
                            style={{ scale: "1.4" }}
                          >
                            <path
                              d="M8.15203 0.116482C8.42016 0.311482 8.48016 0.686482 8.28516 0.954607L3.48516 7.55461C3.38203 7.69711 3.22266 7.78523 3.04641 7.80023C2.87016 7.81523 2.69953 7.74961 2.57578 7.62586L0.175781 5.22586C-0.0585938 4.99148 -0.0585938 4.61086 0.175781 4.37648C0.410156 4.14211 0.790781 4.14211 1.02516 4.37648L2.92828 6.27961L7.31578 0.247732C7.51078 -0.0203928 7.88578 -0.0803929 8.15391 0.114607L8.15203 0.116482Z"
                              fill="#0F0F0F"
                            />
                          </svg>
                        </Box>
                      }
                      sx={{
                        p: 0,
                        "& .MuiSvgIcon-root": { display: "none" },
                      }}
                    />

                    {postType === "repost" ? (
                      <Button
                        variant="contained"
                        size="small"
                        endIcon={<FontAwesomeIcon icon={faArrowRotateLeft} />}
                        sx={{
                          textTransform: "none",
                          borderRadius: 999,
                          fontSize: 13,
                          bgcolor: "#DC2626",
                          "&:hover": { bgcolor: "#B91C1C" },
                          ml: { xs: "auto", md: 0 },
                        }}
                        className="post-button"
                        disabled={allRemoved}
                        onClick={() => setSingleConfirmId(item.tweet_id)}
                      >
                        Undo repost
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        endIcon={<FontAwesomeIcon icon={faTrash} />}
                        sx={{
                          textTransform: "none",
                          borderRadius: 999,
                          fontSize: 13,
                          bgcolor: "#DC2626",
                          "&:hover": { bgcolor: "#B91C1C" },
                          ml: { xs: "auto", md: 0 },
                        }}
                        className="post-button"
                        disabled={allRemoved}
                        onClick={() => setSingleConfirmId(item.tweet_id)}
                      >
                        Delete post
                      </Button>
                    )}
                  </Box>
                </Paper>
              );
            })}
          </>
        )}
      </Box>
    </Paper>
  );
};

export default ActionPanelWithTweets;