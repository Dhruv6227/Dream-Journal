"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string) => void;
}

export default function VoiceRecorder({ onTranscriptComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Speech Recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript((prev) => {
          const newTranscript = prev + finalTranscript;
          return newTranscript;
        });
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setTranscript("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (transcript.trim()) {
        onTranscriptComplete(transcript.trim());
      }
    }
  };

  if (!isSupported) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          Voice recording is not supported in your browser. Please use Chrome, Edge, or Safari.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          size="lg"
          className={`rounded-full w-24 h-24 transition-all duration-300 ${
            isRecording 
              ? "bg-red-500 hover:bg-red-600 animate-pulse" 
              : "bg-primary hover:bg-primary/90"
          }`}
        >
          {isRecording ? (
            <MicOff className="w-10 h-10" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </Button>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {isRecording ? "Recording... Tap to stop" : "Tap to start recording your dream"}
        </p>
      </div>

      {transcript && (
        <Card className="p-4 bg-card/50 backdrop-blur">
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">
            {transcript}
          </p>
        </Card>
      )}
    </div>
  );
}