import fetch from 'node-fetch';

console.log('🧪 Testing OKX API Connection...\n');

async function testOKXDirectly() {
    try {
        console.log('Testing direct OKX access...');
        const response = await fetch('https://www.okx.com/api/v5/public/mark-price?instType=SPOT&instId=BTC-USDT');
        const data = await response.json();

        if (data.code === '0' && data.data && data.data.length > 0) {
            const btcPrice = parseFloat(data.data[0].markPx);
            console.log(`✅ OKX Direct Access: BTC Price = $${btcPrice.toFixed(2)}\n`);
            return true;
        } else {
            console.log('❌ OKX returned unexpected data');
            console.log('Response:', JSON.stringify(data, null, 2));
            return false;
        }
    } catch (error) {
        console.log(`❌ OKX Direct Access Failed: ${error.message}\n`);
        return false;
    }
}

async function testOKXOption() {
    try {
        console.log('Testing OKX option endpoint...');
        const response = await fetch('https://www.okx.com/api/v5/public/mark-price?instType=OPTION&instId=BTC-USD-251129-95000-C');
        const data = await response.json();

        if (data.code === '0' && data.data && data.data.length > 0) {
            const markPx = parseFloat(data.data[0].markPx);
            console.log(`✅ OKX Option Mark Price = ${markPx.toFixed(4)} BTC\n`);
            return true;
        } else {
            console.log('❌ OKX option endpoint returned unexpected data');
            console.log('Response:', JSON.stringify(data, null, 2));
            return false;
        }
    } catch (error) {
        console.log(`❌ OKX Option Access Failed: ${error.message}\n`);
        return false;
    }
}

async function testDeribit() {
    try {
        console.log('Testing Deribit access...');
        const response = await fetch('https://www.deribit.com/api/v2/public/get_index_price?index_name=btc_usd');
        const data = await response.json();

        if (data.result && data.result.index_price) {
            const btcPrice = data.result.index_price;
            console.log(`✅ Deribit Access: BTC Price = $${btcPrice.toFixed(2)}\n`);
            return true;
        } else {
            console.log('❌ Deribit returned unexpected data');
            return false;
        }
    } catch (error) {
        console.log(`❌ Deribit Access Failed: ${error.message}\n`);
        return false;
    }
}

async function runTests() {
    const okxSpot = await testOKXDirectly();
    const okxOption = await testOKXOption();
    const deribit = await testDeribit();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('SUMMARY:');
    console.log(`OKX Spot:    ${okxSpot ? '✅ Working' : '❌ Failed'}`);
    console.log(`OKX Option:  ${okxOption ? '✅ Working' : '❌ Failed'}`);
    console.log(`Deribit:     ${deribit ? '✅ Working' : '❌ Failed'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (okxSpot && okxOption) {
        console.log('✅ All tests passed! Dashboard should work without proxy.');
    } else if (deribit) {
        console.log('⚠️  OKX failed but Deribit works. Fallback will be used.');
    } else {
        console.log('❌ All sources failed. Please check your internet connection.');
        console.log('💡 You may need to run the proxy server for CORS support.');
    }
}

runTests().catch(console.error);
