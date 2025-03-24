import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/smooth-scroll.css"; // Added based on changes

import { preventKeyboardShortcuts } from './lib/security';

// Load Fluid Player script
const fluidPlayerScript = document.createElement('script');
fluidPlayerScript.src = 'https://cdn.fluidplayer.com/v3/current/fluidplayer.min.js';
fluidPlayerScript.async = true;
document.head.appendChild(fluidPlayerScript);

// Activate keyboard shortcut prevention when the app starts
document.addEventListener('DOMContentLoaded', () => {
  preventKeyboardShortcuts();
});

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