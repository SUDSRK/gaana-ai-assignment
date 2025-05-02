import { Song } from '@/types/song';
import styles from './Table.module.css';

interface TableProps {
  data: Song[];
  visibleColumns: Array<keyof Song>;
  onSort: (key: keyof Song) => void;
  sortConfig: { key: keyof Song; direction: 'asc' | 'desc' } | null;
}

export default function Table({ data, visibleColumns, onSort, sortConfig }: TableProps) {
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 