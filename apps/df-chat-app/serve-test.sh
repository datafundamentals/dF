#!/bin/bash

# Simple test server for bundle deployment testing
# Serves the df-chat-app directory so you can test the bundle

cd "$(dirname "$0")"

echo "🚀 Starting test server for DF Chat App bundle..."
echo ""
echo "📦 Bundle location: dist/bundle/df-chat-app.js"
echo "🧪 Test page: http://localhost:8080/test-bundle-deploy.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Use Python's built-in HTTP server
if command -v python3 &> /dev/null; then
    python3 -m http.server 8080
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 8080
else
    echo "❌ Error: Python not found. Please install Python or use another HTTP server."
    exit 1
fi
