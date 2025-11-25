const PROXY_URL = 'http://localhost:3001/api';
const OKX_BASE = 'https://www.okx.com/api/v5';
const DERIBIT_BASE = 'https://www.deribit.com/api/v2';

class DataLayer {
    constructor() {
        this.debugCallbacks = [];
        this.useProxy = true;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }

    onDebug(callback) {
        this.debugCallbacks.push(callback);
    }

    log(message, type = 'info', source = null) {
        const entry = {
            timestamp: new Date().toISOString(),
            message,
            type,
            source
        };
        this.debugCallbacks.forEach(cb => cb(entry));
    }

    async fetchWithRetry(url, options = {}, attempts = this.retryAttempts) {
        for (let i = 0; i < attempts; i++) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 10000);

                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });

                clearTimeout(timeout);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                if (i === attempts - 1) throw error;

                this.log(`Retry ${i + 1}/${attempts - 1} after error: ${error.message}`, 'warning');
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
            }
        }
    }

    async fetchOKXMarkPrice(instId) {
        const endpoint = `/public/mark-price?instType=OPTION&instId=${instId}`;
        this.log(`Querying OKX mark price for ${instId}`, 'info', 'OKX');

        try {
            const url = this.useProxy
                ? `${PROXY_URL}/okx${endpoint}`
                : `${OKX_BASE}${endpoint}`;

            const data = await this.fetchWithRetry(url);

            if (data.code !== '0') {
                throw new Error(`OKX API error: ${data.msg || 'Unknown error'}`);
            }

            if (!data.data || data.data.length === 0) {
                throw new Error('No data returned from OKX');
            }

            const result = parseFloat(data.data[0].markPx);
            this.log(`✓ OKX mark price: ${result} BTC`, 'success', 'OKX');
            return result;

        } catch (error) {
            this.log(`✗ OKX mark price failed: ${error.message}`, 'error', 'OKX');
            throw error;
        }
    }

    async fetchOKXGreeks(instId) {
        const endpoint = `/public/option-summary?instId=${instId}`;
        this.log(`Querying OKX Greeks for ${instId}`, 'info', 'OKX');

        try {
            const url = this.useProxy
                ? `${PROXY_URL}/okx${endpoint}`
                : `${OKX_BASE}${endpoint}`;

            const data = await this.fetchWithRetry(url);

            if (data.code !== '0') {
                throw new Error(`OKX API error: ${data.msg || 'Unknown error'}`);
            }

            if (!data.data || data.data.length === 0) {
                throw new Error('No data returned from OKX');
            }

            const item = data.data[0];
            const greeks = {
                delta: parseFloat(item.delta) || 0,
                gamma: parseFloat(item.gamma) || 0,
                theta: parseFloat(item.theta) || 0,
                vega: parseFloat(item.vega) || 0
            };

            this.log(`✓ OKX Greeks received`, 'success', 'OKX');
            return greeks;

        } catch (error) {
            this.log(`✗ OKX Greeks failed: ${error.message}`, 'error', 'OKX');
            throw error;
        }
    }

    async fetchDeribitMarkPrice(instId) {
        const instrument = this.convertOKXToDeribit(instId);
        this.log(`Querying Deribit mark price for ${instrument}`, 'info', 'Deribit');

        try {
            const url = this.useProxy
                ? `${PROXY_URL}/deribit?method=get_index_price&params=${encodeURIComponent(JSON.stringify({ index_name: 'btc_usd' }))}`
                : `${DERIBIT_BASE}/public/get_index_price?index_name=btc_usd`;

            const data = await this.fetchWithRetry(url);

            if (!data.result) {
                throw new Error('Invalid response from Deribit');
            }

            const result = data.result.index_price;
            this.log(`✓ Deribit mark price: ${result}`, 'success', 'Deribit');
            return result;

        } catch (error) {
            this.log(`✗ Deribit mark price failed: ${error.message}`, 'error', 'Deribit');
            throw error;
        }
    }

    async fetchDeribitGreeks(instId) {
        const instrument = this.convertOKXToDeribit(instId);
        this.log(`Querying Deribit Greeks for ${instrument}`, 'info', 'Deribit');

        try {
            const params = { instrument_name: instrument };
            const url = this.useProxy
                ? `${PROXY_URL}/deribit?method=get_book_summary_by_instrument&params=${encodeURIComponent(JSON.stringify(params))}`
                : `${DERIBIT_BASE}/public/get_book_summary_by_instrument?instrument_name=${instrument}`;

            const data = await this.fetchWithRetry(url);

            if (!data.result || data.result.length === 0) {
                throw new Error('No data returned from Deribit');
            }

            const item = data.result[0];
            const greeks = {
                delta: item.greeks?.delta || 0,
                gamma: item.greeks?.gamma || 0,
                theta: item.greeks?.theta || 0,
                vega: item.greeks?.vega || 0
            };

            this.log(`✓ Deribit Greeks received`, 'success', 'Deribit');
            return greeks;

        } catch (error) {
            this.log(`✗ Deribit Greeks failed: ${error.message}`, 'error', 'Deribit');
            throw error;
        }
    }

    async fetchBTCSpotPrice() {
        this.log('Querying BTC spot price', 'info', 'OKX');

        try {
            const url = this.useProxy
                ? `${PROXY_URL}/okx/public/mark-price?instType=SPOT&instId=BTC-USDT`
                : `${OKX_BASE}/public/mark-price?instType=SPOT&instId=BTC-USDT`;

            const data = await this.fetchWithRetry(url);

            if (data.code !== '0' || !data.data || data.data.length === 0) {
                throw new Error('Failed to get BTC spot price from OKX');
            }

            const price = parseFloat(data.data[0].markPx);
            this.log(`✓ BTC spot price: $${price.toFixed(2)}`, 'success', 'OKX');
            return price;

        } catch (error) {
            this.log(`✗ BTC spot price failed from OKX: ${error.message}`, 'error', 'OKX');

            try {
                this.log('Falling back to Deribit for BTC spot price', 'fallback', 'Deribit');
                const url = this.useProxy
                    ? `${PROXY_URL}/deribit?method=get_index_price&params=${encodeURIComponent(JSON.stringify({ index_name: 'btc_usd' }))}`
                    : `${DERIBIT_BASE}/public/get_index_price?index_name=btc_usd`;

                const data = await this.fetchWithRetry(url);
                const price = data.result.index_price;
                this.log(`✓ BTC spot price from Deribit: $${price.toFixed(2)}`, 'success', 'Deribit');
                return price;

            } catch (fallbackError) {
                this.log(`✗ Deribit fallback also failed: ${fallbackError.message}`, 'error', 'Deribit');
                throw new Error('All sources failed for BTC spot price');
            }
        }
    }

    async fetchMarkPriceWithFallback(instId) {
        try {
            return {
                price: await this.fetchOKXMarkPrice(instId),
                source: 'OKX'
            };
        } catch (error) {
            this.log('Falling back to Deribit for mark price', 'fallback', 'Deribit');
            try {
                return {
                    price: await this.fetchDeribitMarkPrice(instId),
                    source: 'Deribit'
                };
            } catch (fallbackError) {
                this.log('Both OKX and Deribit failed for mark price', 'error');
                throw new Error('All sources failed');
            }
        }
    }

    async fetchGreeksWithFallback(instId) {
        try {
            return {
                greeks: await this.fetchOKXGreeks(instId),
                source: 'OKX'
            };
        } catch (error) {
            this.log('Falling back to Deribit for Greeks', 'fallback', 'Deribit');
            try {
                return {
                    greeks: await this.fetchDeribitGreeks(instId),
                    source: 'Deribit'
                };
            } catch (fallbackError) {
                this.log('Both OKX and Deribit failed for Greeks', 'error');
                throw new Error('All sources failed');
            }
        }
    }

    convertOKXToDeribit(okxInstId) {
        const parts = okxInstId.split('-');
        if (parts.length !== 5) return okxInstId;

        const [crypto, fiat, date, strike, type] = parts;
        const deribitDate = date.slice(2);
        return `${crypto}-${deribitDate}-${strike}-${type}`;
    }

    async testConnection() {
        this.log('Testing API connections...', 'info');

        try {
            await this.fetchBTCSpotPrice();
            this.log('✓ Connection test successful', 'success');
            return true;
        } catch (error) {
            this.log('✗ Connection test failed', 'error');
            return false;
        }
    }
}

export default DataLayer;
