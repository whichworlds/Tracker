# BTC Options Dashboard - Standalone Version

## 🚀 Quick Start - Zero Installation!

**Just open `dashboard.html` in your browser and start trading!**

No npm, no Node.js, no installation, no command line - just double-click the HTML file!

## ✨ Features

- **100% Standalone**: Everything in one HTML file
- **No Installation**: Works directly in any modern browser
- **Cross-Platform**: Windows, Mac, Linux, or even mobile browsers
- **Offline-Capable**: Once loaded, core functionality works without internet (except live data fetching)
- **BTC-Denominated**: All calculations in BTC with USD display
- **Live Data**: Real-time prices from OKX with automatic Deribit fallback
- **Auto CORS Handling**: Uses public CORS proxy when direct access fails
- **Local Storage**: Your positions persist between sessions

## 📖 How to Use

### Step 1: Open the File
- **Windows**: Double-click `dashboard.html`
- **Mac**: Double-click `dashboard.html` or right-click → Open With → Chrome/Firefox/Safari
- **Linux**: Double-click or `xdg-open dashboard.html`
- **Mobile**: Upload to Google Drive/Dropbox and open in mobile browser

### Step 2: Add Your Positions

#### Long Position (LEAP or Spot BTC)
1. **For LEAP calls**: Enter contract ID, entry price (BTC), amount, and contract size
2. **For Spot BTC**: Toggle "Use Spot BTC" and enter spot entry price (USD) and BTC amount

#### Short Position (Weekly Calls)
1. Enter contract ID (e.g., `BTC-USD-251129-95000-C`)
2. Entry price in BTC
3. Amount and contract size

### Step 3: Monitor Your Portfolio
- Live PNL updates every 10 seconds
- Real-time Greeks (Delta, Gamma, Theta, Vega)
- Automatic failover if OKX is unavailable
- Connection status in header

### Step 4: Manage Positions
- **Close**: Realizes PNL and removes position
- **Roll**: Closes current and opens new position, realizes PNL from old position

## 🔍 Debug Panel

Click **"Show Debug Window"** at the bottom to see:
- Which API is being queried (OKX/Deribit)
- Success/error status for each request
- Automatic fallback events
- CORS proxy usage
- Live connection diagnostics

## 📊 Understanding the Display

### Summary Panel Shows:
- **Long PNL**: Profit/loss from long positions
- **Short PNL**: Profit/loss from short positions
- **Total Live PNL**: Combined unrealized PNL
- **Realized PNL**: PNL from closed/rolled positions
- **Total PNL**: Live + Realized
- **Combined Greeks**: Total portfolio Greek exposure

### All Values:
- **Primary**: BTC amount (e.g., +0.0234 BTC)
- **Secondary**: USD equivalent (e.g., ($2,234.50))

## 🔄 Data Sources

1. **Primary**: OKX API (direct access)
2. **CORS Proxy**: If direct access blocked (automatic)
3. **Fallback**: Deribit API (automatic on OKX failure)

The dashboard intelligently handles:
- CORS restrictions
- Rate limiting
- Network timeouts
- API failures
- Missing data

## 💾 Data Persistence

Your positions and realized PNL are saved automatically to browser localStorage:
- Survives browser restart
- Works offline (with last known data)
- Can be cleared via browser settings if needed

## 🌐 Sharing & Backup

### To Share With Others:
Simply send them the `dashboard.html` file - that's it!

### To Backup Your Data:
Your data is stored in browser localStorage. To backup:
1. Open Debug Window
2. Open browser Developer Console (F12)
3. Run: `console.log(localStorage.getItem('btc-options-dashboard'))`
4. Copy the output and save to a text file

### To Restore Data:
1. Open browser Developer Console (F12)
2. Run: `localStorage.setItem('btc-options-dashboard', 'YOUR_BACKUP_DATA_HERE')`
3. Refresh the page

## 📱 Mobile Usage

The dashboard works on mobile browsers:
1. Upload `dashboard.html` to cloud storage (Google Drive, Dropbox, iCloud)
2. Open in mobile browser
3. Add to home screen for app-like experience

## 🔒 Security & Privacy

- **No Server**: Everything runs locally in your browser
- **No Tracking**: No analytics, no external scripts
- **Your Data**: Stays on your device
- **Read-Only APIs**: Only fetches public market data
- **No Keys Required**: No API keys needed

## ⚠️ Important Notes

1. **Internet Required**: For live price updates (not for offline viewing)
2. **Browser Compatibility**: Works in Chrome, Firefox, Safari, Edge (any modern browser)
3. **CORS**: May use public proxy (corsproxy.io) if direct API access is blocked
4. **Greeks Accuracy**: Greeks come from exchange APIs, not calculated locally

## 🛠️ Troubleshooting

### "Connection Error" in header:
- Check internet connection
- Try refreshing the page
- Check Debug Window for specific errors
- Exchange APIs might be temporarily unavailable

### Prices not updating:
- Open Debug Window to see what's happening
- May be using fallback data source
- Check if exchanges are accessible from your location

### Data disappeared:
- Check if browser cleared localStorage
- Import from backup (see above)
- Browser private/incognito mode doesn't persist data

### Can't add positions:
- Ensure all fields are filled
- Check contract ID format: `BTC-USD-YYMMDD-STRIKE-C/P`
- Entry price must be a valid number

## 🎯 Example Contract IDs

### OKX Format:
- Long LEAP: `BTC-USD-270627-100000-C`
- Short Weekly: `BTC-USD-251129-95000-C`
- Format: `BTC-USD-YYMMDD-STRIKE-C/P`

Where:
- `YYMMDD`: Expiry date (year, month, day)
- `STRIKE`: Strike price in USD
- `C`: Call option, `P`: Put option

## 💡 Tips

1. **Bookmark the file**: Add to browser bookmarks for quick access
2. **Multiple portfolios**: Copy the file and rename (e.g., `dashboard-portfolio1.html`)
3. **Desktop shortcut**: Create a shortcut to the HTML file
4. **Auto-refresh**: Dashboard auto-updates every 10 seconds
5. **Debug for learning**: Watch the Debug Window to understand API calls

## 🤝 Support

This is a standalone tool. All data processing happens in your browser.

For questions about:
- **OKX contracts**: Check OKX documentation
- **Deribit contracts**: Check Deribit documentation
- **Options Greeks**: Standard options pricing theory

## 📋 Calculations Reference

```
Long PNL  = (Mark_Long - Entry_Long) × Amount × ContractSize
Short PNL = (Entry_Short - Mark_Short) × Amount × ContractSize
Spot PNL  = ((SpotPrice - EntryPrice) / SpotPrice) × Amount

Total Live = Long PNL + Short PNL
Total PNL  = Live PNL + Realized PNL

Delta = (Long_Delta × Amount × Size) - (Short_Delta × Amount × Size) + Spot_Amount
```

---

**That's it! No setup, no hassle, just options trading analytics! 🚀**
