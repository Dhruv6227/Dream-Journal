import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dreams } from '@/db/schema';
import { desc } from 'drizzle-orm';

// Helper function to transform database records to API response format
function transformDreamRecord(record: any) {
  const transformed: any = {
    id: record.id.toString(),
    title: record.title,
    description: record.description,
    transcript: record.transcript,
    createdAt: record.createdAt,
  };

  if (record.imageUrl !== null) {
    transformed.imageUrl = record.imageUrl;
  }

  if (record.analysis !== null) {
    transformed.analysis = record.analysis;
  }

  if (record.mood !== null) {
    transformed.mood = record.mood;
  }

  if (record.symbols !== null) {
    try {
      transformed.symbols = JSON.parse(record.symbols);
    } catch {
      transformed.symbols = [];
    }
  }

  if (record.narrative !== null) {
    transformed.narrative = record.narrative;
  }

  return transformed;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, transcript, imageUrl, analysis, mood, symbols, narrative } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required', code: 'MISSING_DESCRIPTION' },
        { status: 400 }
      );
    }

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required', code: 'MISSING_TRANSCRIPT' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData: any = {
      title: title.trim(),
      description: description.trim(),
      transcript: transcript.trim(),
      createdAt: new Date().toISOString(),
    };

    // Handle optional fields
    if (imageUrl !== undefined && imageUrl !== null) {
      insertData.imageUrl = imageUrl.trim();
    }

    if (analysis !== undefined && analysis !== null) {
      insertData.analysis = analysis.trim();
    }

    if (mood !== undefined && mood !== null) {
      insertData.mood = mood.trim();
    }

    if (symbols !== undefined && symbols !== null) {
      // Convert array to JSON string if provided as array
      if (Array.isArray(symbols)) {
        insertData.symbols = JSON.stringify(symbols);
      } else if (typeof symbols === 'string') {
        insertData.symbols = symbols;
      }
    }

    if (narrative !== undefined && narrative !== null) {
      insertData.narrative = narrative.trim();
    }

    // Insert into database
    const newDream = await db.insert(dreams)
      .values(insertData)
      .returning();

    if (newDream.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create dream', code: 'INSERT_FAILED' },
        { status: 500 }
      );
    }

    // Transform and return created dream
    const transformedDream = transformDreamRecord(newDream[0]);

    return NextResponse.json(transformedDream, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Query all dreams ordered by createdAt descending
    const allDreams = await db.select()
      .from(dreams)
      .orderBy(desc(dreams.createdAt));

    // Transform all records
    const transformedDreams = allDreams.map(transformDreamRecord);

    return NextResponse.json(transformedDreams, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}