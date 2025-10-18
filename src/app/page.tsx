"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import VoiceRecorder from "@/components/VoiceRecorder";
import DreamCard from "@/components/DreamCard";
import { Dream } from "@/types/dream";
import { Moon, Plus, Sparkles, Library } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Home() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [dreamTitle, setDreamTitle] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadDreams();
  }, []);

  const loadDreams = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/dreams");
      
      if (!response.ok) {
        throw new Error("Failed to load dreams");
      }
      
      const data = await response.json();
      setDreams(data);
    } catch (error) {
      console.error("Error loading dreams:", error);
      toast.error("Failed to load dreams. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranscriptComplete = (transcript: string) => {
    setCurrentTranscript(transcript);
  };

  const handleSaveDream = async () => {
    if (!currentTranscript.trim()) return;

    setIsProcessing(true);

    try {
      // Generate a title from the first few words if not provided
      const title = dreamTitle.trim() || 
        currentTranscript.split(" ").slice(0, 5).join(" ") + "...";

      // Create dream entry via API
      const response = await fetch("/api/dreams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: currentTranscript.slice(0, 150) + "...",
          transcript: currentTranscript,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save dream");
      }

      const newDream = await response.json();
      
      // Process with AI in background
      processWithAI(newDream.id, currentTranscript);

      // Close dialog and reset
      setIsRecordDialogOpen(false);
      setCurrentTranscript("");
      setDreamTitle("");
      
      toast.success("Dream saved successfully!");
      
      // Reload dreams to show the new one
      loadDreams();
    } catch (error) {
      console.error("Error saving dream:", error);
      toast.error("Failed to save dream. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const processWithAI = async (dreamId: string, transcript: string) => {
    try {
      const response = await fetch("/api/analyze-dream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dreamId, transcript }),
      });

      if (response.ok) {
        loadDreams();
      }
    } catch (error) {
      console.error("Error processing dream:", error);
    }
  };

  const handleViewDream = (dream: Dream) => {
    router.push(`/dream/${dream.id}`);
  };

  const handleDeleteDream = async (id: string) => {
    try {
      const response = await fetch(`/api/dreams/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete dream");
      }

      toast.success("Dream deleted successfully");
      loadDreams();
    } catch (error) {
      console.error("Error deleting dream:", error);
      toast.error("Failed to delete dream. Please try again.");
    }
  };

  return (
    <div className="min-h-screen dream-gradient stars-bg">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Moon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dream Journal</h1>
                <p className="text-sm text-muted-foreground">
                  Capture your dreams with AI
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsRecordDialogOpen(true)}
              size="lg"
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              New Dream
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : dreams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No dreams yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start recording your dreams and let AI transform them into beautiful
              visual stories
            </p>
            <Button onClick={() => setIsRecordDialogOpen(true)} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Record Your First Dream
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Library className="w-5 h-5" />
                Your Dreams ({dreams.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dreams.map((dream) => (
                <DreamCard
                  key={dream.id}
                  dream={dream}
                  onView={handleViewDream}
                  onDelete={handleDeleteDream}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Record Dream Dialog */}
      <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" />
              Record Your Dream
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <VoiceRecorder onTranscriptComplete={handleTranscriptComplete} />

            {currentTranscript && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Dream Title (Optional)
                  </label>
                  <Input
                    placeholder="Give your dream a title..."
                    value={dreamTitle}
                    onChange={(e) => setDreamTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Transcript
                  </label>
                  <Textarea
                    value={currentTranscript}
                    onChange={(e) => setCurrentTranscript(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveDream}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Save & Analyze Dream
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsRecordDialogOpen(false);
                      setCurrentTranscript("");
                      setDreamTitle("");
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}