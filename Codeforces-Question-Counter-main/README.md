# Codeforces Daily Tracker - Chrome Extension

A Chrome extension that tracks the number of Codeforces problems you've solved in the last 24 hours.

## Features

- 🎯 Real-time tracking of problems solved in the last 24 hours
- 🔄 Automatic updates every 30 minutes
- 🕐 Countdown timer showing time until the 24-hour window resets
- 📊 Badge display showing your current count
- 🎨 Beautiful gradient UI design

## Installation

### Step 1: Create Icon Files

1. **Open `generate_icons.html`** in any browser
2. **Click the download buttons** to save all three icon sizes:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)  
   - `icon128.png` (128x128 pixels)
3. **Save all icons** in the `cf_question_counter` folder

### Step 2: Load in Your Browser

#### 🦊 **Firefox** (Recommended - FREE!)

**Option A: Temporary Loading (for testing)**
1. Open Firefox
2. Navigate to `about:debugging#/runtime/this-firefox`
3. Click **"Load Temporary Add-on..."**
4. Navigate to your extension folder and select `manifest.json`
5. The extension loads instantly! (Will be removed when Firefox closes)

**Option B: Permanent Installation (for daily use)**
1. Open Firefox
2. Navigate to `about:config` (accept the warning)
3. Search for `xpinstall.signatures.required` and set it to `false`
4. Go to `about:addons`
5. Click the gear icon ⚙️ → "Install Add-on From File"
6. Select the `manifest.json` file from your extension folder
7. The extension stays permanently!

**Option C: Publish to Firefox Add-ons (FREE - no fee required!)**
1. Create an account at https://addons.mozilla.org/developers/
2. Click "Submit a New Add-on"
3. Zip your extension folder and upload it
4. After review (few days), it's available for everyone to install
5. **No registration fee** unlike Chrome!

#### 🌐 **Chrome** (Requires $5 developer fee for publishing)

**For Personal Use (Free)**
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **"Developer mode"** using the toggle in the top-right corner
3. Click **"Load unpacked"**
4. Select the `cf_question_counter` folder
5. The extension appears in your extensions list

**For Publishing (Costs $5)**
1. Pay one-time $5 developer registration at https://chrome.google.com/webstore/devconsole
2. Zip your extension folder
3. Upload to Chrome Web Store
4. After review, it's published

#### 🔷 **Microsoft Edge** (FREE!)

1. Open Edge and navigate to `edge://extensions/`
2. Enable **"Developer mode"**
3. Click **"Load unpacked"**
4. Select the `cf_question_counter` folder

### Step 3: Pin the Extension (Optional but Recommended)

- **Firefox**: Click the puzzle piece icon → Find "Codeforces Daily Tracker" → Click pin
- **Chrome/Edge**: Click the extensions icon → Pin "Codeforces Daily Tracker"

## Usage

1. **First Time Setup**:
   - Click on the extension icon in your Chrome toolbar
   - Enter your Codeforces handle (e.g., "tourist")
   - Click "Save Handle"
   - The extension will fetch your submissions and display your count

2. **Viewing Your Stats**:
   - Click the extension icon anytime to see your current count
   - The countdown timer shows when your 24-hour window resets
   - Your count is also displayed as a badge on the extension icon

3. **Refreshing**:
   - Click "Refresh Stats" to manually update your count
   - The extension automatically updates every 30 minutes in the background

4. **Changing Handle**:
   - Click "Change Handle" to enter a different Codeforces username

## How It Works

- The extension uses the official Codeforces API to fetch your submissions
- It counts unique problems you've solved (verdict = "OK") in the last 24 hours
- The 24-hour window is a rolling window from the current time, not calendar days
- Background updates run every 30 minutes to keep your count current
- The extension also checks every minute to see if it needs to update after crossing midnight

## Files

- `manifest.json` - Extension configuration
- `popup.html` - Extension popup interface
- `popup.css` - Styling for the popup
- `popup.js` - Logic for the popup interface
- `background.js` - Background service worker for periodic updates

## Notes

- The extension requires an internet connection to fetch data from Codeforces
- Make sure your Codeforces handle is spelled correctly
- The extension respects the Codeforces API rate limits
- The 24-hour count is based on when you submitted the solution, not when the contest occurred

## Privacy

- This extension only stores your Codeforces handle and submission count locally on your device
- No data is sent to any third-party servers except Codeforces API
- All data remains private and under your control

## Troubleshooting

- **"API Error" message**: Check that your handle is spelled correctly and that Codeforces.com is accessible
- **Extension not updating**: Try clicking "Refresh Stats" manually
- **Icons not showing**: Create PNG files named `icon16.png`, `icon48.png`, and `icon128.png` in the extension folder

## License

This is a free and open-source project. Feel free to modify and distribute.
