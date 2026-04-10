

# Add Drag-and-Drop Upload for Title Document and Photos

## What This Does
Replaces the current file-picker-only upload for the Title Document and Photos sections on the admin Trailer Detail page with drag-and-drop zones. Users can drag files directly from their desktop/drive onto the upload area instead of navigating through a file browser dialog. The existing button upload will still work as a fallback.

## Changes

### 1. Title Document section — add drop zone
**File:** `src/pages/admin/TrailerDetail.tsx` (lines ~1254-1334)

- Wrap the Title Document card content area in a drop zone `div` with `onDragOver`, `onDragLeave`, and `onDrop` handlers
- On drop, call the same upload logic currently triggered by the hidden file input
- Show a visual dashed-border highlight when a file is dragged over the area
- Display helper text: "Drag & drop title document here, or click Upload"
- Add `isDraggingTitle` state to toggle the highlight styling

### 2. Photos section — add drop zone
**File:** `src/pages/admin/TrailerDetail.tsx` (lines ~1336-1430)

- Wrap the Photos card content area in a drop zone `div` with the same drag event handlers
- On drop, feed the dropped files into the existing `handlePhotoUpload` logic (refactored to accept a `FileList` parameter)
- Show dashed-border highlight during drag-over
- Display helper text: "Drag & drop photos here, or click Upload Photos"
- Add `isDraggingPhotos` state for highlight styling

### 3. Refactor upload handlers
**File:** `src/pages/admin/TrailerDetail.tsx`

- Extract the photo upload logic from the `onChange` handler into a shared `processPhotoFiles(files: FileList)` function so both the input change event and the drop event can call it
- Similarly extract title upload logic into `processTitleFile(file: File)`

### Technical Details
- Uses native HTML5 drag-and-drop API (`onDragOver`, `onDragLeave`, `onDrop`) — no new dependencies
- `e.preventDefault()` on `onDragOver` to allow drops
- `e.dataTransfer.files` provides the dropped `FileList`
- Visual feedback: conditional `border-primary border-dashed bg-primary/5` classes when dragging

