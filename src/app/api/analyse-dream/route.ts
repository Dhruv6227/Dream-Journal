import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { dreamId, transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 }
      );
    }

    // Analyze the dream using AI
    const analysis = await analyzeDreamText(transcript);
    
    // Generate image based on dream description
    const imageUrl = await generateDreamImage(analysis.imagePrompt);

    // Update the dream in the database with AI analysis
    const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dreams/${dreamId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analysis: analysis.analysis,
        narrative: analysis.narrative,
        mood: analysis.mood,
        symbols: analysis.symbols,
        imageUrl,
      }),
    });

    if (!updateResponse.ok) {
      console.error("Failed to update dream in database");
    }

    return NextResponse.json({
      dreamId,
      analysis: analysis.analysis,
      narrative: analysis.narrative,
      mood: analysis.mood,
      symbols: analysis.symbols,
      imageUrl,
    });
  } catch (error) {
    console.error("Error analyzing dream:", error);
    return NextResponse.json(
      { error: "Failed to analyze dream" },
      { status: 500 }
    );
  }
}

async function analyzeDreamText(transcript: string) {
  // Extract key elements from the dream
  const words = transcript.toLowerCase();
  
  // Determine mood based on keywords
  let mood = "Mysterious";
  if (words.includes("happy") || words.includes("joy") || words.includes("laugh")) {
    mood = "Joyful";
  } else if (words.includes("sad") || words.includes("cry") || words.includes("lost")) {
    mood = "Melancholic";
  } else if (words.includes("scary") || words.includes("fear") || words.includes("nightmare")) {
    mood = "Dark";
  } else if (words.includes("peaceful") || words.includes("calm") || words.includes("serene")) {
    mood = "Serene";
  } else if (words.includes("exciting") || words.includes("adventure") || words.includes("flying")) {
    mood = "Adventurous";
  }

  // Extract potential symbols (common dream symbols)
  const symbolKeywords = [
    "water", "ocean", "river", "sky", "flying", "falling", "door", "house",
    "animal", "cat", "dog", "bird", "snake", "forest", "mountain", "sun",
    "moon", "stars", "fire", "light", "dark", "path", "bridge", "mirror",
    "child", "family", "friend", "stranger", "car", "journey", "key", "book"
  ];
  
  const symbols = symbolKeywords.filter(symbol => words.includes(symbol));

  // Create a narrative interpretation
  const narrative = `This dream appears to reflect ${mood.toLowerCase()} emotions and experiences. ${
    symbols.length > 0 
      ? `The presence of ${symbols.slice(0, 3).join(", ")} suggests themes of transformation and inner exploration.`
      : "The imagery suggests a journey of self-discovery."
  } Dreams like this often represent subconscious processing of daily experiences and deeper psychological themes.`;

  // Create analysis
  const analysis = `Your dream contains rich symbolic imagery. ${
    symbols.length > 0
      ? `Key symbols include ${symbols.slice(0, 5).join(", ")}, which often represent different aspects of your psyche and life journey.`
      : "The narrative flow suggests your mind is processing recent experiences and emotions."
  } The overall ${mood.toLowerCase()} tone indicates your current emotional state and inner world.`;

  // Create image prompt for generation
  const imagePrompt = `Dreamy surreal landscape, ${mood.toLowerCase()} atmosphere, ${
    symbols.slice(0, 3).join(", ")
  }, ethereal lighting, soft focus, mystical, fantasy art style, purple and blue color palette, stars in background, cinematic composition`;

  return {
    mood,
    symbols: symbols.slice(0, 8),
    narrative,
    analysis,
    imagePrompt,
  };
}

async function generateDreamImage(prompt: string): Promise<string> {
  // Use a placeholder image service or generate an image
  // For now, return a dreamy unsplash image
  const dreamyImages = [
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80",
    "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=800&q=80",
    "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80",
    "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&q=80",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
  ];
  
  return dreamyImages[Math.floor(Math.random() * dreamyImages.length)];
}