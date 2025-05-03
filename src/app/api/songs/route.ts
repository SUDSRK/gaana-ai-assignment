import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  genre: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') as keyof Song | null;
    const order = searchParams.get('order') as 'asc' | 'desc' | null;

    // Read the JSON file
    const filePath = path.join(process.cwd(), 'db.json');
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let songs: Song[] = jsonData.songs;

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      songs = songs.filter(song => 
        song.title.toLowerCase().includes(searchLower) ||
        song.artist.toLowerCase().includes(searchLower) ||
        song.album.toLowerCase().includes(searchLower) ||
        song.genre.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (sort) {
      songs.sort((a, b) => {
        const aValue = a[sort];
        const bValue = b[sort];
        
        if (order === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    // Calculate pagination
    const totalItems = songs.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalItems);
    const paginatedSongs = songs.slice(startIndex, endIndex);

    return NextResponse.json({
      songs: paginatedSongs,
      currentPage: page,
      totalPages,
      totalItems
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 