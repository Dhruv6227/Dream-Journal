"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Dream } from "@/types/dream";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Moon, Calendar, Brain, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function DreamPage() {
  const params = useParams();
  const router = useRouter();
  const [dream, setDream] = useState<Dream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      loadDream(id);
    }
  }, [params.id]);

  const loadDream = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/dreams/${id}`);
      
      if (response.status === 404) {
        setError("Dream not found");
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to load dream");
      }
      
      const data = await response.json();
      setDream(data);
      
      // If dream doesn't have AI analysis yet, fetch it
      if (!data.analysis) {
        fetchAnalysis(id, data.transcript);
      }
    } catch (error) {
      console.error("Error loading dream:", error);
      setError("Failed to load dream");
      toast.error("Failed to load dream. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalysis = async (dreamId: string, transcript: string) => {
    try {
      const response = await fetch("/api/analyze-dream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dreamId, transcript }),
      });

      if (response.ok) {
        // Refresh the dream data after analysis
        loadDream(dreamId);
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen dream-gradient stars-bg">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !dream) {
    return (
      <div className="min-h-screen dream-gradient stars-bg flex items-center justify-center">
        <Card className="p-8 text-center">
          <Moon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Dream not found</h2>
          <p className="text-muted-foreground mb-6">
            This dream may have been deleted or doesn't exist.
          </p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Journal
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen dream-gradient stars-bg">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/20">
        <div className="container mx-auto px-4 py-6">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Journal
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Dream Image */}
        {dream.imageUrl ? (
          <Card className="overflow-hidden mb-8 border-border/50">
            <div className="relative w-full h-96 bg-secondary/20">
              <img
                src={dream.imageUrl}
                alt={dream.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-4xl font-bold mb-2">{dream.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(dream.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {dream.mood && (
                    <span className="px-3 py-1 rounded-full bg-accent/30 text-accent-foreground">
                      {dream.mood}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{dream.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(dream.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {dream.mood && (
                <span className="px-3 py-1 rounded-full bg-accent/30 text-accent-foreground">
                  {dream.mood}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Dream Transcript */}
          <Card className="p-6 bg-card/80 backdrop-blur border-border/50">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Your Dream
            </h2>
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {dream.transcript}
            </p>
          </Card>

          {/* AI Analysis */}
          {dream.analysis ? (
            <Card className="p-6 bg-card/80 backdrop-blur border-border/50">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Analysis
              </h2>
              <p className="text-foreground/90 leading-relaxed mb-6">
                {dream.analysis}
              </p>

              {dream.symbols && dream.symbols.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                    Dream Symbols
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {dream.symbols.map((symbol, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm"
                      >
                        {symbol}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-6 bg-card/80 backdrop-blur border-border/50">
              <div className="flex items-center justify-center py-8">
                <Sparkles className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">
                  Analyzing your dream with AI...
                </span>
              </div>
            </Card>
          )}

          {/* Narrative Interpretation */}
          {dream.narrative && (
            <Card className="p-6 bg-card/80 backdrop-blur border-border/50">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Interpretation
              </h2>
              <p className="text-foreground/90 leading-relaxed italic">
                {dream.narrative}
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}