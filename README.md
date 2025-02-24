# Link Lasso

A Chrome extension for gathering multiple links by hovering while right-clicking, and handling images with gesture-based actions.

## Features

- **Link Gathering**: Hold right-click and hover over links to collect them
- **Batch Opening**: Release right-click to open all collected links in background tabs
- **Link Copying**: Hold Shift while releasing right-click to copy all collected links to clipboard
- **Image Actions**: 
  - Drag left: Copy image URL
  - Drag up: Copy image to clipboard
  - Drag down/right: Download image

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Testing

The extension includes a browser-based test suite that verifies core functionality:

1. Open `tests/content.test.html` in a browser to run the tests
2. Tests cover:
   - Link parent finding and highlighting
   - Drag direction detection
   - Toast notifications
   - Link counter updates
   - Color and style applications

The test suite uses vanilla JavaScript and runs in any modern browser, no additional dependencies required.

## Development

The extension consists of:
- `manifest.json`: Extension configuration
- `src/content.js`: Main content script for link and image handling
- `background.js`: Background script for tab management
- `tests/content.test.html`: Browser-based test suite 