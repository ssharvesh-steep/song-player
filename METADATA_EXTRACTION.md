# Automatic Metadata Extraction Feature

## Overview

The upload form now **automatically extracts** all song information from the uploaded MP3 file. You only need to select the audio file - no manual data entry required!

## How It Works

### 1. Select Audio File
- Click the upload area
- Choose an MP3, M4A, or WAV file
- The app automatically reads the file's metadata

### 2. Automatic Extraction
The app extracts from ID3 tags:
- **Title** - Song name
- **Artist** - Artist/performer name  
- **Album Art** - Cover image embedded in the file

### 3. Preview & Upload
- Review the extracted information
- Click "Upload Song" to save
- Done! ✅

## Features

✅ **Automatic Title & Artist** - Extracted from ID3 tags  
✅ **Album Art Extraction** - Uses embedded cover art  
✅ **Smart Fallbacks** - Uses filename if metadata is missing  
✅ **Generated Placeholders** - Creates colorful placeholder if no album art  
✅ **Real-time Preview** - See extracted data before uploading  
✅ **Error Handling** - Graceful fallbacks for files without metadata

## What You'll See

### When you select a file:
1. **"Extracting metadata..."** - Reading the file
2. **Song Details Preview**:
   - Title: [Extracted from file]
   - Artist: [Extracted from file]
   - Album Art: ✓ Found in file / ⚠ Will generate placeholder

### Upload Process:
- If album art exists → Uses it
- If no album art → Generates a colorful gradient placeholder with music note

## Technical Details

- **Library**: `jsmediatags` - Industry-standard ID3 tag reader
- **Supported Formats**: MP3, M4A, WAV
- **Fallback Logic**: Filename → "Unknown Artist" if no metadata
- **Placeholder Generation**: Canvas-based gradient images

## Example

**Before** (Old way):
1. Select song file
2. Type title manually
3. Type artist manually
4. Select cover image file
5. Upload

**After** (New way):
1. Select song file
2. Upload ✅

That's it! Everything else is automatic.
