'use client';

import { useState, useEffect, useRef } from 'react';
import Table from '@/components/Table';
import Snackbar from '@/components/Snackbar';
import EditSongModal from '@/components/EditSongModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { Song } from '@/types/song';
import styles from './dashboard.module.css';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export default function Dashboard() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Song; direction: 'asc' | 'desc' } | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [itemsPerPage] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<Array<keyof Song>>([
    'title',
    'artist',
    'album',
    'duration',
    'genre'
  ]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('page', pagination.currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      
      if (searchTerm) {
        params.append('q', searchTerm);
      }
      
      if (sortConfig?.key) {
        params.append('sort', sortConfig.key);
        params.append('order', sortConfig.direction);
      } else {
        params.append('sort', 'id');
        params.append('order', 'asc');
      }

      const response = await fetch(`/api/songs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch songs: ${response.status}`);
      }

      const totalItems = parseInt(response.headers.get('X-Total-Count') || '0', 10);
      const totalPages = parseInt(response.headers.get('X-Total-Pages') || '0', 10);
      const currentPage = parseInt(response.headers.get('X-Current-Page') || '1', 10);
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      
      setSongs(data);
      setPagination({
        currentPage,
        totalPages,
        totalItems
      });
    } catch (error) {
      console.error('Error fetching songs:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      setSongs([]);
      setPagination({
        currentPage: 1,
        totalPages: 0,
        totalItems: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [pagination.currentPage, itemsPerPage, searchTerm, sortConfig]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowColumnsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setSearchInput(value);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      setSearchTerm(value);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, 1000);
  };

  const handleSort = (key: keyof Song) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleEdit = (song: Song) => {
    setSelectedSong(song);
    setIsEditModalOpen(true);
  };

  const handleSaveSong = async (updatedSong: Song) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/songs/${updatedSong.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updatedSong),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 404) {
          throw new Error('Song not found');
        } else if (response.status === 500) {
          throw new Error('Server error occurred');
        } else {
          throw new Error(`Failed to update song: ${errorText}`);
        }
      }

      await response.json();
      setSnackbarMessage('Song updated successfully');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
      await fetchSongs();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update song';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    } finally {
      setLoading(false);
      setIsEditModalOpen(false);
      setSelectedSong(null);
    }
  };

  const handleDelete = async (song: Song) => {
    setSongToDelete(song);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!songToDelete) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/songs/${songToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 404) {
          throw new Error('Song not found');
        } else if (response.status === 500) {
          throw new Error('Server error occurred');
        } else {
          throw new Error(`Failed to delete song: ${errorText}`);
        }
      }

      setSnackbarMessage('Song deleted successfully');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
      await fetchSongs();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete song';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    } finally {
      setLoading(false);
      setSongToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleAddSong = async (newSong: Omit<Song, 'id'>) => {
    try {
      setLoading(true);
      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newSong),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 500) {
          throw new Error('Server error occurred');
        } else {
          throw new Error(`Failed to add song: ${errorText}`);
        }
      }

      await response.json();
      setSnackbarMessage('Song added successfully');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
      await fetchSongs();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add song';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    } finally {
      setLoading(false);
      setIsEditModalOpen(false);
      setSelectedSong(null);
    }
  };

  const toggleColumn = (column: keyof Song) => {
    if (visibleColumns.length === 1 && visibleColumns.includes(column)) {
      setSnackbarMessage('At least one column must be visible');
      setSnackbarSeverity('warning');
      setShowSnackbar(true);
      return;
    }

    setVisibleColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  const getPageNumbers = () => {
    const pages = [];
    const currentPage = pagination.currentPage;
    const totalPages = pagination.totalPages;
    const range = 2;

    pages.push(1);

    const start = Math.max(2, currentPage - range);
    const end = Math.min(totalPages - 1, currentPage + range);

    if (start > 2) pages.push('...');
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) pages.push('...');

    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.dashboard}>
      <div className={styles.controlsContainer}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search songs..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.actionsContainer}>
          <button
            className={styles.addButton}
            onClick={() => {
              setSelectedSong({
                id: 0,
                title: '',
                artist: '',
                album: '',
                duration: '',
                genre: ''
              });
              setIsEditModalOpen(true);
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 3.33334V12.6667M3.33333 8H12.6667"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Add Song
          </button>
          <div className={styles.columnsDropdownContainer} ref={dropdownRef}>
            <button
              className={styles.columnsDropdownButton}
              onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
            >
              Columns
              <span className={styles.dropdownArrow}>
                {showColumnsDropdown ? '▲' : '▼'}
              </span>
            </button>
            {showColumnsDropdown && (
              <div className={styles.columnsDropdown}>
                {['title', 'artist', 'album', 'duration', 'genre'].map((column) => (
                  <label key={column} className={styles.columnLabel}>
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(column as keyof Song)}
                      onChange={() => toggleColumn(column as keyof Song)}
                    />
                    {column.charAt(0).toUpperCase() + column.slice(1)}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : error ? (
        <div className={styles.error}>
          <p>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={() => fetchSongs()}
          >
            Retry
          </button>
        </div>
      ) : songs.length === 0 ? (
        <div className={styles.noSongs}>
          <p>No songs found</p>
          {searchTerm && (
            <p className={styles.noSongsSubtext}>
              Try adjusting your search or clear the search field
            </p>
          )}
        </div>
      ) : (
        <>
          <Table
            data={songs}
            visibleColumns={visibleColumns}
            onSort={handleSort}
            sortConfig={sortConfig}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <div className={styles.pagination}>
            <div className={styles.paginationControls}>
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={pagination.currentPage === 1}
                className={styles.paginationButton}
              >
                Previous
              </button>
              <div className={styles.pageNumbers}>
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className={styles.ellipsis}>...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: page as number }))}
                      className={`${styles.pageButton} ${pagination.currentPage === page ? styles.activePage : ''}`}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={pagination.currentPage === pagination.totalPages}
                className={styles.paginationButton}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {selectedSong && (
        <EditSongModal
          song={selectedSong}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedSong(null);
          }}
          onSave={(song) => {
            if ('id' in song) {
              return handleSaveSong(song as Song);
            } else {
              return handleAddSong(song);
            }
          }}
          isNew={selectedSong.id === 0}
        />
      )}

      {songToDelete && (
        <DeleteConfirmModal
          song={songToDelete}
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSongToDelete(null);
          }}
          onConfirm={confirmDelete}
        />
      )}

      <Snackbar
        message={snackbarMessage}
        isVisible={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        severity={snackbarSeverity}
      />
    </div>
  );
} 