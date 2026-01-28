# FRT G2G Browser Extension

A Chrome extension to import trail condition reports from Facebook groups into FRT G2G.

## Installation (Developer Mode)

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this `extension` folder
5. The extension icon should appear in your toolbar

## Usage

1. Go to one of the Facebook trail groups:
   - [MTB Front Range](https://www.facebook.com/groups/mtbfrontrange)
   - [303 Trail Conditions](https://www.facebook.com/groups/303TrailConditions)

2. Scroll through posts - any post that appears to be about trail conditions will show an "Import to G2G" button

3. Click the button to extract the post

4. Click the extension icon in your toolbar to review the extracted data:
   - The AI will attempt to detect which trail system and what conditions
   - You can adjust the trail and status before importing
   - Click "Import Report" to submit to FRT G2G

## How It Works

- **Content Script**: Runs on Facebook group pages, adds import buttons to trail-related posts
- **Popup**: Shows extracted post data and AI analysis for review before submitting
- **Local Analysis**: Uses keyword matching to detect trails and conditions
- **API Analysis**: Optionally calls the FRT G2G API for enhanced parsing

## Configuration

Edit `src/popup.js` and change `API_BASE_URL` to point to your deployed FRT G2G instance:

```javascript
const API_BASE_URL = 'http://localhost:3000'; // Change to your production URL
```

## Privacy Notes

- This extension only activates on Facebook group pages
- No data is collected or sent until you explicitly click "Import Report"
- Posts are processed locally first; API calls only happen when you submit
- You remain in control of what gets imported

## Icons

The included icons are placeholders. Replace the PNG files in `/icons` with proper icons:
- icon16.png (16x16)
- icon48.png (48x48)
- icon128.png (128x128)
