import * as React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import {
  type RiskItem,
  type PostType,
  type TweetMeta,
  parseRetweetText,
  extractUrlsFromText,
  stripUrlsFromText,
} from "../data/types";

interface TweetPreviewProps {
  item: RiskItem;
  postType: PostType;
  tweetMeta?: TweetMeta;
  profileName: string;
  profileHandle: string;
  username: string;
  imageUrl: string;
}

const TWITTER_EPOCH_MS = 1288834974657;

function getTweetDateLabel(tweetMeta?: TweetMeta, item?: RiskItem): string | null {
  let date: Date | null = null;

  if (tweetMeta?.created_at) {
    const d = new Date(tweetMeta.created_at);
    if (!Number.isNaN(d.getTime())) {
      date = d;
    }
  }

  if (!date && item?.tweet_id) {
    const idNum = Number(item.tweet_id);
    if (Number.isFinite(idNum)) {
      const ms = Math.floor(idNum / 2 ** 22) + TWITTER_EPOCH_MS;
      const d = new Date(ms);
      if (!Number.isNaN(d.getTime())) {
        date = d;
      }
    }
  }

  if (!date) return null;

  const meses = [
    "ene.",
    "feb.",
    "mar.",
    "abr.",
    "may.",
    "jun.",
    "jul.",
    "ago.",
    "sep.",
    "oct.",
    "nov.",
    "dic.",
  ];

  return `${date.getDate()} ${meses[date.getMonth()]} ${date.getFullYear()}`;
}

const TweetPreview: React.FC<TweetPreviewProps> = ({
  item,
  postType,
  tweetMeta,
  profileName,
  profileHandle,
  username,
  imageUrl,
}) => {
  const baseText =
    (tweetMeta?.text && tweetMeta.text.trim().length > 0
      ? tweetMeta.text
      : item.text || ""
    ).trim();

  const rtInfo = parseRetweetText(baseText);

  const effectiveIsRetweet =
    tweetMeta?.is_retweet !== undefined
      ? tweetMeta.is_retweet
      : item.is_retweet ?? false;

  const isRepost =
    postType === "repost" || !!rtInfo || effectiveIsRetweet;

  const mainTextSource = isRepost && rtInfo ? rtInfo.body : baseText;

  let mediaUrls: string[] = [];

  if (Array.isArray(tweetMeta?.media) && tweetMeta.media.length > 0) {
    mediaUrls = tweetMeta.media;
  } else {
    mediaUrls = extractUrlsFromText(mainTextSource || baseText);
  }

  const mainText = stripUrlsFromText(mainTextSource || baseText);

  const isReply = postType === "reply" || /^@[\w_]+/.test(baseText);
  const replyMatch = /^@([\w_]+)/.exec(baseText);

  const baseHandle = (profileHandle || username || "@user").replace(/^@/, "");

  const rtHandle = rtInfo ? rtInfo.handle.replace(/^@/, "") : null;

  const tweetDisplayName = rtHandle || profileName || baseHandle;
  const tweetDisplayHandle = rtHandle
    ? `@${rtHandle}`
    : profileHandle || `@${baseHandle}`;

  const createdAtLabel = getTweetDateLabel(tweetMeta, item);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #E5E7EB",
        bgcolor: "#FFFFFF",
        p: 1.5,
        mt: 0.5,
        mb: 1.875,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        mb={0.5}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent={{ xs: "flex-start", sm: "space-between" }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ width: "100%" }}
        >
          {/* Avatar */}
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              flexShrink: 0,
            }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              gap: { xs: 0.25, sm: 1 },
              flexWrap: "wrap",
            }}
          >
            <Typography
              fontWeight={600}
              fontSize={14}
              className="display-name"
            >
              {tweetDisplayName}
            </Typography>

            <Typography
              fontSize={13}
              color="text.secondary"
              className="display-handle"
            >
              {tweetDisplayHandle}
            </Typography>

            {createdAtLabel && (
              <Typography
                fontSize={13}
                color="text.secondary"
                className="tweet-date"
                sx={{ whiteSpace: "nowrap" }}
              >
                {createdAtLabel}
              </Typography>
            )}
          </Box>
        </Stack>
      </Stack>

      {isReply && replyMatch && (
        <Typography variant="caption" sx={{ color: "#6B7280", mb: 0.5 }}>
          Replying to @{replyMatch[1]}
        </Typography>
      )}

      {mainText && (
        <Typography fontSize={14} sx={{ whiteSpace: "pre-line" }}>
          {mainText}
        </Typography>
      )}

      {mediaUrls.length > 0 && (
        <Box
          sx={{
            mt: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {mediaUrls.map((url, i) => (
            <Box
              key={url + i}
              component="img"
              src={url}
              alt="Attached media"
              sx={{
                borderRadius: 3,
                width: "100%",
                maxHeight: 380,
                objectFit: "cover",
                bgcolor: "#E5E7EB",
                border: "1px solid #E5E7EB",
              }}
            />
          ))}
        </Box>
      )}

      {mediaUrls.length === 0 && /attached media/i.test(baseText) && (
        <Box
          sx={{
            mt: 1.5,
            borderRadius: 3,
            width: "100%",
            height: 220,
            bgcolor: "#E5E7EB",
            border: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            color: "#6B7280",
            fontWeight: 500,
          }}
        >
          Attached media
        </Box>
      )}
    </Paper>
  );
};

export default TweetPreview;
