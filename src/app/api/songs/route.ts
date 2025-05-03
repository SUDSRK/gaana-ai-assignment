import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { Song } from '@/types/song';

interface DbData {
  songs: Song[];
  [key: string]: unknown;
}

const readDb = () => {
  const dbPath = path.join(process.cwd(), 'db.json');
  const jsonData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  return jsonData as DbData;
};

const writeDb = (data: DbData) => {
  try {
    const dbPath = path.join(process.cwd(), 'db.json');
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to database:', error);
    throw new Error('Failed to write to database');
  }
};

const filterSongs = (songs: Song[], searchTerm: string): Song[] => {
  if (!searchTerm) return songs;
  
  const term = searchTerm.toLowerCase();
  return songs.filter(song => 
    song.title.toLowerCase().includes(term) ||
    song.artist.toLowerCase().includes(term) ||
    song.album.toLowerCase().includes(term) ||
    song.genre.toLowerCase().includes(term)
  );
};

const sortSongs = (songs: Song[], sortField: keyof Song, sortDirection: 'asc' | 'desc'): Song[] => {
  return [...songs].sort((a, b) => {
    const valueA = a[sortField];
    const valueB = b[sortField];
    
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA);
    }
    
    return sortDirection === 'asc' 
      ? (valueA < valueB ? -1 : valueA > valueB ? 1 : 0)
      : (valueA > valueB ? -1 : valueA < valueB ? 1 : 0);
  });
};

const paginateSongs = (songs: Song[], page: number, limit: number) => {
  const totalItems = songs.length;
  const totalPages = Math.ceil(totalItems / limit);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));
  
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  const items = songs.slice(startIndex, endIndex);
  
  return {
    items,
    totalItems,
    currentPage,
    totalPages
  };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const searchTerm = searchParams.get('q') || '';
    const sortField = searchParams.get('sort') as keyof Song || 'id';
    const sortDirection = (searchParams.get('order') || 'asc') as 'asc' | 'desc';

    const dbData = readDb();
    const songs: Song[] = dbData.songs || [];

    const filteredSongs = filterSongs(songs, searchTerm);
    const sortedSongs = sortSongs(filteredSongs, sortField, sortDirection);
    const { items, totalItems, currentPage, totalPages } = paginateSongs(sortedSongs, page, limit);

    const response = NextResponse.json(items);
    
    response.headers.set('X-Total-Count', totalItems.toString());
    response.headers.set('X-Total-Pages', totalPages.toString());
    response.headers.set('X-Current-Page', currentPage.toString());
    
    return response;
  } catch (error) {
    console.error('Error in GET songs:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve songs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const newSong = await request.json();

    if (!newSong.title || !newSong.artist) {
      return NextResponse.json(
        { error: 'Title and artist are required' },
        { status: 400 }
      );
    }

    const dbData = readDb();
    
    const maxId = dbData.songs.reduce(
      (max: number, song: Song) => (song.id > max ? song.id : max),
      0
    );
    
    const songToAdd = {
      ...newSong,
      id: maxId + 1
    };
    
    dbData.songs.push(songToAdd);
    writeDb(dbData);
    
    return NextResponse.json(songToAdd, { status: 201 });
  } catch (error) {
    console.error('Error creating song:', error);
    return NextResponse.json(
      { error: 'Failed to create song' },
      { status: 500 }
    );
  }
} 