import * as React from "react";
import {
  Box,
  Container,
  Stack,
  Typography,
  SvgIcon,
} from "@mui/material";

interface HeroProps {
  title?: string;
  subtitle?: string;
  scrollTargetId?: string;
  minHeight?: string | number;
}

export const Hero: React.FC<HeroProps> = ({
  title = "CONTROL YOUR DIGITAL PAST",
  subtitle = "Smart and secure",
  minHeight = "88vh",
}) => {
  const Arrow = (
    <SvgIcon>
      <path d="M12 15.5 5.5 9l1.4-1.4L12 12.7l5.1-5.1L18.5 9 12 15.5z" />
    </SvgIcon>
  );

  return (
    <Box component="section" sx={{ bgcolor: "background.default" }} className="hero-box">
      <Container
        maxWidth="md"
        sx={{
          minHeight,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          py: { xs: 8, md: 10 },
        }}
      >
        <Stack alignItems="center" spacing={3}>
          <Typography
            variant="h2"
            className="section-title-hero"
          >
            {title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" className="section-subtitle-hero hero-subtitle">
            {subtitle}
          </Typography>

          {/*<MovingCards />*/}
          <div className="hero-video-wrapper">
            <video
              className="hero-video"
              src="/videos/moving-cards.mp4"
              autoPlay
              loop
              muted
              playsInline
            ></video>
          </div>

          <Box
            className="scroll-comp"
            sx={{
              mt: 6,
              borderRadius: 2,
              px: 1.5,
              py: 1,
              color: "text.secondary",
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{ letterSpacing: 1.2, mb: 0.5, color: "text.secondary" }}
            >
              SCROLL
            </Typography>
            {Arrow}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default Hero;
