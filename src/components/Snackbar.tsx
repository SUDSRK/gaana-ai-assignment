import { useEffect } from 'react';
import styles from './Snackbar.module.css';

interface SnackbarProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function Snackbar({ message, isVisible, onClose }: SnackbarProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={styles.snackbar}>
      <span className={styles.message}>{message}</span>
      <button className={styles.closeButton} onClick={onClose}>
        ×
      </button>
    </div>
  );
} 