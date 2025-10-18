import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dreams } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface Dream {
  id: number;
  title: string;
  description: string;
  transcript: string;
  imageUrl: string | null;
  analysis: string | null;
  mood: string | null;
  symbols: string | null;
  narrative: string | null;
  createdAt: string;
}

interface TransformedDream {
  id: string;
  title: string;
  description: string;
  transcript: string;
  imageUrl?: string;
  analysis?: string;
  mood?: string;
  symbols?: string[];
  narrative?: string;
  createdAt: string;
}

function transformDream(dream: Dream): TransformedDream {
  const transformed: TransformedDream = {
    id: dream.id.toString(),
    title: dream.title,
    description: dream.description,
    transcript: dream.transcript,
    createdAt: dream.createdAt,
  };

  if (dream.imageUrl !== null) {
    transformed.imageUrl = dream.imageUrl;
  }

  if (dream.analysis !== null) {
    transformed.analysis = dream.analysis;
  }

  if (dream.mood !== null) {
    transformed.mood = dream.mood;
  }

  if (dream.symbols !== null) {
    try {
      transformed.symbols = JSON.parse(dream.symbols);
    } catch {
      transformed.symbols = [];
    }
  }

  if (dream.narrative !== null) {
    transformed.narrative = dream.narrative;
  }

  return transformed;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const dreamId = parseInt(id);

    const dream = await db
      .select()
      .from(dreams)
      .where(eq(dreams.id, dreamId))
      .limit(1);

    if (dream.length === 0) {
      return NextResponse.json(
        { error: 'Dream not found' },
        { status: 404 }
      );
    }

    const transformedDream = transformDream(dream[0]);

    return NextResponse.json(transformedDream, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const dreamId = parseInt(id);

    const existingDream = await db
      .select()
      .from(dreams)
      .where(eq(dreams.id, dreamId))
      .limit(1);

    if (existingDream.length === 0) {
      return NextResponse.json(
        { error: 'Dream not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates: Partial<Dream> = {};

    if (body.title !== undefined) {
      updates.title = body.title.trim();
    }

    if (body.description !== undefined) {
      updates.description = body.description.trim();
    }

    if (body.transcript !== undefined) {
      updates.transcript = body.transcript.trim();
    }

    if (body.imageUrl !== undefined) {
      updates.imageUrl = body.imageUrl ? body.imageUrl.trim() : null;
    }

    if (body.analysis !== undefined) {
      updates.analysis = body.analysis ? body.analysis.trim() : null;
    }

    if (body.mood !== undefined) {
      updates.mood = body.mood ? body.mood.trim() : null;
    }

    if (body.symbols !== undefined) {
      if (Array.isArray(body.symbols)) {
        updates.symbols = JSON.stringify(body.symbols);
      } else if (body.symbols === null) {
        updates.symbols = null;
      }
    }

    if (body.narrative !== undefined) {
      updates.narrative = body.narrative ? body.narrative.trim() : null;
    }

    const updatedDream = await db
      .update(dreams)
      .set(updates)
      .where(eq(dreams.id, dreamId))
      .returning();

    if (updatedDream.length === 0) {
      return NextResponse.json(
        { error: 'Dream not found' },
        { status: 404 }
      );
    }

    const transformedDream = transformDream(updatedDream[0]);

    return NextResponse.json(transformedDream, { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const dreamId = parseInt(id);

    const existingDream = await db
      .select()
      .from(dreams)
      .where(eq(dreams.id, dreamId))
      .limit(1);

    if (existingDream.length === 0) {
      return NextResponse.json(
        { error: 'Dream not found' },
        { status: 404 }
      );
    }

    await db.delete(dreams).where(eq(dreams.id, dreamId)).returning();

    return NextResponse.json(
      {
        message: 'Dream deleted successfully',
        id: id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error,
      },
      { status: 500 }
    );
  }
}