# ⚡ Quick Start - Get Trading in 30 Seconds!

## For Regular Users (No Installation)

### Step 1: Download
Download the `dashboard.html` file to your computer

### Step 2: Open
**Double-click** the `dashboard.html` file

That's it! The dashboard opens in your browser! 🎉

---

## What You See

### 1. **Position Entry** (Top Section)
Enter your BTC options positions here

**Long Position (LEAP or Spot BTC)**
- For LEAP: Enter contract ID like `BTC-USD-270627-100000-C`
- For Spot: Toggle "Use Spot BTC" and enter spot price

**Short Position (Weekly Call)**
- Enter contract ID like `BTC-USD-251129-95000-C`

### 2. **Active Positions** (Middle Section)
See your positions with:
- Live mark prices (updates every 10 seconds)
- Current PNL in BTC and USD
- Greeks (Delta, Gamma, Theta, Vega)
- Close or Roll buttons

### 3. **Summary** (Bottom Section)
Portfolio overview:
- Long PNL, Short PNL, Total PNL
- Realized PNL from closed positions
- Combined Greeks

### 4. **Debug Window** (Button at bottom-right)
Click "Show Debug Window" to see:
- Which exchange is providing data (OKX or Deribit)
- Connection status
- Any errors or fallbacks

---

## Example: Adding Your First Position

### Long LEAP Example:
1. Contract: `BTC-USD-270627-100000-C`
2. Entry Price: `0.05` (BTC)
3. Amount: `10`
4. Contract Size: `0.01`
5. Click "Add Long Position"

### Short Weekly Example:
1. Contract: `BTC-USD-251129-95000-C`
2. Entry Price: `0.003` (BTC)
3. Amount: `10`
4. Contract Size: `0.01`
5. Click "Add Short Position"

Done! Now watch your PNL update in real-time! 📊

---

## Common Actions

### Close a Position
1. Click "Close Position" button
2. Enter closing price in BTC
3. PNL is added to your Realized PNL
4. Position is removed

### Roll a Position
1. Click "Roll Position" button
2. Enter closing price for current contract
3. Enter new contract ID and entry price
4. Click "Execute Roll"
5. Old PNL goes to Realized, new position becomes active

### View Connection Details
1. Click "Show Debug Window" at bottom-right
2. See all API calls, successes, errors
3. Monitor which exchange is being used
4. Track fallback events

---

## Understanding the Numbers

### BTC Values (Primary)
All calculations are in BTC:
- `+0.0234 BTC` = Profit
- `-0.0123 BTC` = Loss

### USD Values (Secondary)
Shown in parentheses:
- `($2,234.50)` = BTC value × current BTC price
- Updates with BTC price movements

### Greeks
- **Δ (Delta)**: BTC price exposure
- **Γ (Gamma)**: Delta change per $1 BTC move
- **θ (Theta)**: Daily time decay
- **ν (Vega)**: Volatility sensitivity

---

## Tips & Tricks

✅ **Bookmark the file** for quick access

✅ **Your data is saved** automatically in your browser

✅ **Works offline** (but needs internet for live prices)

✅ **Multiple portfolios?** Copy the file and rename it

✅ **Mobile friendly** - works on phone/tablet browsers

✅ **No login required** - everything is local

✅ **Safe & private** - no data leaves your device

---

## Troubleshooting

**"Connection Error" shown?**
- Check internet connection
- Click "Show Debug Window" to see details
- Refresh the page

**Prices not updating?**
- Check Debug Window for errors
- May be using Deribit fallback (normal)
- Exchanges might be temporarily unavailable

**Data disappeared?**
- Using private/incognito mode? Data doesn't persist there
- Browser cleared cache? Data is in localStorage
- Regular mode saves data between sessions

**Can't add position?**
- Fill all required fields
- Check contract ID format
- Entry price must be a number

---

## Need More Help?

📖 **Detailed Guide**: See [STANDALONE-README.md](STANDALONE-README.md)

📋 **Full Features**: See [README.md](README.md)

🔧 **Contract Format**: `BTC-USD-YYMMDD-STRIKE-C/P`
- Example: `BTC-USD-251129-95000-C`
- `YYMMDD`: Expiry (Nov 29, 2025)
- `95000`: Strike price
- `C`: Call (or `P` for Put)

---

**Happy Trading! 🚀**
