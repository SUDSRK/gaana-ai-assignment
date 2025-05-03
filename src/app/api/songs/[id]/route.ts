import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { Song } from '@/types/song';

// Define database structure
interface DbData {
  songs: Song[];
  [key: string]: unknown;
}

// Read data from db.json
const readDb = () => {
  try {
    const dbPath = path.join(process.cwd(), 'db.json');
    const jsonData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    return jsonData as DbData;
  } catch (error) {
    console.error('Error reading database:', error);
    throw new Error('Failed to read database');
  }
};

// Write data to db.json
const writeDb = (data: DbData) => {
  try {
    const dbPath = path.join(process.cwd(), 'db.json');
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to database:', error);
    throw new Error('Failed to write to database');
  }
};

// Get a song by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const dbData = readDb();
    const song = dbData.songs.find((s: Song) => s.id.toString() === id);

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    return NextResponse.json(song);
  } catch (error) {
    console.error('Error fetching song:', error);
    return NextResponse.json(
      { error: 'Failed to fetch song' },
      { status: 500 }
    );
  }
}

// Update a song
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const dbData = readDb();
    const songIndex = dbData.songs.findIndex((s: Song) => s.id.toString() === id);

    if (songIndex === -1) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const updatedSong = await request.json();
    
    updatedSong.id = dbData.songs[songIndex].id;
    
    if (!updatedSong.title || !updatedSong.artist) {
      return NextResponse.json(
        { error: 'Title and artist are required' },
        { status: 400 }
      );
    }

    dbData.songs[songIndex] = {
      ...dbData.songs[songIndex],
      ...updatedSong
    };

    writeDb(dbData);

    return NextResponse.json(dbData.songs[songIndex]);
  } catch (error) {
    console.error('Error updating song:', error);
    return NextResponse.json(
      { error: 'Failed to update song' },
      { status: 500 }
    );
  }
}

// Delete a song
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const dbData = readDb();
    const songIndex = dbData.songs.findIndex((s: Song) => s.id.toString() === id);

    if (songIndex === -1) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const deletedSong = dbData.songs[songIndex];
    dbData.songs.splice(songIndex, 1);

    writeDb(dbData);

    return NextResponse.json({ 
      message: 'Song deleted successfully',
      deletedSong 
    });
  } catch (error) {
    console.error('Error deleting song:', error);
    return NextResponse.json(
      { error: 'Failed to delete song' },
      { status: 500 }
    );
  }
} 