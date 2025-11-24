import * as React from "react";
import {
  Avatar,
  Box,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

export type TestimonialItem = {
  quote: string;
  name: string;
  role: string;
  avatarUrl?: string;
};

interface TestimonialsProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: TestimonialItem[];
  greyBackground?: boolean;
}

const defaults: TestimonialItem[] = [
  {
    quote:
      "This tool saved my career. Found old controversial tweets I'd completely forgotten about before my background check.",
    name: "Sarah Chen",
    role: "Content Creator",
    avatarUrl:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=96&h=96&fit=crop&crop=faces",
  },
  {
    quote:
      "Super quick, clear risk levels, and incredibly easy to use. Deleted 50+ risky posts in minutes.",
    name: "Marcus Johnson",
    role: "Marketing Coordinator",
    avatarUrl:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=96&h=96&fit=crop&crop=faces",
  },
  {
    quote:
      "A must-have for anyone with a public social media presence. The AI explanations are spot-on.",
    name: "Emily Rodriguez",
    role: "Lawyer",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop&crop=faces",
  },
  {
    quote:
      "I appreciate the privacy focus and transparent pricing. No hidden fees, just results.",
    name: "David Park",
    role: "Political Advisor",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces",
  },
];

export const Testimonials: React.FC<TestimonialsProps> = ({
  id = "testimonials",
  eyebrow = "Testimonials",
  title = "TRUSTED BY MANY",
  subtitle = "See what our customers have to say",
  items = defaults,
  greyBackground = true,
}) => {
  return (
    <Box
      component="section"
      id={id}
      sx={{
        py: { xs: 8, md: 16 },
        pb: { xs: 8, md: 13 },
        bgcolor: greyBackground ? "grey.50" : "transparent",
      }}
    >
      <Container maxWidth="lg">
        <Stack alignItems="center" textAlign="center" spacing={1.2} mb={{ xs: 4, md: 8 }}>
          <Chip label={eyebrow} size="small" sx={{ fontWeight: 600, borderRadius: "999px" }}  className="chips"/>
          <Typography
            variant="h3"
            sx={{ fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}
            className="section-title"
          >
            {title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" className="section-subtitle">
            {subtitle}
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center" alignItems="center">
          {items.map((t) => (
            <Grid key={t.name}>
              <Paper
                variant="outlined"
                sx={{
                  borderColor: (th) => th.palette.divider,
                  borderRadius: 3,
                  p: { xs: 2.5, md: 3 },

                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                }}
                className="testimonial-card"
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" sx={{ color: "text.primary"}} className="testimonial-card-text">
                    “{t.quote}”
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{mb:{xs:2.5, md:0}}}>
                  <Avatar src={t.avatarUrl} alt={t.name} sx={{ width: 40, height: 40 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700 }} className="testimonial-card-name">{t.name}</Typography>
                    <Typography variant="body2" color="text.secondary" className="testimonial-card-job">
                      {t.role}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Testimonials;
