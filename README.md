# Floating Panel Widget - Chrome Extension

A versatile Chrome extension that adds a floating panel to every webpage, providing quick access to common actions and JavaScript bookmark execution. The panel is always visible and can be positioned anywhere on the page through drag-and-drop.

## Features

### Core Functionality

- **Always-visible floating panel** appears on every webpage (except `chrome://` URLs)
- **Drag & Drop positioning** - move the panel anywhere on the page
- **Touch device support** - fully functional on Android tablets and touch devices
- **State preservation** - remembers selected JavaScript bookmark across page reloads (within the same website)

### Panel Controls

The panel includes the following controls:

1. **Drag Handle (⋮⋮)**
   - Allows repositioning the panel
   - Works with both mouse and touch events

2. **Collapse Button (◀/▶)**
   - Collapses panel to save screen space
   - Only drag handle and collapse button remain visible when collapsed

3. **Print Button (🖨️)**
   - Quick access to browser's print functionality
   - Executes `window.print()`

4. **Copy URL Button (📋)**
   - Copies current page URL to clipboard
   - Visual feedback on successful copy

5. **JavaScript Bookmark Selector**
   - Dropdown menu listing all JavaScript bookmarks
   - Filters bookmarks starting with `javascript:` prefix

6. **Call Button**
   - Executes selected JavaScript bookmark code
   - Runs in the context of the current page

## Installation

### From Source

1. Download file: `build/FloatingPanel.crx`:

2. Open Chrome and drag'n'drop the `FloatingPanel.crx` file.

3. Click the button `Add extension`.

### From Chrome Web Store

*(Coming soon)*

## Usage

1. **Initial Setup**
   - Click the extension icon in Chrome toolbar
   - Press `Read browser bookmarks` to load your JavaScript bookmarks
   - The floating panel will appear on all webpages

2. **Panel Positioning**
   - Works on both desktop and touch devices

3. **Using JavaScript Bookmarks**
   - Select a bookmark from the dropdown
   - Click `Call` to execute the JavaScript code

4. **Space Management**
   - Click the collapse button (◀) to hide most controls
   - Click expand button (▶) to show all controls again

## Technical Details

### Architecture

The extension uses a two-script approach for security and functionality:

1. **Isolated World Script** (`content-isolated.js`)
   - Handles bookmark retrieval
   - Manages local storage
   - Runs in isolated context for security

2. **Main World Script** (`content-main.js`)
   - Controls floating panel UI
   - Handles user interactions
   - Executes JavaScript in page context

### Storage

- Uses `chrome.storage.local` for:
  - Cached JavaScript bookmarks
  - Selected bookmark index

### Security Considerations

- JavaScript execution is limited to user-defined bookmarks
- Content scripts are separated into isolated/main worlds
- No external script injection
- Restricted to non-chrome:// URLs
