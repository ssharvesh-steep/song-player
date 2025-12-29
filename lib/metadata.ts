import jsmediatags from 'jsmediatags';

export interface SongMetadata {
    title: string;
    artist: string;
    album?: string;
    year?: string;
    coverArt?: Blob;
}

export function extractMetadata(file: File): Promise<SongMetadata> {
    return new Promise((resolve, reject) => {
        jsmediatags.read(file, {
            onSuccess: (tag) => {
                const tags = tag.tags;

                // Extract cover art if available
                let coverArt: Blob | undefined;
                if (tags.picture) {
                    const { data, format } = tags.picture;
                    const byteArray = new Uint8Array(data);
                    coverArt = new Blob([byteArray], { type: format });
                }

                // Extract metadata with fallbacks
                const metadata: SongMetadata = {
                    title: tags.title || file.name.replace(/\.[^/.]+$/, ''), // Remove extension
                    artist: tags.artist || 'Unknown Artist',
                    album: tags.album,
                    year: tags.year,
                    coverArt,
                };

                resolve(metadata);
            },
            onError: (error) => {
                console.error('Error reading metadata:', error);
                // Return basic metadata from filename
                resolve({
                    title: file.name.replace(/\.[^/.]+$/, ''),
                    artist: 'Unknown Artist',
                });
            },
        });
    });
}

// Helper to convert Blob to File
export function blobToFile(blob: Blob, filename: string): File {
    return new File([blob], filename, { type: blob.type });
}
