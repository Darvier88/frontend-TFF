import * as React from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Link as MuiLink,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  Slide,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Link as RouterLink } from "react-router-dom";

import logoUrl from "../assets/tff_logo.svg";

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  brand?: string;
  cta?: {
    label: string;
    href: string;
  };
}

const NAV_ITEMS: NavItem[] = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQs", href: "#faqs" },
];

export const Navbar: React.FC<NavbarProps> = ({
  brand = "AI Checker",
  cta = { label: "Get started", href: "#get-started" },
}) => {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width:1024px)");

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
    <>
      <AppBar
        id="header-menu"
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(255,255,255,0.9)",
          backdropFilter: "saturate(120%) blur(8px)",
          color: "text.primary",
        }}
      >
        <Container disableGutters maxWidth={false}>
          <Toolbar sx={{ minHeight: 64, px: 2 }}>
            {/* Brand */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              component={MuiLink}
              underline="none"
              sx={{
                color: "inherit",
                flexShrink: 0,
                "&:hover": { color: "#222" },
              }}
            >
              <Box
                component="img"
                src={logoUrl}
                alt="AI Checker logo"
                sx={{
                  width: 24,
                  height: 24,
                  display: "block",
                  objectFit: "contain",
                  flexShrink: 0,
                }}
                className="logo-box"
              />
              <Typography className="logo-label">{brand}</Typography>
            </Stack>

            <Box sx={{ flexGrow: 1 }} />

            {isDesktop ? (
              <Stack direction="row" spacing={4} alignItems="center">
                {NAV_ITEMS.map((item) => (
                  <MuiLink
                    key={item.label}
                    href={item.href}
                    underline="none"
                    className="menu-labels"
                    onClick={(e) => handleScroll(e, item.href)}
                  >
                    {item.label}
                  </MuiLink>
                ))}
                <Button
                  component={RouterLink}
                  to="/connect"
                  variant="contained"
                  size="small"
                  className="button-text button-box"
                  sx={{ textTransform: "none" }}
                >
                  {cta.label}
                </Button>
              </Stack>
            ) : (
              <IconButton
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((prev) => !prev)}
                edge="end"
                size="large"
              >
                {open ? <CloseRoundedIcon stroke="#0A0A0A" stroke-width="0.4"/> : <MenuRoundedIcon stroke="#0A0A0A" stroke-width="0.4"/>}
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {!isDesktop && !open && (
        <Divider sx={{ borderColor: "rgba(0,0,0,0.06)" }} />
      )}

      {!isDesktop && (
        <Slide
          in={open}
          direction="down"
          mountOnEnter
          unmountOnExit
          timeout={{ enter: 1000, exit: 1000 }}
        >
          <Box
            sx={(theme) => ({
              position: "fixed",
              top: 65,
              left: 0,
              right: 0,
              zIndex: theme.zIndex.appBar - 1, 
              bgcolor: "rgba(255,255,255,0.98)",
              borderBottom: "1px solid",
              borderColor: "divider",
              maxHeight: "calc(100vh - 64px)",
              overflowY: "auto",
            })}
          >
            <List sx={{ p: 0 }}>
              {NAV_ITEMS.map((item) => (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton
                    component="a"
                    href={item.href}
                    onClick={(e) => {
                      handleScroll(e, item.href);
                      setOpen(false);
                    }}
                  >
                    <ListItemText
                      primaryTypographyProps={{
                        fontSize: 16,
                        className: "menu-labels",
                      }}
                      primary={item.label}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Slide>
      )}

    </>
  );
};
