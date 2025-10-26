# Storage Files for Firebase Teaching App

This directory contains sample files for teaching Firebase Storage concepts. The seed script **automatically generates** placeholder files if none exist, ensuring a complete "clone and seed" workflow.

## 🎯 Quick Start

**No manual setup required!** When you run the seed script, it will automatically generate:
- ✅ 5 sample images (SVG format with colored backgrounds)
- ✅ 3 sample documents (TXT, MD, JSON formats)
- ✅ 10 avatar images (SVG circles with initials for each test user)

These files are **not committed to git** but are generated on-demand during seeding.

## 📁 Directory Structure

### Images Directory (`images/`)
**Auto-generated files:**
- `sample-1.svg` through `sample-5.svg` - Colored SVG images with text labels

**Purpose:** Demonstrate image upload/download, public URL generation, and file metadata.

### Documents Directory (`documents/`)
**Auto-generated files:**
- `user-guide.txt` - Sample text document about Firebase Storage
- `terms-of-service.md` - Sample markdown document
- `data-export.json` - Sample JSON data file

**Purpose:** Show Firebase Storage works with any file type, not just images.

### Avatars Directory (`avatars/`)
**Auto-generated files:**
- `alice.anderson.svg` through `jack.johnson.svg` - 10 avatar images with initials

**Purpose:** Demonstrate user profile images tied to Authentication users.

## 🔧 How It Works

1. **First-time seed:** Script detects empty directories and generates placeholder files
2. **Upload:** Generated files are uploaded to Firebase Storage emulator
3. **Re-seeding:** If files exist, script skips generation (idempotent)
4. **Manual override:** You can replace auto-generated files with real images/documents

## 🎨 Upgrading to Real Files (Optional)

The auto-generated files work perfectly for teaching, but you can enhance demos with real files:

### Adding Custom Images
Replace auto-generated SVG files with real photos (JPG, PNG, WebP):
```bash
# Example: Add your own images
cp my-landscape.jpg images/sample-landscape.jpg
cp my-abstract.png images/sample-abstract.png
```

### Adding Custom Documents
Replace or add document files:
```bash
# Example: Add PDF files
cp firebase-guide.pdf documents/user-guide.pdf
cp terms.pdf documents/terms-of-service.pdf
```

### Adding Custom Avatars
Replace avatar SVGs with real photos:
```bash
# Must match test user email prefixes
cp real-avatar-1.jpg avatars/alice.anderson.jpg
cp real-avatar-2.jpg avatars/bob.builder.jpg
```

**File naming convention for avatars:**
- Extract username from email: `alice.anderson@example.com` → `alice.anderson`
- Add appropriate extension: `.jpg`, `.png`, `.svg`

## 📏 File Size Recommendations

**Auto-generated files (current):**
- Images: ~300 bytes each (SVG)
- Documents: 200-400 bytes each (TXT/MD/JSON)
- Avatars: ~330 bytes each (SVG)
- **Total: < 10KB** (git-friendly!)

**Custom files (if you add them):**
- Images: 100KB - 1MB each
- Documents: 50KB - 500KB each
- Avatars: 20KB - 100KB each
- **Recommended total: < 10MB** (to avoid repository bloat)

## 🔄 Git Behavior

**Auto-generated files are NOT committed:**
- The `.gitignore` excludes `*.svg`, `*.png`, `*.jpg`, `*.txt`, `*.md`, `*.json` in these directories
- This keeps the repository lean
- Every developer gets fresh files from the seed script

**Manual override files CAN be committed:**
- If you want to share real files, they'll be ignored by default
- To commit custom files, you'll need to force-add them: `git add -f path/to/file`
- Consider whether committing binaries is worth the repo size increase

## 🎓 Teaching Use Cases

### Use Case 1: File Upload UI
Demo building a file picker that uploads to `images/` or `documents/`.

### Use Case 2: Avatar Management
Show how to associate user profile pictures with Authentication accounts (upload to `avatars/`).

### Use Case 3: Public vs. Private Files
Demonstrate security rules by making `images/` public and `documents/` private.

### Use Case 4: File Metadata
Show how to read file size, content type, and timestamps from Storage.

### Use Case 5: Download URLs
Generate and display public download URLs for uploaded files.

## 🛠️ Troubleshooting

**No files in Storage after seeding:**
- Check that emulators are running: `pnpm emulators:start`
- Verify seed script completed: Look for "✅ Seeding completed successfully!"
- Check Emulator UI: `http://127.0.0.1:5400` → Storage tab

**Files not generating:**
- The seed script checks for existing files first
- If generation fails, check console output for errors
- Verify write permissions on `storage-files/` directories

**Want to regenerate files:**
```bash
# Remove generated files and re-seed
rm -rf scripts/seed-data/storage-files/images/*.svg
rm -rf scripts/seed-data/storage-files/documents/*
rm -rf scripts/seed-data/storage-files/avatars/*.svg
pnpm seed
```

## 📚 Related Documentation

- Main seed script: [`../seed.ts`](../seed.ts)
- Seed data overview: [`../README.md`](../README.md)
- Project README: [`../../../README.md`](../../../README.md)

---

**Summary:** This directory uses smart auto-generation to provide a complete Firebase Storage teaching experience without requiring manual file preparation or committing binary files to git. The "clone and seed" workflow just works! 🎉


