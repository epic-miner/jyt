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

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-900 text-slate-50 font-sans">
      <NavBar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/anime/:id" component={AnimeDetails} />
          <Route path="/watch/:animeId/:episodeId" component={VideoPlayerPage} />
          <Route path="/search" component={SearchResults} />
          <Route path="/recently-watched" component={RecentlyWatched} />
          <Route path="/genre/:genre" component={GenrePage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <MobileNav />
      <Toaster />
    </div>
  );
}

export default App;
