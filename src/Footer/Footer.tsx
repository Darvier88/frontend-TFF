import * as React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Divider,
  Grid,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material";
import whiteLogo from "../assets/tff_logo_white.svg";

type FooterLink = { label: string; href: string };

interface FooterProps {
  brand?: string;
  tagline?: string;
  productLinks?: FooterLink[];
  companyLinks?: FooterLink[];
  year?: number;
  companyName?: string;
}

const defaultProduct: FooterLink[] = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faqs" },
  { label: "My Dashboard", href: "/connect" },
];

const defaultCompany: FooterLink[] = [
  { label: "About", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
];

export const Footer: React.FC<FooterProps> = ({
  brand = "AI Background Checker",
  tagline = "Control your digital past with AI-powered analysis. Protect your reputation and career.",
  productLinks = defaultProduct,
  companyLinks = defaultCompany,
  year = new Date().getFullYear(),
  companyName = "The Future Forward",
}) => {

  const handleScroll = (
    event: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>,
    href: string
  ) => {
    event.preventDefault();

    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (!el) return;

    const headerOffset = 72;
    const targetY =
      el.getBoundingClientRect().top + window.scrollY - headerOffset;

    const startY = window.scrollY;
    const distance = targetY - startY;

    const duration = 2000;
    let startTime: number | null = null;

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animateScroll = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      window.scrollTo(0, startY + distance * eased);

      if (elapsed < duration) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#010409 !important",
        color: "#fff",
        pt: { xs: 6, md: 8 },
        pb: 2,
        px: 4
      }}
    >
      <Container maxWidth={false} className="footer-container">
        <Grid container spacing={{ xs: 4, md: 6 }} justifyContent="space-between">
          <Grid className="footer-logo-container">
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                    component="img"
                    src={whiteLogo}
                    alt="AI Checker white logo"
                    sx={{
                        width: 24,
                        height: 24,
                        display: "block",
                        objectFit: "contain",
                        flexShrink: 0
                    }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600 }} className="footer-logo-text">
                  {brand}
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.72)", maxWidth: 560,}}
                className="footer-subtext footer-tagline"
              >
                {tagline}
              </Typography>
            </Stack>
          </Grid>


          {/* Product */}
          <Grid className="footer-cat-container">
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "rgba(255,255,255,0.88)" }}
              className="footer-title"
            >
              Product
            </Typography>
            <Stack spacing={1}>
              {productLinks.map((l) =>
                l.href.startsWith("#") ? (
                  <MuiLink
                    key={l.label}
                    href={l.href}
                    component="a"
                    underline="none"
                    color="rgba(255,255,255,0.72)"
                    sx={{
                      "&:hover": { color: "rgba(255,255,255,0.95)" },
                      fontSize: 14,
                    }}
                    className="footer-subtext"
                    onClick={(e) => handleScroll(e, l.href)}
                  >
                    {l.label}
                  </MuiLink>
                ) : (
                  <MuiLink
                    key={l.label}
                    component={RouterLink}
                    to={l.href}
                    underline="none"
                    color="rgba(255,255,255,0.72)"
                    sx={{
                      "&:hover": { color: "rgba(255,255,255,0.95)" },
                      fontSize: 14,
                    }}
                    className="footer-subtext"
                  >
                    {l.label}
                  </MuiLink>
                )
              )}
            </Stack>
          </Grid>

          {/* Company */}
          <Grid className="footer-cat-container">
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 0, color: "rgba(255,255,255,0.88)" }}
              className="footer-title"
            >
              Company
            </Typography>
            <Stack spacing={1}>
              {companyLinks.map((l) =>
                l.href.startsWith("#") ? (
                  <MuiLink
                    key={l.label}
                    href={l.href}
                    component="a"
                    underline="none"
                    color="rgba(255,255,255,0.72)"
                    sx={{
                      "&:hover": { color: "rgba(255,255,255,0.95)" },
                      fontSize: 14,
                    }}
                    className="footer-subtext"
                    onClick={(e) => handleScroll(e, l.href)}
                  >
                    {l.label}
                  </MuiLink>
                ) : (
                  <MuiLink
                    key={l.label}
                    component={RouterLink}
                    to={l.href}
                    underline="none"
                    color="rgba(255,255,255,0.72)"
                    sx={{
                      "&:hover": { color: "rgba(255,255,255,0.95)" },
                      fontSize: 14,
                    }}
                    className="footer-subtext"
                  >
                    {l.label}
                  </MuiLink>
                )
              )}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ mt: 6, mb: 1, borderColor: "rgba(255,255,255,0.12)" }} />
        <Typography
          variant="caption"
          sx={{ display: "block", color: "rgba(255,255,255,0.6)" }}
          className="footer-subtext"
        >
          © {year} {companyName}. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
