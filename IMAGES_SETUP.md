# How to Add Your Personal Images

## Quick Setup

### Step 1: Create an Images Folder
In your project directory (same folder as `index.html`), create a new folder called `images/`:

```
Gift-Anniversary/
├── index.html
├── package.json
├── README.md
├── images/          ← Create this folder
│   ├── story1.jpg   ← Add your images here
│   ├── story2.jpg
│   └── story3.jpg
└── tests/
```

### Step 2: Add Your Images
Place your images in the `images/` folder with these names:
- `story1.jpg`
- `story2.jpg`
- `story3.jpg`

### Step 3: Done!
The page will automatically use your images instead of the colored placeholders. The images are already configured to:
- Zoom in smoothly when the story loads (animation effect)
- Fit nicely in the story view
- Maintain aspect ratio and look good on mobile

## Image Recommendations

**Best practices:**
- **Format:** JPG, PNG, or WebP (smaller file sizes are better)
- **Size:** 800×600px or larger (doesn't need to be huge; 2-3 MB per image max)
- **Aspect Ratio:** 16:10 (wider/landscape orientation works best)
- **Quality:** Clear, well-lit photos work best

**Example:**
- Cropped couple selfie for story1
- Candid moment at a date for story2
- Happy/smiling photo together for story3

## Changing Image Paths

If you prefer different filenames or a different folder structure, edit `index.html` and find these lines in the story sections:

```html
<img src="images/story1.jpg" alt="The First Meeting" ... />
<img src="images/story2.jpg" alt="Growing Closer" ... />
<img src="images/story3.jpg" alt="One Month Together" ... />
```

Change `images/story1.jpg` to your custom path, e.g.:
- `images/photo1.png`
- `photos/meeting.jpg`
- `assets/story-1.webp`

## Troubleshooting

**Images not showing?**
1. Check that files exist in the correct folder
2. Verify filenames match exactly (case-sensitive on Mac/Linux)
3. Open browser console (F12) and check for 404 errors
4. Ensure image files are readable (not corrupted)

**Want to use URLs instead of local files?**
You can also use direct image URLs:
```html
<img src="https://example.com/photo.jpg" alt="..." />
```

## Optional: Gallery Thumbnail Images

The story cards on the first page (Section 0) show colorful SVG placeholders. If you want those to show thumbnail previews of your images instead, let me know and I can add that feature!
