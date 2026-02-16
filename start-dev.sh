#!/bin/bash

# CareHub Development Server Startup Script
# This script starts the Next.js development server

cd "$(dirname "$0")"

echo "🏥 Starting CareHub Development Server..."
echo "📂 Current directory: $(pwd)"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🚀 Starting server on http://localhost:3000"
npm run dev
