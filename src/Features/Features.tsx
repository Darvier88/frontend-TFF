import * as React from "react";
import {
  Box,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";


import poweredLogo from "../assets/powered-analysis.svg";
import riskLogo from "../assets/risk-categorization.svg";
import deleteLogo from "../assets/bulk-delete.svg";

type FeatureItem = {
  title: string;
  description: string;
  image?: string;
};

interface FeaturesProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: FeatureItem[];
}

const defaults: FeatureItem[] = [
  {
    title: "AI-Powered Analysis",
    description:
      "Our advanced machine learning scans your entire post history to identify potentially problematic content that could impact your reputation or career.",
    image: poweredLogo,
  },
  {
    title: "Risk Categorization",
    description:
      "Every post is intelligently sorted into high, medium, or low risk with clear explanations so you understand exactly what needs attention.",
    image: riskLogo,
  },
  {
    title: "Bulk Delete Options",
    description:
      "Take control with one-click bulk deletion or carefully review and remove posts individually. Your digital footprint, your choice.",
    image: deleteLogo,
  },
];
 
export const Features: React.FC<FeaturesProps> = ({
  id = "features",
  eyebrow = "Features",
  title = "CLEAN UP WHAT NO LONGER REPRESENTS YOU",
  subtitle = "Powerful tools designed to help you manage your online presence with confidence",
  items = defaults,
}) => {
  return (
    <Box component="section" id={id} sx={{ py: { xs: 8, md: 12 } }} className="features-box">
      <Container maxWidth="lg">
        <Stack alignItems="center" textAlign="center" spacing={1} mb={{ xs: 4, md: 10 }}>
          <Chip className="chips" label={eyebrow} size="small" sx={{ fontWeight: 600, borderRadius: "999px" }} />
          <Typography
            variant="h3"
            className="section-title"
            sx={{ fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}
          >
            {title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 820 }} className="section-subtitle">
            {subtitle}
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 2.5, md: 3.5 }} justifyContent="center">
          {items.map(({ title, description, image }, i) => (
            <Grid key={i} >
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 3,
                  height: "100%",
                }}
                className="feature-card"
              >
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: "grey.100",
                      color: "text.secondary",
                      display: "grid",
                      placeItems: "center",
                    }}
                    className="feature-card-logo"
                  >
                    <Box
                      component="img"
                      src={image}
                      alt={title}
                      sx={{ width: 40, height: 40, objectFit: "contain" }}
                    />
                    
                  </Box>

                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }} className="feature-card-title">
                    {title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" className="feature-card-text" >
                    {description}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Features;
