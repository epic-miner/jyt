import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const ACCESS_CODE = '8178955154';

const ManagePage = () => {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const { toast } = useToast();

  const handleAuth = () => {
    if (accessCode === ACCESS_CODE) {
      setIsAuthenticated(true);
      toast({
        title: "Success",
        description: "Access granted to management panel",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid access code",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = () => {
    if (!bannerUrl) {
      toast({
        title: "Error",
        description: "Please enter a banner URL",
        variant: "destructive",
      });
      return;
    }

    // Store the banner URL in localStorage
    const banners = JSON.parse(localStorage.getItem('homeBanners') || '[]');
    banners.push({
      url: bannerUrl,
      addedAt: new Date().toISOString()
    });
    localStorage.setItem('homeBanners', JSON.stringify(banners));

    toast({
      title: "Success",
      description: "Banner URL added successfully",
    });
    setBannerUrl('');
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card className="backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle>Management Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                />
              </div>
              <Button onClick={handleAuth} className="w-full">
                Access Panel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle>Banner Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                type="url"
                placeholder="Enter banner image URL"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
              />
            </div>
            <Button onClick={handleSubmit} className="w-full">
              Add Banner
            </Button>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Current Banners</h3>
            <div className="space-y-4">
              {JSON.parse(localStorage.getItem('homeBanners') || '[]').map((banner: any, index: number) => (
                <div key={index} className="p-4 border border-white/10 rounded-lg">
                  <img src={banner.url} alt={`Banner ${index + 1}`} className="w-full h-32 object-cover rounded" />
                  <p className="mt-2 text-sm text-gray-400">Added: {new Date(banner.addedAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagePage;
