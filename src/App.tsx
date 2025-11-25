import { Routes, Route, Navigate } from "react-router-dom";

import BackgroundCheckerLanding from "./Lading";

import Connect from "./Product/HappyPath/Connect";
import Analyzing from "./Product/HappyPath/Analyzing";
import Dashboard from "./Product/HappyPath/Dashboard";
import OAuthCallback from "./Product/HappyPath/OAuthCallback";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BackgroundCheckerLanding />} />

      <Route path="/connect" element={<Connect />} />
      <Route path="/callback" element={<OAuthCallback />} />
      <Route path="/analyzing" element={<Analyzing />} />
      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}