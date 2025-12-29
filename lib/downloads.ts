// Downloads management using IndexedDB
const DB_NAME = 'MusicPlayerDB';
const STORE_NAME = 'downloads';
const DB_VERSION = 1;

export interface DownloadedSong {
    id: string;
    title: string;
    artist: string;
    image_url: string;
    audio_url: string;
    audio_blob: Blob;
    image_blob: Blob;
    downloaded_at: number;
}

// Initialize IndexedDB
const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

// Download a song for offline use
export const downloadSong = async (song: {
    id: string;
    title: string;
    artist: string;
    image_url: string;
    audio_url: string;
}): Promise<void> => {
    try {
        // Fetch audio file
        const audioResponse = await fetch(song.audio_url);
        const audioBlob = await audioResponse.blob();

        // Fetch image file
        const imageResponse = await fetch(song.image_url);
        const imageBlob = await imageResponse.blob();

        // Save to IndexedDB
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const downloadedSong: DownloadedSong = {
            id: song.id,
            title: song.title,
            artist: song.artist,
            image_url: song.image_url,
            audio_url: song.audio_url,
            audio_blob: audioBlob,
            image_blob: imageBlob,
            downloaded_at: Date.now(),
        };

        await new Promise((resolve, reject) => {
            const request = store.put(downloadedSong);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        db.close();
    } catch (error) {
        console.error('Download error:', error);
        throw error;
    }
};

// Get all downloaded songs
export const getDownloadedSongs = async (): Promise<DownloadedSong[]> => {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error getting downloads:', error);
        return [];
    }
};

// Check if a song is downloaded
export const isSongDownloaded = async (songId: string): Promise<boolean> => {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.get(songId);
            request.onsuccess = () => resolve(!!request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        return false;
    }
};

// Delete a downloaded song
export const deleteDownload = async (songId: string): Promise<void> => {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        await new Promise((resolve, reject) => {
            const request = store.delete(songId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        db.close();
    } catch (error) {
        console.error('Delete error:', error);
        throw error;
    }
};

// Get a specific downloaded song
export const getDownloadedSong = async (songId: string): Promise<DownloadedSong | null> => {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.get(songId);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error getting song:', error);
        return null;
    }
};
