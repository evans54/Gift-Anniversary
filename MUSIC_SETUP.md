# Music Setup Guide

## 🎵 How to Add Your Romantic Song

### Step 1: Place Your MP3 File
1. Copy your downloaded MP3 file into the `music/` folder
2. Rename it to: `romantic-song.mp3`

Your folder structure should look like:
```
Gift-Anniversary/
├── music/
│   └── romantic-song.mp3  ← Your song goes here
├── images/
├── index.html
├── styles.css
└── script.js
```

### Step 2: Test It
1. Start your local server: `npx http-server -p 8080`
2. Open `http://localhost:8080` in your browser
3. Click the music note button (bottom-right corner)
4. Your song should start playing!

### Step 3: Customize (Optional)
- **Default Volume**: Change `musicVolume = 0.3` in script.js (0.0 to 1.0)
- **Auto-play**: The music will remember if it was playing last time

### Troubleshooting
- **Song not playing?** Check that the file is named exactly `romantic-song.mp3`
- **No sound?** Make sure your browser allows audio playback
- **File too big?** Consider compressing the MP3 for faster loading

### Supported Formats
- MP3 (recommended)
- WAV
- OGG
- M4A

Enjoy your romantic background music! 🎶
