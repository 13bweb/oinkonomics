#!/bin/bash

# Oinkonomics Development Script
# This script sets up and runs the Oinkonomics application

echo "🐷 Starting Oinkonomics Development Environment..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚙️  Creating .env.local from template..."
    cp env.example .env.local
    echo "⚠️  Please edit .env.local with your actual configuration values!"
    echo "   - Add your RPC endpoints"
    echo "   - Add your server keypair path"
    echo "   - Add your Candy Machine IDs"
    echo ""
    read -p "Press Enter to continue after editing .env.local..."
fi

# Start the development server
echo "🚀 Starting Next.js development server..."
npm run dev
