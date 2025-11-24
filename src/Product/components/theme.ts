import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#000000" },
    secondary: { main: "#6b7280" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 8 },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          "&.Mui-focusVisible": {
            outline: "none",
            boxShadow: "none",
          },
          "&:focus": {
            outline: "none",
            boxShadow: "none",
          },
        },
      },
    },
  },
  typography: {
    fontFamily: `"Inter", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
    fontSize: 14,
  },
});
