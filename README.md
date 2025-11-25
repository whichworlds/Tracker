# BTC Options Dashboard

A real-time Bitcoin options trading dashboard with OKX and Deribit integration.

## Features

- **BTC-Denominated Calculations**: All values calculated in BTC with USD display
- **Live Data Fetching**: Real-time mark prices and Greeks from OKX (primary) with automatic Deribit fallback
- **Dual Source Support**: Automatic failover from OKX to Deribit
- **Position Management**:
  - Long positions (LEAP calls or Spot BTC)
  - Short positions (Weekly calls)
  - Rolling system with realized PNL tracking
- **Spot BTC Mode**: Use Spot BTC (Δ = 1.0) as alternative to LEAP
- **Live Greeks**: Delta, Gamma, Theta, Vega for all option positions
- **PNL Tracking**:
  - Live PNL for active positions
  - Realized PNL from closed/rolled positions
  - Total PNL (Live + Realized)
- **Diagnostics Panel**: Real-time API connection status, fallback events, and debug logs

## Installation

```bash
npm install
```

## Running the Dashboard

The dashboard requires two servers:

### 1. Start the Proxy Server (Required for CORS)

```bash
npm run proxy
```

This starts the proxy server on `http://localhost:3001`

### 2. Start the Web Dashboard

In a separate terminal:

```bash
npm run dev
```

This starts the Vite dev server on `http://localhost:3000`

The dashboard will automatically open in your browser.

## Usage

### Adding Positions

#### Long Position (LEAP or Spot)

**Option Mode (LEAP):**
1. Enter contract ID (e.g., `BTC-USD-270627-100000-C`)
2. Entry price in BTC
3. Amount (number of contracts)
4. Contract size in BTC

**Spot Mode:**
1. Toggle "Use Spot BTC" switch
2. Enter spot entry price (USD)
3. Enter BTC amount

#### Short Position (Weekly Call)

1. Enter contract ID (e.g., `BTC-USD-251121-92000-C`)
2. Entry price in BTC
3. Amount (number of contracts)
4. Contract size in BTC

### Position Management

**Close Position:**
- Click "Close Position" button
- Enter closing price
- PNL automatically added to Realized PNL

**Roll Position:**
- Click "Roll Position" button
- Enter closing price for current position
- Enter new contract ID and entry price
- Old position PNL added to Realized PNL
- New position becomes active

### Monitoring

**Live Updates:**
- Mark prices update every 10 seconds
- Greeks update automatically
- Connection status shown in header

**Debug Window:**
- Click "Show Debug Window" at bottom
- View API queries (OKX/Deribit)
- See success/error status
- Monitor fallback events
- Track connection status

## API Endpoints Used

### OKX (Primary Source)

- Mark Price: `GET /api/v5/public/mark-price?instType=OPTION&instId={instId}`
- Greeks: `GET /api/v5/public/option-summary?instId={instId}`
- BTC Spot: `GET /api/v5/public/mark-price?instType=SPOT&instId=BTC-USDT`

### Deribit (Fallback Source)

- Index Price: `GET /api/v2/public/get_index_price?index_name=btc_usd`
- Greeks: `GET /api/v2/public/get_book_summary_by_instrument?instrument_name={instrument}`

## Calculations

### PNL Calculations (BTC)

```
Long PNL  = (Mark_Long - Entry_Long) × Amount × ContractSize
Short PNL = (Entry_Short - Mark_Short) × Amount × ContractSize
Spot PNL  = ((SpotPrice - EntryPrice) / SpotPrice) × Amount

Total Live = Long PNL + Short PNL
Total PNL  = Live PNL + Realized PNL
```

### Greeks (BTC Exposure)

```
Total Delta = Long_Delta × Long_Amount × ContractSize
            - Short_Delta × Short_Amount × ContractSize
            + Spot_Amount (if spot mode enabled)

(Similar for Gamma, Theta, Vega)
```

## Data Persistence

Positions and realized PNL are automatically saved to browser localStorage.

## Development

### Project Structure

```
/
├── index.html              # Main HTML
├── package.json            # Dependencies
├── proxy-server.js         # CORS proxy for API calls
├── vite.config.js          # Vite configuration
└── src/
    ├── main.js             # Main application logic
    ├── dataLayer.js        # API fetching with fallback
    └── styles.css          # Styling
```

### Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Example Contracts

### OKX Format

- Long LEAP: `BTC-USD-270627-100000-C`
- Short Weekly: `BTC-USD-251121-92000-C`

Format: `{CRYPTO}-{FIAT}-{YYMMDD}-{STRIKE}-{C|P}`

## Troubleshooting

**No data appearing:**
- Check that proxy server is running on port 3001
- Open debug window to see API errors
- Verify internet connection

**Fallback to Deribit:**
- Normal if OKX is rate-limiting or down
- Check debug window for fallback events

**Connection errors:**
- Ensure proxy server is running
- Check firewall settings
- Verify OKX/Deribit services are online

## License

MIT
