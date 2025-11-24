import * as React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

type Feature = string;

interface PricingCardProps {
  plan?: string;
  price?: number | string;
  period?: string;
  blurb?: string;
  features?: Feature[];
  ctaLabel?: string;
  onCtaClick?: () => void;
}

const defaultFeatures: Feature[] = [
  "Scan up to 10,000 posts",
  "Advanced AI insights",
  "Priority deletion",
  "Historical tracking",
  "Priority support",
];

export const Pricing: React.FC<PricingCardProps> = ({
  plan = "Pro",
  price = 30,
  period = "",
  blurb = "For power users",
  features = defaultFeatures,
  ctaLabel = "Get AI Checker",
  onCtaClick,
}) => {
  return (
    <Box component="section" sx={{ pt: { xs: 8, md: 16 }, pb: { xs: 8, md: 16.25 } }} id="pricing">
      <Container maxWidth="md" sx={{ textAlign: "center" }} >
        <Stack alignItems="center" textAlign="center" spacing={1}>
          <Chip
            label="Pricing"
            size="small"
            sx={{ mb: 2, fontWeight: 600, borderRadius: "999px" }}
            className="chips"
          />
        </Stack>
        <Typography
          variant="h3"
          className="section-title"
          sx={{
            fontWeight: 800,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          SIMPLE TRANSPARENT PRICING
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ pb: 8 }} className="section-subtitle pricing-subtitle">
          Choose the plan that fits your needs
        </Typography>

        <Paper
          elevation={0}
          className="pricing-card"
          sx={{
            mx: "auto",
            maxWidth: 440,
            textAlign: "left",
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            border: (t) => `1px solid ${t.palette.divider}`,
            boxShadow:
              "0 6px 20px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.06)",
          }}
        >
          <Typography variant="body2" color="text.secondary" className="pricing-text" sx={{mb:{xs:-2}}}>
            {plan}
          </Typography>

          <Stack direction="row" alignItems="baseline">
            <Typography variant="h3" sx={{ fontWeight: 800 }} className="pricing-price" >
              ${price}
            </Typography>
            {period && (
              <Typography color="text.secondary" fontWeight={500} className="pricing-text">
                {period}
              </Typography>
            )}
          </Stack>

          <Typography color="text.secondary" sx={{ mt: -2.5 }} className="pricing-blurb">
            {blurb}
          </Typography>

          <List dense disablePadding sx={{ mt:{xs:-3, md:1}}}>
            {features.map((f) => (
              <ListItem key={f} sx={{ px: 0}}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckRoundedIcon fontSize="small" sx={{ color: "#00A63E" }} />
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{ variant: "body2" }}
                  primary={f}
                  className="pricing-feature-list"
                />
              </ListItem>
            ))}
          </List>

          <Button
            fullWidth
            variant="contained"
            onClick={onCtaClick}
            component={RouterLink}
            to="/connect"
            sx={{
              textTransform: "none",
              mt:-1.2
            }}
            className="button-text button-box"
          >
            {ctaLabel}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default Pricing;
