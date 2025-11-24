import * as React from "react";
import {
  Paper,
  Stack,
  Typography,
  Checkbox,
  Box,
  useMediaQuery,
} from "@mui/material";

import Tooltip, {
  tooltipClasses,
  type TooltipProps,
} from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faChevronDown,
  faChevronUp,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

type RiskLevel = "high" | "mid" | "low";
type PostTypeKey = "original" | "reply" | "quote" | "repost";

interface RiskFilters {
  high: boolean;
  mid: boolean;
  low: boolean;
}

interface RiskCounts {
  high: number;
  mid: number;
  low: number;
}

interface PostTypeFilters {
  original: boolean;
  reply: boolean;
  quote: boolean;
  repost: boolean;
}

interface PostTypeCounts {
  original: number;
  reply: number;
  quote: number;
  repost: number;
}

interface FiltersSidebarProps {
  contentLabels: string[];
  contentFilters: Record<string, boolean>;
  toggleContentFilter: (label: string) => void;
  formatLabel: (label: string) => string;

  riskFilters: RiskFilters;
  riskCounts: RiskCounts;
  toggleRiskFilter: (level: RiskLevel) => void;

  postTypeFilters: PostTypeFilters;
  togglePostTypeFilter: (type: PostTypeKey) => void;
  postTypeCounts: PostTypeCounts;
}

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  contentLabels,
  contentFilters,
  toggleContentFilter,
  formatLabel,
  riskFilters,
  riskCounts,
  toggleRiskFilter,
  postTypeFilters,
  togglePostTypeFilter,
  postTypeCounts,
}) => {
  const isDesktop = useMediaQuery("(min-width:900px)");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleToggleMobile = () => {
    if (!isDesktop) {
      setMobileOpen((prev) => !prev);
    }
  };

  // ---------- DESKTOP ----------
  if (isDesktop) {
    return (
      <Paper
        elevation={0}
        sx={{
          width: 260,
          borderRadius: 4,
          p: 3,
          border: "1px solid #E5E7EB",
          bgcolor: "#FFF",
          position: "sticky",
          alignSelf: "flex-start",
          top: 0,
          height: "100%",
        }}
        className="filters-container paper-filters"
      >
        <Stack direction="row" spacing={1} alignItems="center" mb={4}>
          <FontAwesomeIcon
            icon={faFilter}
            style={{ fontSize: 16, color: "#000" }}
          />
          <Typography fontWeight={600} className="filter-title">
            Filters
          </Typography>
        </Stack>

        <FiltersContent
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
      </Paper>
    );
  }

  // ---------- MOBILE ----------
  return (
    <>
      <Paper
        elevation={0}
        sx={{
          mt: 1,
          width: "56%",
          borderRadius: "16px",
          px: 2.5,
          py: 1.5,
          border: "1px solid #E5E7EB",
          bgcolor: "#FFF",
          mb: 2,
        }}
        onClick={handleToggleMobile}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <FontAwesomeIcon
              icon={faFilter}
              style={{ fontSize: 16, color: "#000" }}
            />
            <Typography fontWeight={600} className="filter-title">
              Filters
            </Typography>
          </Stack>
          <FontAwesomeIcon
            icon={mobileOpen ? faChevronUp : faChevronDown}
            style={{ fontSize: 14, color: "#6B7280" }}
          />
        </Stack>
      </Paper>

      {mobileOpen && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(15,23,42,0.35)",
            zIndex: 1299,
          }}
          onClick={handleToggleMobile}
        >
          <Paper
            elevation={2}
            sx={{
              position: "absolute",
              left: 20,
              right: 16,
              top: 82,
              borderRadius: 20,
              p: 3,
              border: "1px solid #E5E7EB",
              bgcolor: "#FFF",
              maxHeight: "calc(100vh - 120px)",
              overflowY: "auto",
            }}
            className="filters-container paper-filters"
            onClick={(e) => e.stopPropagation()}
          >
            <Stack
              direction="row"
              alignItems="center"
              mb={3}
              sx={{ width: "100%" }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ flexGrow: 1, pl: 0.5 }}
              >
                <FontAwesomeIcon
                  icon={faFilter}
                  style={{ fontSize: 16, color: "#000" }}
                />
                <Typography fontWeight={600} className="filter-title">
                  Filters
                </Typography>
              </Stack>
              <FontAwesomeIcon
                icon={faXmark}
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  cursor: "pointer",
                  marginRight: "4px",
                }}
                onClick={handleToggleMobile}
              />
            </Stack>

            <FiltersContent
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
          </Paper>
        </Box>
      )}
    </>
  );
};

interface FiltersContentProps {
  contentLabels: string[];
  contentFilters: Record<string, boolean>;
  toggleContentFilter: (label: string) => void;
  formatLabel: (label: string) => string;

  riskFilters: RiskFilters;
  riskCounts: RiskCounts;
  toggleRiskFilter: (level: RiskLevel) => void;

  postTypeFilters: PostTypeFilters;
  togglePostTypeFilter: (type: PostTypeKey) => void;
  postTypeCounts: PostTypeCounts;
}

const FiltersContent: React.FC<FiltersContentProps> = ({
  contentLabels,
  contentFilters,
  toggleContentFilter,
  formatLabel,
  riskFilters,
  riskCounts,
  toggleRiskFilter,
  postTypeFilters,
  togglePostTypeFilter,
  postTypeCounts,
}) => {
  const hasAnyRisk =
    (riskCounts.high || 0) +
      (riskCounts.mid || 0) +
      (riskCounts.low || 0) >
    0;

  return (
    <>
      {/* Content */}
      <Typography
        variant="caption"
        sx={{ color: "#9CA3AF" }}
        className="filter-title-label"
      >
        Content
      </Typography>
      <Stack
        spacing={1}
        borderBottom="1px solid #D1D5DB"
        marginBottom="28px"
        width="100%"
        paddingBottom="28px"
      >
        {contentLabels.map((label) => (
          <FilterCheck
            key={label}
            label={formatLabel(label)}
            checked={contentFilters[label] ?? true}
            onChange={() => toggleContentFilter(label)}
            disabled={!hasAnyRisk}
          />
        ))}
      </Stack>

      {/* Risk */}
      <Typography
        variant="caption"
        sx={{ color: "#9CA3AF" }}
        className="filter-title-label"
      >
        Risk
      </Typography>
      <Stack
        spacing={0.5}
        borderBottom="1px solid #D1D5DB"
        marginBottom="28px"
        width="100%"
        paddingBottom="28px"
      >
        <FilterCheck
          label="High"
          checked={riskFilters.high}
          onChange={() => toggleRiskFilter("high")}
          disabled={riskCounts.high === 0}
          tooltipText={
            riskCounts.high === 0
              ? "You don't have any High Risk posts"
              : undefined
          }
        />
        <FilterCheck
          label="Mid"
          checked={riskFilters.mid}
          onChange={() => toggleRiskFilter("mid")}
          disabled={riskCounts.mid === 0}
          tooltipText={
            riskCounts.mid === 0
              ? "You don't have any Medium Risk posts"
              : undefined
          }
        />
        <FilterCheck
          label="Low"
          checked={riskFilters.low}
          onChange={() => toggleRiskFilter("low")}
          disabled={riskCounts.low === 0}
          tooltipText={
            riskCounts.low === 0
              ? "You don't have any Low Risk posts"
              : undefined
          }
        />
      </Stack>

      {/* Posts type */}
      <Typography
        variant="caption"
        sx={{ color: "#9CA3AF" }}
        className="filter-title-label"
      >
        Posts type
      </Typography>
      <Stack spacing={0.5}>
        <FilterCheck
          label="Original Post"
          checked={postTypeFilters.original}
          onChange={() => togglePostTypeFilter("original")}
          disabled={postTypeCounts.original === 0}
        />
        <FilterCheck
          label="Reply"
          checked={postTypeFilters.reply}
          onChange={() => togglePostTypeFilter("reply")}
          disabled={postTypeCounts.reply === 0}
        />
        <FilterCheck
          label="Quote post"
          checked={postTypeFilters.quote}
          onChange={() => togglePostTypeFilter("quote")}
          disabled={postTypeCounts.quote === 0}
        />
        <FilterCheck
          label="Repost"
          checked={postTypeFilters.repost}
          onChange={() => togglePostTypeFilter("repost")}
          disabled={postTypeCounts.repost === 0}
        />
      </Stack>
    </>
  );
};

// --- Checkbox custom ---

interface FilterCheckProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  tooltipText?: string;
}

const FilterTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#0F0F0F",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 500,
    borderRadius: "8px",
    padding: "12px",
    boxShadow: "0 8px 16px -2px rgba(27, 33, 44, 0.12)",
    right: "60px",
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: "#0F0F0F",
  },
}));

const FilterCheck: React.FC<FilterCheckProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  tooltipText,
}) => {
  const isDesktop = useMediaQuery("(min-width:900px)");

  const enabledBoxStyles = {
    width: 12,
    height: 12,
    borderRadius: "2px",
    border: "1px solid #0F0F0F",
    background: "#FFF",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const disabledBoxStyles = {
    width: 12,
    height: 12,
    borderRadius: "2px",
    border: "1px solid #7C7C7C",
    background: "#D1D1D1",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const CustomCheckbox = (
    <Checkbox
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      disableRipple
      icon={<Box sx={disabled ? disabledBoxStyles : enabledBoxStyles} />}
      checkedIcon={
        <Box sx={disabled ? disabledBoxStyles : enabledBoxStyles}>
          {!disabled && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="8"
              height="6.5"
              viewBox="0 0 8 8"
              style={{ transform: "scale(1.3)" }}
              fill="none"
            >
              <path
                d="M8.15203 0.116482C8.42016 0.311482 8.48016 0.686482 8.28516 0.954607L3.48516 7.55461C3.38203 7.69711 3.22266 7.78523 3.04641 7.80023C2.87016 7.81523 2.69953 7.74961 2.57578 7.62586L0.175781 5.22586C-0.0585938 4.99148 -0.0585938 4.61086 0.175781 4.37648C0.410156 4.14211 0.790781 4.14211 1.02516 4.37648L2.92828 6.27961L7.31578 0.247732C7.51078 -0.0203928 7.88578 -0.0803929 8.15391 0.114607L8.15203 0.116482Z"
                fill="#0F0F0F"
              />
            </svg>
          )}
        </Box>
      }
      sx={{
        p: 0,
        "& .MuiSvgIcon-root": { display: "none" },
      }}
    />
  );

  const row = (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ pointerEvents: disabled ? "none" : "auto" }}
    >
      {CustomCheckbox}
      <Typography fontSize={12} sx={{ color: "#000" }}>
        {label}
      </Typography>
    </Stack>
  );

  if (tooltipText && disabled && isDesktop) {
    return (
      <FilterTooltip title={tooltipText} placement="top">
        <span style={{ display: "inline-block" }}>{row}</span>
      </FilterTooltip>
    );
  }

  return row;
};

export default FiltersSidebar;
