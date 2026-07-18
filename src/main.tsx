import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import QueryProvider from "./components/providers/QueryProvider";
import ToastViewport from "./components/ui/ToastViewport";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <ToastViewport />
      <App />
    </QueryProvider>
  </React.StrictMode>,
);
