import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

const OKX_BASE = 'https://www.okx.com/api/v5';
const DERIBIT_BASE = 'https://www.deribit.com/api/v2';

app.use(cors());
app.use(express.json());

async function fetchWithTimeout(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

app.get('/api/okx/*', async (req, res) => {
    try {
        const endpoint = req.url.replace('/api/okx', '');
        const url = `${OKX_BASE}${endpoint}`;

        console.log(`[OKX] Proxying request to: ${url}`);

        const response = await fetchWithTimeout(url);
        const data = await response.json();

        res.json(data);

    } catch (error) {
        console.error('[OKX] Error:', error.message);
        res.status(500).json({
            error: 'Proxy error',
            message: error.message
        });
    }
});

app.get('/api/deribit', async (req, res) => {
    try {
        const { method, params } = req.query;

        if (!method) {
            return res.status(400).json({ error: 'Method parameter required' });
        }

        const parsedParams = params ? JSON.parse(params) : {};
        const queryString = Object.entries(parsedParams)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');

        const url = `${DERIBIT_BASE}/public/${method}${queryString ? '?' + queryString : ''}`;

        console.log(`[Deribit] Proxying request to: ${url}`);

        const response = await fetchWithTimeout(url);
        const data = await response.json();

        res.json(data);

    } catch (error) {
        console.error('[Deribit] Error:', error.message);
        res.status(500).json({
            error: 'Proxy error',
            message: error.message
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            okx: OKX_BASE,
            deribit: DERIBIT_BASE
        }
    });
});

app.listen(PORT, () => {
    console.log(`\n🚀 BTC Options Dashboard Proxy Server`);
    console.log(`📡 Running on http://localhost:${PORT}`);
    console.log(`\n🔗 Endpoints:`);
    console.log(`   - OKX: http://localhost:${PORT}/api/okx/*`);
    console.log(`   - Deribit: http://localhost:${PORT}/api/deribit`);
    console.log(`   - Health: http://localhost:${PORT}/api/health`);
    console.log(`\n✅ Proxy server ready!\n`);
});
