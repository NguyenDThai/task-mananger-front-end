import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./redux/store.ts";
import { RouterProvider } from "react-router-dom";
import { router } from "./route/index.tsx";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
      <App />
      <ToastContainer position="top-center" />
    </Provider>
  </StrictMode>,
);
