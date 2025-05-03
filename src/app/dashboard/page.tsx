'use client';

import { useState, useEffect, useRef } from 'react';
import Table from '@/components/Table';
import Snackbar from '@/components/Snackbar';
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
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        let url = `/api/songs?page=${pagination.currentPage}&limit=${itemsPerPage}`;
        
        if (searchTerm) {
          url += `&search=${encodeURIComponent(searchTerm)}`;
        }
        
        if (sortConfig) {
          url += `&sort=${sortConfig.key}&order=${sortConfig.direction}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch songs');
        }
        
        const data = await response.json();
        setSongs(data.songs);
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          totalItems: data.totalItems
        });
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

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
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set new timeout
    searchTimeout.current = setTimeout(() => {
      setSearchTerm(value);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, 500); // 500ms debounce
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

  const toggleColumn = (column: keyof Song) => {
    setVisibleColumns(prev => {
      if (prev.length === 1 && prev.includes(column)) {
        setShowSnackbar(true);
        return prev;
      }
      
      return prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column];
    });
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Songs Dashboard</h1>
      
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

      <Table
        data={songs}
        visibleColumns={visibleColumns}
        onSort={handleSort}
        sortConfig={sortConfig}
      />

      <div className={styles.pagination}>
        <button
          onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
          disabled={pagination.currentPage === 1}
          className={styles.paginationButton}
        >
          Previous
        </button>
        <span className={styles.pageNumber}>
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
          disabled={pagination.currentPage === pagination.totalPages}
          className={styles.paginationButton}
        >
          Next
        </button>
      </div>

      <Snackbar
        message="At least one column must be visible"
        isVisible={showSnackbar}
        onClose={() => setShowSnackbar(false)}
      />
    </div>
  );
} 