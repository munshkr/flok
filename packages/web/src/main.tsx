import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./error-page";
import "./index.css";
import { loader as rootLoader } from "./routes/root";
import { webTargets } from "@/settings.json";

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    loader: rootLoader,
  },
  {
    path: "s/:name",
    lazy: () => import("./routes/session"),
  },
  ...webTargets.map((target) => ({
    path: `frames/${target}`,
    lazy: () => import(`./routes/frames/${target}.tsx`),
  })),
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </React.StrictMode>,
);
