import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/smooth-scroll.css"; // Added based on changes
import { initScrollReveal } from "./utils/scrollReveal"; // Added based on changes
import { initScrollDetection } from "./utils/scrollDetection"; // Added based on changes
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Initialize scroll detection on application start
document.addEventListener("DOMContentLoaded", () => {
  // Initialize scroll detection
  initScrollDetection();

  // Initialize scroll reveal animations once DOM is fully loaded
  setTimeout(() => {
    initScrollReveal(".scroll-reveal", { threshold: 0.15, once: true });
  }, 100);
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);