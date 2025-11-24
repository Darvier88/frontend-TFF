import * as React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Container,
  Typography,
  Stack
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export type FaqItem = {
  question: string;
  answer: React.ReactNode;
  defaultExpanded?: boolean;
};

interface FaqProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: FaqItem[];
}

const defaultItems: FaqItem[] = [
  {
    question: "How does AI Background Checker work?",
    answer:
      "Connect your X/Twitter account and let our AI scan your posts. Select categories to check—Political, Controversial, Unprofessional, or Inappropriate—or add custom search terms.\n\nThe AI analyzes each tweet and flags problematic content with color-coded labels, tone indicators, and explanations for why it was flagged.\n\nReview the results and delete tweets individually or in bulk. You maintain complete control over what gets removed.",
  },
  {
    question: "Is my data stored or shared with third parties?",
    answer:
      "No. We do not store your tweets or share your data with third parties.\n\nThe AI analysis happens in real-time during your session. Once you close the app, nothing is retained. Your X/Twitter credentials are only used to access your account temporarily and are never saved.\n\nYou have complete privacy and control over your data.",
  },
  {
    question: "What happens after I make a payment?",
    answer:
      "After payment, we begin processing your account data to build your personalized dashboard. This analysis typically takes a few hours to complete.\n\nOnce ready, we'll send you an email notification with a link to access your results. Your dashboard will be available for 48 hours—this ensures we don't store your data long-term while giving you enough time to review and take action.\n\nAfter 48 hours, the dashboard and all associated data are permanently deleted from our servers.",
  },
  {
    question: "What makes a post 'high risk'?",
    answer:
      `A post is flagged as high risk when it contains content that could significantly impact your professional reputation or opportunities. This includes:

        • Aggressive or hostile language toward individuals or groups
        • Extreme political statements or divisive rhetoric
        • Offensive, discriminatory, or inappropriate content
        • Posts that could be perceived as unprofessional in a work context
        
      Our AI evaluates the tone, context, and potential impact of each post. You'll see a detailed explanation for why each tweet received its risk rating, so you can make informed decisions about what to keep or delete.`,
  },
];

export const Faq: React.FC<FaqProps> = ({
  id = "faq",
  eyebrow = "FAQ",
  title = "FREQUENTLY ASKED QUESTIONS",
  subtitle = "Everything you need to know",
  items = defaultItems,
}) => {
  return (
    <Box component="section" id={id} sx={{ py: { xs: 8, md: 16 } }}>
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        <Stack alignItems="center" textAlign="center" spacing={1}>
          <Chip
            label={eyebrow}
            size="small"
            sx={{
              mb: 2,
              fontWeight: 600,
              letterSpacing: 0.4,
              borderRadius: "999px",
            }}
            className="chips"
          />
        </Stack>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            letterSpacing: 2,
            textTransform: "uppercase",
            mb: 1,
          }}
          className="section-title faq-title"
        >
          {title}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ color: "text.secondary", mb: { xs: 4, md: 6 } }}
          className="section-subtitle faq-subtitle"
        >
          {subtitle}
        </Typography>

        <Box
          sx={{
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
        {items.map((it) => (
          <Accordion
            key={it.question}
            defaultExpanded={!!it.defaultExpanded}
            disableGutters
            elevation={0}
            square
            className="faq-accordion"
            TransitionProps={{ timeout: 1500 }}
            sx={{
              "&:before": { display: "none" },
              boxShadow: "none",
              backgroundColor: "transparent",

              "& .MuiAccordionSummary-root": {
                px: 0,
                py: 2,
                borderBottom: "1px solid #E2E8F0",
                minHeight: "0 !important",
              },
              "& .MuiAccordionSummary-content": {
                margin: 0,
              },
              "& .MuiCollapse-root": {
                transitionDuration: "1500ms",
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              },
              "& .faq-slide": {
                transform: "translateY(-200px)",
                transition:
                  "transform 1500ms cubic-bezier(0.22, 1, 0.36, 1)",
              },
              "&.Mui-expanded .faq-slide": {
                transform: "translateY(0)",
              },

            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 600 }} className="faq-question">
                {it.question}
              </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ px: 0, pb: 3, pt: 0 }}>
              <Box sx={{ overflow: "hidden", pt: 2 }}>
                <Box className="faq-slide">
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    className="faq-response"
                    sx={{ whiteSpace: "pre-line" }}
                  >
                    {it.answer}
                  </Typography>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}

        </Box>
      </Container>
    </Box>
  );
};

export default Faq;
