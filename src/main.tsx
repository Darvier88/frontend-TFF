import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";

import App from "./App";
import { theme } from "./Product/components/theme";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root not found.");

import { StyledEngineProvider } from "@mui/material/styles";

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </StyledEngineProvider>
  </React.StrictMode>
);

