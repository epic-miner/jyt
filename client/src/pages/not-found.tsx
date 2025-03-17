import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-black via-dark-950 to-dark-900 p-4">
      <Card className="w-full max-w-md backdrop-blur-lg border-white/10">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-6">
            <AlertCircle className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">404</h1>
          <h2 className="text-xl font-semibold text-white/90 mb-4">Page Not Found</h2>
          <p className="text-slate-400 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/">
            <a className="inline-block bg-primary/90 hover:bg-primary text-white px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40">
              Return Home
            </a>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}