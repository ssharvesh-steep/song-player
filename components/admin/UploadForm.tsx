"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { extractMetadata, blobToFile } from "@/lib/metadata";
import { Upload, Music, CheckCircle, AlertCircle, X, Loader2 } from "lucide-react";

interface UploadProgress {
    filename: string;
    status: 'pending' | 'extracting' | 'uploading' | 'success' | 'error';
    progress: number;
    error?: string;
    metadata?: { title: string; artist: string; hasArt: boolean };
}

const UploadForm = () => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgress>>(new Map());
    const router = useRouter();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setSelectedFiles(files);
        setError(null);

        // Initialize progress for all files
        const newProgress = new Map<string, UploadProgress>();
        files.forEach(file => {
            newProgress.set(file.name, {
                filename: file.name,
                status: 'pending',
                progress: 0,
            });
        });
        setUploadProgress(newProgress);

        // Extract metadata for all files
        for (const file of files) {
            try {
                updateProgress(file.name, { status: 'extracting', progress: 10 });
                const meta = await extractMetadata(file);
                updateProgress(file.name, {
                    status: 'pending',
                    progress: 20,
                    metadata: {
                        title: meta.title,
                        artist: meta.artist,
                        hasArt: !!meta.coverArt,
                    }
                });
            } catch (err) {
                console.error(`Metadata extraction error for ${file.name}:`, err);
                updateProgress(file.name, {
                    status: 'pending',
                    progress: 20,
                    metadata: {
                        title: file.name.replace(/\.[^/.]+$/, ''),
                        artist: 'Unknown Artist',
                        hasArt: false,
                    }
                });
            }
        }
    };

    const updateProgress = (filename: string, updates: Partial<UploadProgress>) => {
        setUploadProgress(prev => {
            const newMap = new Map(prev);
            const current = newMap.get(filename);
            if (current) {
                newMap.set(filename, { ...current, ...updates });
            }
            return newMap;
        });
    };

    const generatePlaceholderImage = async (): Promise<Blob> => {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const gradient = ctx.createLinearGradient(0, 0, 300, 300);
            gradient.addColorStop(0, `hsl(${Math.random() * 360}, 70%, 50%)`);
            gradient.addColorStop(1, `hsl(${Math.random() * 360}, 70%, 30%)`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 300, 300);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.font = 'bold 120px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('♪', 150, 150);
        }
        return new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9);
        });
    };

    const sanitizeFilename = (filename: string): string => {
        // Remove invalid characters and replace spaces with hyphens
        return filename
            .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, and hyphens
            .replace(/\s+/g, '-')      // Replace spaces with hyphens
            .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
            .toLowerCase();            // Convert to lowercase
    };

    const uploadSingleSong = async (file: File) => {
        try {
            updateProgress(file.name, { status: 'uploading', progress: 30 });

            // Check authentication
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData.user) {
                throw new Error("You must be logged in to upload songs");
            }

            // Extract metadata
            const meta = await extractMetadata(file);
            const uniqueID = Math.random().toString(36).substring(7);
            const sanitizedTitle = sanitizeFilename(meta.title);

            updateProgress(file.name, { progress: 40 });

            // Upload Song
            const { data: songData, error: songError } = await supabase
                .storage
                .from('songs')
                .upload(`song-${sanitizedTitle}-${uniqueID}.mp3`, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (songError) throw new Error(`Failed to upload song: ${songError.message}`);

            updateProgress(file.name, { progress: 60 });

            // Upload Image
            let imageData;
            if (meta.coverArt) {
                const imageFile = blobToFile(meta.coverArt, `cover-${uniqueID}.jpg`);
                const { data, error: imageError } = await supabase
                    .storage
                    .from('images')
                    .upload(`image-${sanitizedTitle}-${uniqueID}.jpg`, imageFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (imageError) {
                    await supabase.storage.from('songs').remove([songData.path]);
                    throw new Error(`Failed to upload cover art: ${imageError.message}`);
                }
                imageData = data;
            } else {
                const blob = await generatePlaceholderImage();
                const imageFile = blobToFile(blob, `cover-${uniqueID}.jpg`);
                const { data, error: imageError } = await supabase
                    .storage
                    .from('images')
                    .upload(`image-${sanitizedTitle}-${uniqueID}.jpg`, imageFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (imageError) {
                    await supabase.storage.from('songs').remove([songData.path]);
                    throw new Error(`Failed to upload cover art: ${imageError.message}`);
                }
                imageData = data;
            }

            updateProgress(file.name, { progress: 80 });

            // Insert Record
            const { error: supabaseError } = await supabase.from('songs').insert({
                user_id: userData.user.id,
                title: meta.title,
                artist: meta.artist,
                image_url: imageData.path,
                audio_url: songData.path
            });

            if (supabaseError) {
                await supabase.storage.from('songs').remove([songData.path]);
                await supabase.storage.from('images').remove([imageData.path]);
                throw new Error(`Failed to save song data: ${supabaseError.message}`);
            }

            updateProgress(file.name, { status: 'success', progress: 100 });
        } catch (error: any) {
            console.error(`Upload error for ${file.name}:`, error);
            updateProgress(file.name, {
                status: 'error',
                progress: 0,
                error: error.message || "Upload failed"
            });
        }
    };

    const handleBulkUpload = async () => {
        if (selectedFiles.length === 0) {
            setError("Please select at least one song file");
            return;
        }

        setUploading(true);
        setError(null);

        // Upload all files concurrently
        await Promise.all(selectedFiles.map(file => uploadSingleSong(file)));

        setUploading(false);
        router.refresh();

        // Clear after 3 seconds if all successful
        setTimeout(() => {
            const allSuccess = Array.from(uploadProgress.values()).every(p => p.status === 'success');
            if (allSuccess) {
                setSelectedFiles([]);
                setUploadProgress(new Map());
            }
        }, 3000);
    };

    const removeFile = (filename: string) => {
        setSelectedFiles(prev => prev.filter(f => f.name !== filename));
        setUploadProgress(prev => {
            const newMap = new Map(prev);
            newMap.delete(filename);
            return newMap;
        });
    };

    const getStatusIcon = (status: UploadProgress['status']) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="text-green-500" size={20} />;
            case 'error':
                return <AlertCircle className="text-red-500" size={20} />;
            case 'extracting':
            case 'uploading':
                return <Loader2 className="text-blue-500 animate-spin" size={20} />;
            default:
                return <Music className="text-neutral-400" size={20} />;
        }
    };

    return (
        <div className="flex flex-col gap-y-4">
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-neutral-600 rounded-lg p-8 text-center hover:border-green-500 transition">
                <input
                    type="file"
                    accept=".mp3,.m4a,.wav"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="song-upload"
                    disabled={uploading}
                    multiple
                />
                <label htmlFor="song-upload" className="cursor-pointer">
                    <Upload className="mx-auto mb-4 text-neutral-400" size={48} />
                    <p className="text-white font-semibold mb-2">
                        {selectedFiles.length > 0
                            ? `${selectedFiles.length} file(s) selected`
                            : "Click to select songs"}
                    </p>
                    <p className="text-neutral-400 text-sm">
                        MP3, M4A, or WAV files • Multiple files supported
                    </p>
                </label>
            </div>

            {/* Upload Progress List */}
            {selectedFiles.length > 0 && (
                <div className="bg-neutral-800 rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
                    <h3 className="text-white font-semibold mb-3">Upload Queue ({selectedFiles.length})</h3>
                    {selectedFiles.map(file => {
                        const progress = uploadProgress.get(file.name);
                        return (
                            <div key={file.name} className="bg-neutral-700 p-3 rounded-lg">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        {getStatusIcon(progress?.status || 'pending')}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">
                                                {progress?.metadata?.title || file.name}
                                            </p>
                                            <p className="text-neutral-400 text-xs truncate">
                                                {progress?.metadata?.artist || 'Extracting...'}
                                            </p>
                                            {progress?.error && (
                                                <p className="text-red-400 text-xs mt-1">{progress.error}</p>
                                            )}
                                        </div>
                                    </div>
                                    {!uploading && progress?.status !== 'success' && (
                                        <button
                                            onClick={() => removeFile(file.name)}
                                            className="text-neutral-400 hover:text-red-400 transition"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                                {progress && progress.progress > 0 && (
                                    <div className="mt-2 bg-neutral-600 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${progress.status === 'success' ? 'bg-green-500' :
                                                progress.status === 'error' ? 'bg-red-500' :
                                                    'bg-blue-500'
                                                }`}
                                            style={{ width: `${progress.progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Upload Button */}
            <button
                onClick={handleBulkUpload}
                disabled={uploading || selectedFiles.length === 0}
                className="bg-green-500 rounded-full p-3 font-bold text-black hover:bg-green-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {uploading ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Uploading {selectedFiles.length} song(s)...</span>
                    </>
                ) : (
                    <span>Upload {selectedFiles.length > 0 ? `${selectedFiles.length} Song(s)` : 'Songs'}</span>
                )}
            </button>
        </div>
    );
};

export default UploadForm;
