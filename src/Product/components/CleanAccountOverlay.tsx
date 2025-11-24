// src/Product/components/CleanAccountOverlay.tsx
import * as React from "react";
import { Box, Paper, Typography, Button } from "@mui/material";

interface CleanAccountOverlayProps {
  open: boolean;
  onClose: () => void;
}

const CleanAccountOverlay: React.FC<CleanAccountOverlayProps> = ({
  open,
  onClose,
}) => {
  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: (theme) => theme.zIndex.modal + 1,
        display: "inline-flex;",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "rgba(0, 0, 0, 0.40)",
        padding: "292px 445px 284px 445px",
        flexShrink: 0,
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, md: 4 },
          maxWidth: 550,
          width: "100%",
          height: 236,
          textAlign: "center",
          borderRadius: "6px",
        }}
      >
        <Typography
          fontWeight={700}
          fontSize={28}
          mb={1.5}
        >
          It seems you have a clean account
        </Typography>

        <Typography fontSize={14} color="#0F0F0F" mb={3} fontWeight={400} >
          We analyzed your posts and found no risky content. You can check all your posts and the reason why they don’t represent any kind of risk.
        </Typography>

        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            mt: 1,
            textTransform: "none",
            borderRadius: "6px",
            px: 2,
            py: 1.5,
            bgcolor: "#0F0F0F"
          }}
          className="button-nothing"
        >
          I understand
        </Button>
      </Paper>
    </Box>
  );
};

export default CleanAccountOverlay;
