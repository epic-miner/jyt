import { Route, Switch, Link } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NavBar from "./components/NavBar";
import { MobileNavBar } from "./components/MobileNavBar";
import ScrollToTop from "./components/ScrollToTop";
import { PageTransition } from "./components/PageTransition";
import { lazy, Suspense, useEffect } from "react";
import { initializeGlobalSecurity } from "./lib/security";
import { useConsoleProtection } from './hooks/useConsoleProtection';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ColorSchemeProvider } from './contexts/ColorSchemeContext';

// Lazy load page components for better performance and code splitting
const Home = lazy(() => import("./pages/Home"));
const AnimeDetails = lazy(() => import("./pages/AnimeDetails"));
const VideoPlayerPage = lazy(() => import("./pages/VideoPlayerPage"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const RecentlyWatched = lazy(() => import("./pages/RecentlyWatched"));
const GenrePage = lazy(() => import("./pages/GenrePage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const TestPlayerPage = lazy(() => import("./pages/TestPlayerPage"));
const NotFound = lazy(() => import("./pages/not-found"));

const queryClient = new QueryClient();

function App() {
  useConsoleProtection();
  // Initialize global security measures
  useEffect(() => {
    initializeGlobalSecurity();
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ColorSchemeProvider>
          <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-dark-950 to-dark-900 text-slate-50 font-sans">
            <NavBar />
            <main className="flex-grow relative">
              <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/60 mb-4"></div>
                  <div className="h-2 w-24 bg-primary/40 rounded"></div>
                </div>
              </div>
            }>
              <PageTransition>
                <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/anime/:id" component={AnimeDetails} />
                  <Route path="/watch/:animeId/:episodeId" component={VideoPlayerPage} />
                  <Route path="/search" component={SearchResults} />
                  <Route path="/recently-watched" component={RecentlyWatched} />
                  <Route path="/genre/:genre" component={GenrePage} />
                  <Route path="/category/:type" component={CategoryPage} />
                  <Route path="/test-player" component={TestPlayerPage} />
                  <Route component={NotFound} />
                </Switch>
              </PageTransition>
            </Suspense>
          </main>
          <MobileNavBar />
          <ScrollToTop />
          <Toaster />
          
          {/* Dev Tools Fixed Button */}
          <div className="fixed bottom-4 right-4 z-50">
            <Link href="/test-player">
              <div className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-4 rounded-full shadow-lg transition-all cursor-pointer flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 4v16l15-8-15-8z" />
                </svg>
                Test Player
              </div>
            </Link>
          </div>
        </div>
        </ColorSchemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;