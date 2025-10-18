"use client";

import { Dream } from "@/types/dream";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Calendar, Sparkles } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DreamCardProps {
  dream: Dream;
  onView: (dream: Dream) => void;
  onDelete: (id: string) => void;
}

export default function DreamCard({ dream, onView, onDelete }: DreamCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-card/80 backdrop-blur border-border/50">
      {dream.imageUrl && (
        <div className="relative w-full h-48 bg-secondary/20 overflow-hidden">
          <img
            src={dream.imageUrl}
            alt={dream.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      )}
      
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold line-clamp-1">{dream.title}</h3>
          {dream.mood && (
            <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent-foreground">
              {dream.mood}
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {dream.description}
        </p>

        {dream.symbols && dream.symbols.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {dream.symbols.slice(0, 3).map((symbol, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
              >
                {symbol}
              </span>
            ))}
            {dream.symbols.length > 3 && (
              <span className="text-xs px-2 py-1 text-muted-foreground">
                +{dream.symbols.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{new Date(dream.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onView(dream)}
            variant="default"
            size="sm"
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Dream
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Dream?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{dream.title}" from your dream journal.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(dream.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
}