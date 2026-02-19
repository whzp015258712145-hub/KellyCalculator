#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Kelly Calculator..."

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Install dependencies if missing
if [ ! -d "node_modules" ] || [ ! -f "pnpm-lock.yaml" ]; then
    echo "node_modules or lockfile not found. Installing dependencies..."
    npx pnpm install
fi

# Start the dev server and open browser
echo "Launching Kelly Calculator application..."
npx pnpm dev --open
