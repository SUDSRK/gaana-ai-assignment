import styles from './DeleteConfirmModal.module.css';
import { Song } from '@/types/song';

interface DeleteConfirmModalProps {
  song: Song;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteConfirmModal({ song, isOpen, onClose, onConfirm }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error deleting song:', error);
    } finally {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Confirm Delete</h2>
        <p>
          Are you sure you want to delete <strong>{song.title}</strong> by {song.artist}?
        </p>
        <p className={styles.warning}>This action cannot be undone.</p>
        
        <div className={styles.buttonGroup}>
          <button 
            type="button" 
            onClick={onClose} 
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleConfirm} 
            className={styles.deleteButton}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
} 