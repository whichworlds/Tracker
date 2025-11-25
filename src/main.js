import DataLayer from './dataLayer.js';

class BTCOptionsDashboard {
    constructor() {
        this.dataLayer = new DataLayer();
        this.positions = {
            long: null,
            short: null,
            spot: null
        };
        this.realizedPNL = 0;
        this.btcPrice = 0;
        this.updateInterval = null;

        this.init();
    }

    async init() {
        this.setupDebugger();
        this.setupEventListeners();
        this.loadFromLocalStorage();
        await this.startPriceUpdates();
        this.render();
    }

    setupDebugger() {
        this.dataLayer.onDebug((entry) => {
            this.addDebugEntry(entry);
            this.updateConnectionStatus(entry);
        });
    }

    setupEventListeners() {
        const useSpotToggle = document.getElementById('useSpotBTC');
        useSpotToggle.addEventListener('change', (e) => {
            const longLeapInputs = document.getElementById('longLeapInputs');
            const longSpotInputs = document.getElementById('longSpotInputs');

            if (e.target.checked) {
                longLeapInputs.style.display = 'none';
                longSpotInputs.style.display = 'block';
            } else {
                longLeapInputs.style.display = 'block';
                longSpotInputs.style.display = 'none';
            }
        });

        document.getElementById('addLongPosition').addEventListener('click', () => {
            this.addLongPosition();
        });

        document.getElementById('addShortPosition').addEventListener('click', () => {
            this.addShortPosition();
        });

        document.getElementById('toggleDebug').addEventListener('click', () => {
            const debugWindow = document.getElementById('debugWindow');
            const btn = document.getElementById('toggleDebug');
            if (debugWindow.style.display === 'none') {
                debugWindow.style.display = 'block';
                btn.textContent = 'Hide Debug Window';
            } else {
                debugWindow.style.display = 'none';
                btn.textContent = 'Show Debug Window';
            }
        });

        document.getElementById('closeDebug').addEventListener('click', () => {
            document.getElementById('debugWindow').style.display = 'none';
            document.getElementById('toggleDebug').textContent = 'Show Debug Window';
        });
    }

    addLongPosition() {
        const useSpot = document.getElementById('useSpotBTC').checked;

        if (useSpot) {
            const entryPrice = parseFloat(document.getElementById('spotEntryPrice').value);
            const amount = parseFloat(document.getElementById('spotAmount').value);

            if (!entryPrice || !amount) {
                alert('Please fill in all spot BTC fields');
                return;
            }

            this.positions.spot = {
                type: 'spot',
                entryPrice,
                amount
            };

            this.positions.long = null;

        } else {
            const instId = document.getElementById('longInstId').value.trim();
            const entryPrice = parseFloat(document.getElementById('longEntryPrice').value);
            const amount = parseFloat(document.getElementById('longAmount').value);
            const contractSize = parseFloat(document.getElementById('longContractSize').value);

            if (!instId || !entryPrice || !amount || !contractSize) {
                alert('Please fill in all long position fields');
                return;
            }

            this.positions.long = {
                type: 'long',
                instId,
                entryPrice,
                amount,
                contractSize,
                markPrice: 0,
                greeks: { delta: 0, gamma: 0, theta: 0, vega: 0 },
                source: null,
                lastUpdate: null
            };

            this.positions.spot = null;
        }

        this.saveToLocalStorage();
        this.render();
    }

    addShortPosition() {
        const instId = document.getElementById('shortInstId').value.trim();
        const entryPrice = parseFloat(document.getElementById('shortEntryPrice').value);
        const amount = parseFloat(document.getElementById('shortAmount').value);
        const contractSize = parseFloat(document.getElementById('shortContractSize').value);

        if (!instId || !entryPrice || !amount || !contractSize) {
            alert('Please fill in all short position fields');
            return;
        }

        this.positions.short = {
            type: 'short',
            instId,
            entryPrice,
            amount,
            contractSize,
            markPrice: 0,
            greeks: { delta: 0, gamma: 0, theta: 0, vega: 0 },
            source: null,
            lastUpdate: null
        };

        this.saveToLocalStorage();
        this.render();
    }

    async startPriceUpdates() {
        await this.updateAllPrices();

        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateInterval = setInterval(() => {
            this.updateAllPrices();
        }, 10000);
    }

    async updateAllPrices() {
        try {
            this.btcPrice = await this.dataLayer.fetchBTCSpotPrice();

            if (this.positions.long) {
                await this.updatePosition(this.positions.long);
            }

            if (this.positions.short) {
                await this.updatePosition(this.positions.short);
            }

            this.render();

        } catch (error) {
            console.error('Error updating prices:', error);
        }
    }

    async updatePosition(position) {
        try {
            const [markData, greeksData] = await Promise.all([
                this.dataLayer.fetchMarkPriceWithFallback(position.instId),
                this.dataLayer.fetchGreeksWithFallback(position.instId)
            ]);

            position.markPrice = markData.price;
            position.greeks = greeksData.greeks;
            position.source = markData.source;
            position.lastUpdate = new Date();

        } catch (error) {
            console.error(`Error updating position ${position.instId}:`, error);
        }
    }

    calculatePNL() {
        let longPNL = 0;
        let shortPNL = 0;

        if (this.positions.spot) {
            const spot = this.positions.spot;
            const btcPNL = ((this.btcPrice - spot.entryPrice) / this.btcPrice) * spot.amount;
            longPNL = btcPNL;
        } else if (this.positions.long) {
            const long = this.positions.long;
            longPNL = (long.markPrice - long.entryPrice) * long.amount * long.contractSize;
        }

        if (this.positions.short) {
            const short = this.positions.short;
            shortPNL = (short.entryPrice - short.markPrice) * short.amount * short.contractSize;
        }

        const totalLive = longPNL + shortPNL;
        const totalPNL = totalLive + this.realizedPNL;

        return { longPNL, shortPNL, totalLive, totalPNL };
    }

    calculateGreeks() {
        let totalDelta = 0;
        let totalGamma = 0;
        let totalTheta = 0;
        let totalVega = 0;

        if (this.positions.spot) {
            totalDelta = this.positions.spot.amount;
        } else if (this.positions.long) {
            const long = this.positions.long;
            totalDelta += long.greeks.delta * long.amount * long.contractSize;
            totalGamma += long.greeks.gamma * long.amount * long.contractSize;
            totalTheta += long.greeks.theta * long.amount * long.contractSize;
            totalVega += long.greeks.vega * long.amount * long.contractSize;
        }

        if (this.positions.short) {
            const short = this.positions.short;
            totalDelta -= short.greeks.delta * short.amount * short.contractSize;
            totalGamma -= short.greeks.gamma * short.amount * short.contractSize;
            totalTheta -= short.greeks.theta * short.amount * short.contractSize;
            totalVega -= short.greeks.vega * short.amount * short.contractSize;
        }

        return { totalDelta, totalGamma, totalTheta, totalVega };
    }

    closePosition(positionType) {
        if (!confirm(`Are you sure you want to close the ${positionType} position?`)) {
            return;
        }

        const closingPrice = prompt(`Enter closing price in BTC:`);
        if (!closingPrice) return;

        const price = parseFloat(closingPrice);
        if (isNaN(price)) {
            alert('Invalid price');
            return;
        }

        const position = this.positions[positionType];
        let pnl = 0;

        if (positionType === 'spot') {
            const btcPNL = ((this.btcPrice - position.entryPrice) / this.btcPrice) * position.amount;
            pnl = btcPNL;
        } else if (positionType === 'long') {
            pnl = (price - position.entryPrice) * position.amount * position.contractSize;
        } else if (positionType === 'short') {
            pnl = (position.entryPrice - price) * position.amount * position.contractSize;
        }

        this.realizedPNL += pnl;
        this.positions[positionType] = null;

        this.saveToLocalStorage();
        this.render();

        alert(`Position closed. PNL: ${pnl.toFixed(4)} BTC ($${(pnl * this.btcPrice).toFixed(2)})`);
    }

    rollPosition(positionType) {
        const rollDiv = document.getElementById(`roll-${positionType}`);
        rollDiv.classList.toggle('active');
    }

    executeRoll(positionType) {
        const newInstId = document.getElementById(`roll-${positionType}-instId`).value.trim();
        const newEntryPrice = parseFloat(document.getElementById(`roll-${positionType}-price`).value);
        const closingPrice = parseFloat(document.getElementById(`roll-${positionType}-closing`).value);

        if (!newInstId || !newEntryPrice || !closingPrice) {
            alert('Please fill in all rolling fields');
            return;
        }

        const position = this.positions[positionType];
        let pnl = 0;

        if (positionType === 'long') {
            pnl = (closingPrice - position.entryPrice) * position.amount * position.contractSize;
        } else if (positionType === 'short') {
            pnl = (position.entryPrice - closingPrice) * position.amount * position.contractSize;
        }

        this.realizedPNL += pnl;

        position.instId = newInstId;
        position.entryPrice = newEntryPrice;
        position.markPrice = 0;
        position.greeks = { delta: 0, gamma: 0, theta: 0, vega: 0 };

        this.saveToLocalStorage();
        this.updateAllPrices();

        document.getElementById(`roll-${positionType}`).classList.remove('active');
        this.render();
    }

    render() {
        this.renderActivePositions();
        this.renderSummary();
    }

    renderActivePositions() {
        const container = document.getElementById('activePositions');
        const hasPositions = this.positions.long || this.positions.short || this.positions.spot;

        if (!hasPositions) {
            container.innerHTML = '<p class="empty-state">No active positions. Add positions above to get started.</p>';
            return;
        }

        let html = '';

        if (this.positions.spot) {
            html += this.renderSpotPosition(this.positions.spot);
        } else if (this.positions.long) {
            html += this.renderOptionPosition(this.positions.long, 'long');
        }

        if (this.positions.short) {
            html += this.renderOptionPosition(this.positions.short, 'short');
        }

        container.innerHTML = html;

        if (this.positions.long) {
            this.attachPositionEventListeners('long');
        }
        if (this.positions.short) {
            this.attachPositionEventListeners('short');
        }
        if (this.positions.spot) {
            document.getElementById('close-spot').addEventListener('click', () => this.closePosition('spot'));
        }
    }

    renderSpotPosition(position) {
        const btcPNL = ((this.btcPrice - position.entryPrice) / this.btcPrice) * position.amount;
        const usdPNL = btcPNL * this.btcPrice;
        const pnlClass = btcPNL >= 0 ? 'positive' : 'negative';

        return `
            <div class="position-card spot">
                <div class="position-header">
                    <div class="position-title">Spot BTC</div>
                    <span class="position-badge spot">SPOT</span>
                </div>

                <div class="position-details">
                    <div class="detail-item">
                        <span class="detail-label">Entry Price:</span>
                        <span class="detail-value">$${position.entryPrice.toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Current Price:</span>
                        <span class="detail-value">$${this.btcPrice.toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Amount:</span>
                        <span class="detail-value">${position.amount.toFixed(4)} BTC</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Delta:</span>
                        <span class="detail-value">${position.amount.toFixed(4)} (1.0 × amount)</span>
                    </div>
                </div>

                <div class="pnl-display ${pnlClass}">
                    <div class="pnl-btc">${btcPNL >= 0 ? '+' : ''}${btcPNL.toFixed(4)} BTC</div>
                    <div class="pnl-usd">($${usdPNL >= 0 ? '+' : ''}${usdPNL.toFixed(2)})</div>
                </div>

                <div class="position-actions">
                    <button class="btn btn-danger" id="close-spot">Close Position</button>
                </div>
            </div>
        `;
    }

    renderOptionPosition(position, type) {
        const pnl = type === 'long'
            ? (position.markPrice - position.entryPrice) * position.amount * position.contractSize
            : (position.entryPrice - position.markPrice) * position.amount * position.contractSize;

        const usdPNL = pnl * this.btcPrice;
        const pnlClass = pnl >= 0 ? 'positive' : 'negative';

        return `
            <div class="position-card ${type}">
                <div class="position-header">
                    <div class="position-title">${position.instId}</div>
                    <span class="position-badge ${type}">${type.toUpperCase()}</span>
                </div>

                <div class="position-details">
                    <div class="detail-item">
                        <span class="detail-label">Entry Price:</span>
                        <span class="detail-value">${position.entryPrice.toFixed(4)} BTC</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Mark Price:</span>
                        <span class="detail-value">${position.markPrice.toFixed(4)} BTC</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Amount:</span>
                        <span class="detail-value">${position.amount}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Contract Size:</span>
                        <span class="detail-value">${position.contractSize} BTC</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Source:</span>
                        <span class="detail-value">
                            <span class="source-badge ${position.source?.toLowerCase()}">${position.source || 'N/A'}</span>
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Last Update:</span>
                        <span class="detail-value">${position.lastUpdate ? new Date(position.lastUpdate).toLocaleTimeString() : 'N/A'}</span>
                    </div>
                </div>

                <div class="greeks-section">
                    <div class="greeks-grid">
                        <div><strong>Δ:</strong> ${position.greeks.delta.toFixed(4)}</div>
                        <div><strong>Γ:</strong> ${position.greeks.gamma.toFixed(4)}</div>
                        <div><strong>θ:</strong> ${position.greeks.theta.toFixed(4)}</div>
                        <div><strong>ν:</strong> ${position.greeks.vega.toFixed(4)}</div>
                    </div>
                </div>

                <div class="pnl-display ${pnlClass}">
                    <div class="pnl-btc">${pnl >= 0 ? '+' : ''}${pnl.toFixed(4)} BTC</div>
                    <div class="pnl-usd">($${usdPNL >= 0 ? '+' : ''}${usdPNL.toFixed(2)})</div>
                </div>

                <div class="position-actions">
                    <button class="btn btn-danger" id="close-${type}">Close Position</button>
                    <button class="btn btn-success" id="roll-${type}-btn">Roll Position</button>
                </div>

                <div class="rolling-inputs" id="roll-${type}">
                    <h4>Roll to New Position</h4>
                    <div class="input-row">
                        <label>Closing Price (BTC):</label>
                        <input type="number" id="roll-${type}-closing" placeholder="0.003" step="0.0001">
                    </div>
                    <div class="input-row">
                        <label>New Contract (instId):</label>
                        <input type="text" id="roll-${type}-instId" placeholder="BTC-USD-251128-95000-C">
                    </div>
                    <div class="input-row">
                        <label>New Entry Price (BTC):</label>
                        <input type="number" id="roll-${type}-price" placeholder="0.003" step="0.0001">
                    </div>
                    <button class="btn btn-primary" id="execute-roll-${type}">Execute Roll</button>
                </div>
            </div>
        `;
    }

    attachPositionEventListeners(type) {
        document.getElementById(`close-${type}`).addEventListener('click', () => this.closePosition(type));
        document.getElementById(`roll-${type}-btn`).addEventListener('click', () => this.rollPosition(type));
        document.getElementById(`execute-roll-${type}`).addEventListener('click', () => this.executeRoll(type));
    }

    renderSummary() {
        const pnl = this.calculatePNL();
        const greeks = this.calculateGreeks();

        this.updateSummaryValue('longPNL', pnl.longPNL);
        this.updateSummaryValue('shortPNL', pnl.shortPNL);
        this.updateSummaryValue('totalLivePNL', pnl.totalLive);
        this.updateSummaryValue('realizedPNL', this.realizedPNL);
        this.updateSummaryValue('totalPNL', pnl.totalPNL);

        document.getElementById('totalDelta').textContent = greeks.totalDelta.toFixed(4);
        document.getElementById('totalGamma').textContent = greeks.totalGamma.toFixed(4);
        document.getElementById('totalTheta').textContent = greeks.totalTheta.toFixed(4);
        document.getElementById('totalVega').textContent = greeks.totalVega.toFixed(4);
    }

    updateSummaryValue(elementId, btcValue) {
        const element = document.getElementById(elementId);
        const usdValue = btcValue * this.btcPrice;

        const btcSpan = element.querySelector('.btc-value');
        const usdSpan = element.querySelector('.usd-value');

        btcSpan.textContent = `${btcValue >= 0 ? '+' : ''}${btcValue.toFixed(4)} BTC`;
        usdSpan.textContent = `($${usdValue >= 0 ? '+' : ''}${usdValue.toFixed(2)})`;

        btcSpan.style.color = btcValue >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)';
    }

    addDebugEntry(entry) {
        const debugContent = document.getElementById('debugContent');
        const entryDiv = document.createElement('div');
        entryDiv.className = `debug-entry ${entry.type}`;

        const timestamp = new Date(entry.timestamp).toLocaleTimeString();
        const sourceBadge = entry.source ? `<span class="source-badge ${entry.source.toLowerCase()}">${entry.source}</span>` : '';

        entryDiv.innerHTML = `
            <span class="timestamp">[${timestamp}]</span> ${entry.message} ${sourceBadge}
        `;

        debugContent.appendChild(entryDiv);
        debugContent.scrollTop = debugContent.scrollHeight;

        while (debugContent.children.length > 100) {
            debugContent.removeChild(debugContent.firstChild);
        }
    }

    updateConnectionStatus(entry) {
        const statusElement = document.getElementById('connectionStatus');
        const dot = statusElement.querySelector('.status-dot');
        const text = statusElement.querySelector('.status-text');

        if (entry.type === 'success' && entry.source) {
            dot.className = 'status-dot connected';
            text.textContent = `Connected to ${entry.source}`;
        } else if (entry.type === 'error') {
            dot.className = 'status-dot error';
            text.textContent = 'Connection Error';
        } else if (entry.type === 'fallback') {
            dot.className = 'status-dot connected';
            text.textContent = `Fallback active: using ${entry.source}`;
        }
    }

    saveToLocalStorage() {
        const data = {
            positions: this.positions,
            realizedPNL: this.realizedPNL
        };
        localStorage.setItem('btc-options-dashboard', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const stored = localStorage.getItem('btc-options-dashboard');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.positions = data.positions || { long: null, short: null, spot: null };
                this.realizedPNL = data.realizedPNL || 0;
            } catch (error) {
                console.error('Error loading from localStorage:', error);
            }
        }
    }
}

new BTCOptionsDashboard();
