import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NavBar from "./components/NavBar";
import MobileNav from "./components/MobileNav";
import Home from "./pages/Home";
import AnimeDetails from "./pages/AnimeDetails";
import VideoPlayerPage from "./pages/VideoPlayerPage";
import SearchResults from "./pages/SearchResults";
import RecentlyWatched from "./pages/RecentlyWatched";
import GenrePage from "./pages/GenrePage";
import NotFound from "./pages/not-found";
import ScrollToTop from "./components/ScrollToTop";
import { PageTransition } from "./components/PageTransition";
import { useEffect } from "react";
import { initializeGlobalSecurity } from "./lib/security";
import { useConsoleProtection } from './hooks/useConsoleProtection';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async'; // Added import

const queryClient = new QueryClient();

function App() {
  useConsoleProtection();
  // Initialize global security measures
  useEffect(() => {
    initializeGlobalSecurity();
  }, []);

  return (
    <HelmetProvider> {/* Added HelmetProvider */}
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-dark-950 to-dark-900 text-slate-50 font-sans">
          <NavBar />
          <main className="flex-grow relative">
            <PageTransition>
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/anime/:id" component={AnimeDetails} />
                <Route path="/watch/:animeId/:episodeId" component={VideoPlayerPage} />
                <Route path="/search" component={SearchResults} />
                <Route path="/recently-watched" component={RecentlyWatched} />
                <Route path="/genre/:genre" component={GenrePage} />
                <Route component={NotFound} />
              </Switch>
            </PageTransition>
          </main>
          <MobileNav />
          <ScrollToTop />
          <Toaster />
        </div>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;