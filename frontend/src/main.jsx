import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AdminAuthProvider } from "./context/AdminAuthContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CVAnalysisProvider } from "./context/CVAnalysisContext.jsx";
import { PracticeProvider } from "./context/PracticeContext.jsx";
import { PreferencesProvider } from "./context/PreferencesContext.jsx";
import "./i18n.js";
import "./styles/index.css";

import ErrorBoundary from "./components/ErrorBoundary.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <PreferencesProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <CVAnalysisProvider>
              <PracticeProvider>
                <ErrorBoundary>
                  <App />
                </ErrorBoundary>
              </PracticeProvider>
            </CVAnalysisProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </PreferencesProvider>
    </BrowserRouter>
  </React.StrictMode>
);
