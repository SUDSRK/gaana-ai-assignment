import { useState, useEffect } from 'react';
import { Song } from '@/types/song';
import styles from './EditSongModal.module.css';

interface EditSongModalProps {
  song: Song;
  isOpen: boolean;
  onClose: () => void;
  onSave: (song: Song | Omit<Song, 'id'>) => Promise<void>;
  isNew?: boolean;
}

export default function EditSongModal({ song, isOpen, onClose, onSave, isNew = false }: EditSongModalProps) {
  const [editedSong, setEditedSong] = useState<Song>(song);
  const [errors, setErrors] = useState<Partial<Record<keyof Song, string>>>({});

  useEffect(() => {
    setEditedSong(song);
    setErrors({});
  }, [song]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Partial<Record<keyof Song, string>> = {};
    if (!editedSong.title.trim()) newErrors.title = 'Title is required';
    if (!editedSong.artist.trim()) newErrors.artist = 'Artist is required';
    if (!editedSong.album.trim()) newErrors.album = 'Album is required';
    if (!editedSong.duration.trim()) newErrors.duration = 'Duration is required';
    if (!editedSong.genre.trim()) newErrors.genre = 'Genre is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isNew) {
        const { id, ...newSong } = editedSong;
        await onSave(newSong);
      } else {
        await onSave(editedSong);
      }
    } catch (error) {
      console.error('Error saving song:', error);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>{isNew ? 'Add New Song' : 'Edit Song'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={editedSong.title}
              onChange={(e) => setEditedSong({ ...editedSong, title: e.target.value })}
              className={errors.title ? styles.errorInput : ''}
            />
            {errors.title && <span className={styles.error}>{errors.title}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="artist">Artist</label>
            <input
              type="text"
              id="artist"
              value={editedSong.artist}
              onChange={(e) => setEditedSong({ ...editedSong, artist: e.target.value })}
              className={errors.artist ? styles.errorInput : ''}
            />
            {errors.artist && <span className={styles.error}>{errors.artist}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="album">Album</label>
            <input
              type="text"
              id="album"
              value={editedSong.album}
              onChange={(e) => setEditedSong({ ...editedSong, album: e.target.value })}
              className={errors.album ? styles.errorInput : ''}
            />
            {errors.album && <span className={styles.error}>{errors.album}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="duration">Duration</label>
            <input
              type="text"
              id="duration"
              value={editedSong.duration}
              onChange={(e) => setEditedSong({ ...editedSong, duration: e.target.value })}
              className={errors.duration ? styles.errorInput : ''}
            />
            {errors.duration && <span className={styles.error}>{errors.duration}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="genre">Genre</label>
            <input
              type="text"
              id="genre"
              value={editedSong.genre}
              onChange={(e) => setEditedSong({ ...editedSong, genre: e.target.value })}
              className={errors.genre ? styles.errorInput : ''}
            />
            {errors.genre && <span className={styles.error}>{errors.genre}</span>}
          </div>

          <div className={styles.buttonGroup}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              {isNew ? 'Add Song' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 