import { Song } from '@/types/song';
import styles from './Table.module.css';

interface TableProps {
  data: Song[];
  visibleColumns: Array<keyof Song>;
  onSort: (key: keyof Song) => void;
  sortConfig: { key: keyof Song; direction: 'asc' | 'desc' } | null;
  onEdit: (song: Song) => void;
  onDelete: (song: Song) => void;
}

export default function Table({ data, visibleColumns, onSort, sortConfig, onEdit, onDelete }: TableProps) {
  const getSortIcon = (key: keyof Song) => {
    if (sortConfig?.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {visibleColumns.map((column) => (
              <th
                key={column}
                className={styles.header}
                onClick={() => onSort(column)}
              >
                <div className={styles.headerContent}>
                  {column.charAt(0).toUpperCase() + column.slice(1)}
                  <span>{getSortIcon(column)}</span>
                </div>
              </th>
            ))}
            <th className={styles.header}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((song) => (
            <tr key={song.id} className={styles.row}>
              {visibleColumns.map((column) => (
                <td key={column} className={styles.cell}>
                  {song[column]}
                </td>
              ))}
              <td className={styles.actionCell}>
                <button
                  onClick={() => onEdit(song)}
                  className={styles.editButton}
                  title="Edit"
                >
                  <span className={styles.icon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </span>
                </button>
                <button
                  onClick={() => onDelete(song)}
                  className={styles.deleteButton}
                  title="Delete"
                >
                  <span className={styles.icon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 