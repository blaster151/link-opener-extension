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

### Local Installation (Development)
1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

### Chrome Web Store Submission
To publish the extension to the Chrome Web Store:

1. Create a developer account:
   - Visit the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Pay one-time $5 registration fee
   - Select "non-trader" account type (for personal/hobby projects not operating as a business)

2. Prepare required assets:
   - Screenshots (1280x800 or 640x400)
   - Store icon (128x128)
   - Promotional images (optional)
   - Detailed description (see `store-assets/description.txt`)

3. Create the package:
   - Zip all extension files (manifest.json, src/, icons/)
   - Ensure the zip doesn't include unnecessary files (.git, tests/, etc.)

4. Submit through Developer Dashboard:
   - Click "New Item"
   - Upload the zip file
   - Fill in store listing details
   - Add screenshots and images
   - Set visibility and regions
   - Submit for review

5. Wait for review:
   - Review typically takes a few business days
   - Address any feedback if required
   - Once approved, the extension will be published

### Screenshot Guide
Recommended screenshots for the Chrome Web Store listing (1280x800 or 640x400):

A demo page is provided at `store-assets/demo.html` specifically for taking screenshots. It includes:
- A clean article layout for link gathering demos
- Sample images for gesture demonstrations
- Proper spacing and styling for clear screenshots
- Instructions for capturing at the right dimensions

To use the demo page:
1. Open `store-assets/demo.html` in Chrome
2. Set your browser window to 1280px width
3. Click the instructions box to hide it
4. Take screenshots while demonstrating:

1. **Link Gathering in Action**
   - Show a webpage with multiple links (e.g., a news site or search results)
   - Capture mid-hover with several links highlighted in red-orange
   - Include the link counter visible in the corner
   - Demonstrate the red lasso trail effect

2. **Image Gesture Guide**
   - Show an image with directional arrows overlaid
   - Label each direction with its action:
     ```
     ↑ Copy to clipboard
     ← Copy URL
     ↓ Download
     → Download
     ```
   - Include the cursor changing based on direction

3. **Link Collection Features**
   - Use the split-view demo section showing:
     - Left: Links highlighted and counter visible
     - Right: Browser tabs showing opened links
   - Both panels include relevant toast notifications
   - Demonstrates maintaining focus on original page

4. **Image Handling Demo**
   - Show sequence of image actions:
     - Image being dragged
     - Toast notification of success
     - Result (e.g., downloaded file or clipboard)

Tips for screenshots:
- Use a clean, modern website for demonstrations
- Ensure text is readable at store thumbnail size
- Highlight interactive elements
- Show toast notifications and visual feedback
- Use arrows or highlights to draw attention to key features

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
- `store-assets/`: Chrome Web Store listing materials 