# Chapter Library - Local Folder Management

QuillPilot now supports saving and loading chapters to/from a local folder on your computer using the File System Access API.

## Features

### 📁 Local Storage

- Save chapters as JSON files in a folder of your choice
- No cloud storage required - all files stay on your machine
- Full control over your writing files

### 🔄 Chapter Management

- Save current chapter with one click
- "Save As" to create variations
- Load any saved chapter instantly
- Delete chapters you no longer need
- Auto-refresh chapter list

### 💾 What Gets Saved

Each chapter file includes:

- Chapter content (text)
- Chapter name
- Analysis results (if any)
- Last modified timestamp
- Unique chapter ID

## How to Use

### Initial Setup

1. **Open Chapter Library**

   - Click the hamburger menu (☰) in the top-left
   - Click "📚 Chapter Library"

2. **Select Your Chapters Folder**
   - Click "📁 Select Chapter Folder"
   - Choose or create a folder on your computer
   - Grant permission when prompted
   - QuillPilot will remember this folder

### Saving Chapters

**Quick Save:**

- In the Chapter Library, click "💾 Save [Chapter Name]"
- Updates existing file or creates new one

**Save As New:**

- Click "Save As..."
- Enter a new chapter name
- Click "Save"

### Loading Chapters

1. Open Chapter Library
2. Find the chapter you want
3. Click "📂 Load"
4. Chapter opens in the editor

### Managing Chapters

**Refresh List:**

- Click "🔄 Refresh" to see new files added outside QuillPilot

**Delete Chapter:**

- Click the "🗑️" button next to any chapter
- Confirm deletion (cannot be undone)

**Forget Folder:**

- Click "Forget This Folder" at the bottom
- Removes folder from memory
- Files remain on your computer
- Can select again later

## Browser Support

### ✅ Fully Supported

- **Chrome** 86+
- **Edge** 86+
- **Opera** 72+

### ⚠️ Not Supported

- Firefox (API not yet implemented)
- Safari (API not yet implemented)
- Older browser versions

If your browser doesn't support this feature, QuillPilot will show a warning and suggest using Chrome or Edge.

## File Format

Chapters are saved as `.json` files with this structure:

```json
{
  "id": "chapter_1234567890_abc123",
  "name": "Chapter 1 - The Beginning",
  "content": "Once upon a time...",
  "editorHtml": null,
  "analysis": {
    "conceptMentions": [...],
    "wordCount": 1234,
    ...
  },
  "lastModified": 1234567890123,
  "fileName": "Chapter_1_-_The_Beginning.json"
}
```

## Tips & Best Practices

### 📝 Naming Chapters

- Use descriptive names: "Chapter 3 - The Confrontation"
- Avoid special characters: < > : " / \ | ? \*
- Names are automatically sanitized for file systems

### 🗂️ Organization

- **One folder per project** - Keep each novel/story separate
- **Consistent naming** - Use "Chapter 1", "Chapter 2", etc.
- **Date prefixes** - Add dates like "2025-12-01-Chapter-1" for chronological sorting

### 💡 Workflow Suggestions

**Writing Multiple Chapters:**

1. Select your project's chapter folder
2. Write Chapter 1, click Save
3. Create new chapter in editor
4. Write Chapter 2, click Save
5. Switch between chapters using Load

**Version Control:**

1. Save "Chapter 3 - Draft 1"
2. Make major edits
3. Save As "Chapter 3 - Draft 2"
4. Keep both versions to compare

**Backup Strategy:**

- Chapters are just files in a folder
- Back up the entire folder to cloud storage (Dropbox, Google Drive, etc.)
- Create periodic backups before major edits

## Troubleshooting

### "Not Supported" Message

**Solution:** Use Chrome, Edge, or Opera browser.

### Can't Find Saved Chapters

**Check:**

- Did you select the correct folder?
- Are .json files in the folder?
- Click "🔄 Refresh" to reload the list

### Permission Denied

**Solution:**

- Browser may have lost permission
- Click "Forget This Folder"
- Select the folder again to restore permission

### Chapter Won't Load

**Possible causes:**

- File is corrupted
- File was edited outside QuillPilot
- Missing required fields in JSON

**Solution:**

- Open .json file in text editor
- Check JSON structure is valid
- Ensure required fields exist (id, name, content)

### Lost Chapter List After Browser Restart

**Note:** Browser permissions may reset. Simply select your folder again - all files are safe on your computer.

## Privacy & Security

### 🔒 Your Data Stays Local

- All chapters saved directly to your computer
- No data sent to servers
- No cloud storage
- You control file access

### 🛡️ Permissions

- QuillPilot only accesses the folder you select
- Read/write permission required
- Browser enforces strict security
- Permission can be revoked anytime

### 📦 Portability

- Chapters are standard JSON files
- Can be opened in any text editor
- Easy to share or transfer
- Not locked to QuillPilot

## Future Enhancements

Coming soon:

- Export all chapters to single document
- Chapter reordering
- Tags and categories
- Search across chapters
- Chapter templates
- Automatic backups
- Word count tracking per chapter

## Questions?

For help, click the "?" icon in the top navigation and select:

- **Quick Start Guide** - Basic QuillPilot tutorial
- **Help & Support** - Contact information

---

_Chapter Library feature requires a modern browser with File System Access API support. Files are stored locally on your computer - no internet connection required after initial page load._
