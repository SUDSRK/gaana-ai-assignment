import { useEffect } from 'react';
import styles from './Snackbar.module.css';

interface SnackbarProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  severity?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export default function Snackbar({
  message,
  isVisible,
  onClose,
  severity = 'success',
  duration = 3000,
}: SnackbarProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`${styles.snackbar} ${styles[severity]}`}>
      <span className={styles.message}>{message}</span>
      <button className={styles.closeButton} onClick={onClose}>
        ×
      </button>
    </div>
  );
} 