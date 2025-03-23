import React, { useState, useEffect } from 'react';
import AdOptimizedFluidPlayer from '../components/AdOptimizedFluidPlayer';
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { Episode } from '../../../shared/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Helmet } from 'react-helmet-async';

// Ad configuration test page to demonstrate different ad strategies
const AdOptimizationTestPage = () => {
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  
  // Fetch a sample episode to test with
  const { data: episodes, isLoading, error } = useQuery({
    queryKey: ['/episodes'],
    queryFn: async () => {
      const response = await fetch('/api/episodes');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }
  });
  
  // Select an episode when data loads
  useEffect(() => {
    if (episodes && episodes.length > 0) {
      setSelectedEpisode(episodes[0]);
    }
  }, [episodes]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 rounded-full bg-primary/60 mb-4"></div>
          <div className="h-2 w-24 bg-primary/40 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
        <div className="text-center text-red-500">
          <h2 className="text-2xl font-bold mb-2">Error Loading Episode</h2>
          <p>Could not load test episode data.</p>
        </div>
      </div>
    );
  }
  
  // Handle episode selection
  const handleSelectEpisode = (episode: Episode) => {
    setSelectedEpisode(episode);
  };
  
  return (
    <div className="min-h-screen pb-24 flex flex-col bg-black p-4">
      <Helmet>
        <title>Ad Optimization Testing | Anime Stream</title>
      </Helmet>
      
      <h1 className="text-3xl font-bold mb-6 text-center">Ad Optimization Testing</h1>
      
      {/* Episode selector */}
      {episodes && episodes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Test Episode</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {episodes.slice(0, 6).map((episode: Episode) => (
              <div 
                key={episode.id}
                className={`cursor-pointer relative overflow-hidden rounded-lg transition-all duration-200 
                  ${selectedEpisode?.id === episode.id ? 'ring-4 ring-primary' : 'hover:ring-2 hover:ring-primary/50'}`}
                onClick={() => handleSelectEpisode(episode)}
              >
                <img 
                  src={episode.thumbnail_url} 
                  alt={episode.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/70 text-xs">
                  {episode.title || `Episode ${episode.episode_number}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Main content with tabs for different ad configurations */}
      {selectedEpisode && (
        <Tabs defaultValue="default" className="w-full">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Ad Configuration Examples</h2>
            <p className="text-gray-400 mb-4">Compare different ad optimization strategies:</p>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="default">Default Ads</TabsTrigger>
              <TabsTrigger value="minimal">Minimal Ads</TabsTrigger>
              <TabsTrigger value="frequency">Frequency Capped</TabsTrigger>
              <TabsTrigger value="none">No Ads</TabsTrigger>
            </TabsList>
          </div>
        
          <TabsContent value="default" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Default Ad Configuration</CardTitle>
                <CardDescription>
                  Complete ad setup with pre-roll, mid-roll, post-roll, and pause ads.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-gray-900 rounded-lg overflow-hidden">
                  <AdOptimizedFluidPlayer 
                    episode={selectedEpisode} 
                    adConfig="default"
                    autoPlay={false}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start">
                <h3 className="text-lg font-semibold mb-2">Implementation Notes:</h3>
                <ul className="list-disc pl-5 text-sm text-gray-400 space-y-1">
                  <li>Full ad implementation with all ad types</li>
                  <li>Pre-roll ads play before content starts</li>
                  <li>Mid-roll ads play at set intervals during content</li>
                  <li>Post-roll ads play after content ends</li>
                  <li>Non-linear ads display when user pauses</li>
                </ul>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="minimal" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Minimal Ad Configuration</CardTitle>
                <CardDescription>
                  Streamlined ad experience with only pre-roll ads.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-gray-900 rounded-lg overflow-hidden">
                  <AdOptimizedFluidPlayer 
                    episode={selectedEpisode} 
                    adConfig="minimal"
                    autoPlay={false}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start">
                <h3 className="text-lg font-semibold mb-2">Implementation Notes:</h3>
                <ul className="list-disc pl-5 text-sm text-gray-400 space-y-1">
                  <li>Minimally intrusive ad experience</li>
                  <li>Only pre-roll ads before content</li>
                  <li>No interruptions during viewing</li>
                  <li>Better for shorter content</li>
                  <li>Improves viewer retention</li>
                </ul>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="frequency" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Frequency-Capped Configuration</CardTitle>
                <CardDescription>
                  Intelligent ad placement based on content duration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-gray-900 rounded-lg overflow-hidden">
                  <AdOptimizedFluidPlayer 
                    episode={selectedEpisode} 
                    adConfig="frequency-capped"
                    autoPlay={false}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start">
                <h3 className="text-lg font-semibold mb-2">Implementation Notes:</h3>
                <ul className="list-disc pl-5 text-sm text-gray-400 space-y-1">
                  <li>Dynamically adjusts ad frequency based on content length</li>
                  <li>Limited number of mid-roll ads (max 2)</li>
                  <li>Ads placed at natural content breaks</li>
                  <li>Balances viewer experience with monetization</li>
                  <li>Ideal for longer-form content</li>
                </ul>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="none" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>No Ads Configuration</CardTitle>
                <CardDescription>
                  Ad-free experience for premium users or special content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-gray-900 rounded-lg overflow-hidden">
                  <AdOptimizedFluidPlayer 
                    episode={selectedEpisode} 
                    adConfig="none"
                    autoPlay={false}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start">
                <h3 className="text-lg font-semibold mb-2">Implementation Notes:</h3>
                <ul className="list-disc pl-5 text-sm text-gray-400 space-y-1">
                  <li>Completely ad-free viewing experience</li>
                  <li>Perfect for premium subscribers</li>
                  <li>Can be used for promotional content</li>
                  <li>Ideal for special event content</li>
                  <li>Maximum viewer satisfaction</li>
                </ul>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      
      {/* Ad optimization information */}
      <div className="mt-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Ad Optimization Strategy</h2>
        <div className="bg-gray-900/50 p-6 rounded-lg">
          <p className="mb-4">
            This testing page demonstrates different ad optimization strategies for video content. The implementation
            uses the VAST (Video Ad Serving Template) standard for delivering interactive pre-roll, mid-roll, post-roll,
            and non-linear ad experiences.
          </p>
          
          <h3 className="text-xl font-semibold mb-2">Key Features:</h3>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>VAST-compliant ad implementation</li>
            <li>Support for all major ad formats (linear and non-linear)</li>
            <li>Frequency capping to prevent excessive ad load</li>
            <li>Responsive ad display that works across devices</li>
            <li>Advanced tracking for ad impressions and interactions</li>
            <li>Fallback handling for ad blockers or failed ad delivery</li>
          </ul>
          
          <p>
            Implementation is handled through the <code className="text-primary bg-gray-800 px-1 rounded">adConfig.ts</code> utility,
            which provides standardized configurations that can be applied consistently across the application.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdOptimizationTestPage;