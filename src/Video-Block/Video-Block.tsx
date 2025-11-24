import * as React from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import macbookFrame from "../assets/macbook-frame.png";
import sampleVideo from "../assets/sample-video.mp4";

interface VideoBlockProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  screenshotUrl?: string;
  videoUrl?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({
  eyebrow = "Try It Free",
  title = "CONTROL YOUR DIGITAL PAST",
  subtitle = "Connect your account, we will create your own personal dashboard with AI for you to check, understand and remove everything you need.",
  screenshotUrl = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop",
  videoUrl = sampleVideo,
  ctaLabel = "Get started",
}) => {
  return (
    <Box
      component="section"
      sx={{
        bgcolor: "grey.50",
        pt: { xs: 8, md: 12.5 },
        pb: { xs: 8, md: 8 },
      }}
    >
      <Container maxWidth="md">
        <Stack alignItems="center" textAlign="center" spacing={1}>
          <Chip
            className="chips"
            label={eyebrow}
            size="small"
            sx={{ fontWeight: 600, borderRadius: "999px" }}
          />
          <Typography
            variant="h3"
            className="section-title video-title"
            sx={{
              mt: 1,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ maxWidth: 720, mb: 2 }}
            className="section-subtitle video-subtitle"
          >
            {subtitle}
          </Typography>
        </Stack>

        <Box
          sx={{
            position: "relative",
            mx: "auto",
            width: { xs: "100%", sm: 800 },
            maxWidth: 960,
            mt: { xs: 4, md: 6 },
          }}
        >
          <Box
            component="img"
            src={macbookFrame}
            alt="AI Checker dashboard on MacBook"
            sx={{
              width: "100%",
              display: "block",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              top: "5%",
              left: "12%",
              width: "76%",
              height: "77%",
              borderRadius: 1,
              overflow: "hidden",
              bgcolor: "black",
            }}
          >
            {videoUrl ? (
              <Box
                component="video"
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                poster={screenshotUrl}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <Box
                component="img"
                src={screenshotUrl}
                alt="App preview"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            )}
          </Box>
        </Box>

        {/* CTA */}
        <Stack
          alignItems="center"
          sx={{ mt: { xs: 4, md: 4 }, mb: { xs: 4, md: 5.75 } }}
          className="button-box-video"
        >
          <Button
            size="large"
            variant="contained"
            component={RouterLink}
            to="/connect"
            sx={{
              bgcolor: "common.black",
              "&:hover": { bgcolor: "grey.900" },
              borderRadius: 2,
              px: 4,
              py: 1.2,
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              textTransform: "none",
            }}
            className="button-text button-box"
          >
            {ctaLabel}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default VideoBlock;