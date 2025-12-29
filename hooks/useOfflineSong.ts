import { useEffect, useState } from 'react';
import { openDB } from 'idb';

const DB_NAME = 'music-pwa-db';
const STORE_NAME = 'songs';

interface OfflineSong {
    url: string;
    blob: Blob;
}

const useOfflineSong = (audioUrl: string | undefined): string | undefined => {
    const [src, setSrc] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!audioUrl) return;

        const loadSong = async () => {
            try {
                const db = await openDB(DB_NAME, 1, {
                    upgrade(db) {
                        if (!db.objectStoreNames.contains(STORE_NAME)) {
                            db.createObjectStore(STORE_NAME);
                        }
                    },
                });

                // Check if in DB
                const cachedBlob = await db.get(STORE_NAME, audioUrl);

                if (cachedBlob) {
                    console.log('Serving from IDB:', audioUrl);
                    const objectUrl = URL.createObjectURL(cachedBlob);
                    setSrc(objectUrl);
                    return;
                }

                // Fetch from network
                console.log('Fetching from network:', audioUrl);
                const response = await fetch(audioUrl);
                const blob = await response.blob();

                // Store in DB
                await db.put(STORE_NAME, blob, audioUrl);

                const objectUrl = URL.createObjectURL(blob);
                setSrc(objectUrl);

            } catch (error) {
                console.error("Error loading song:", error);
                // Fallback to original URL if anything fails
                setSrc(audioUrl);
            }
        };

        loadSong();

        // Cleanup object URLs to avoid memory leaks
        return () => {
            if (src && src.startsWith('blob:')) {
                URL.revokeObjectURL(src);
            }
        };
    }, [audioUrl]); // Removed 'src' dependency loop

    return src;
};

export default useOfflineSong;
