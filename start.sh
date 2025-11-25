#!/bin/bash

echo "🚀 Starting BTC Options Dashboard..."
echo ""
echo "Starting proxy server on port 3001..."
node proxy-server.js &
PROXY_PID=$!

sleep 2

echo ""
echo "Starting web dashboard on port 3000..."
npm run dev &
DEV_PID=$!

echo ""
echo "✅ Both servers are running!"
echo ""
echo "📊 Dashboard: http://localhost:3000"
echo "🔧 Proxy: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all servers"

trap "kill $PROXY_PID $DEV_PID 2>/dev/null; exit" INT TERM

wait
